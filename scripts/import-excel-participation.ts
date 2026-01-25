import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'

const prisma = new PrismaClient()

// 프로그램 매핑 (Excel 파일명 → DB Program ID)
const PROGRAM_MAPPING: Record<string, string> = {
  '[출석부] 시즌24 마음힐링 독서모임.xlsx': 'cmkcrsynh0002n1qxtb2y8zsc',
  '[출석부] 시즌25 진실과 거짓.xlsx': 'cmkcrsxjv0000n1qx5d3a3jtr',
  '[출석부] 시즌26 Ai와 생존하기 독서모임.xlsx': 'cmkcrsxjv0000n1qx5d3a3jtr',
  '[온라인시즌12] 출석부.xlsx': 'cmkcrtbca000qn1qxabqlhrck',
  '[온라인시즌13] 출석부.xlsx': 'cmkcrtas9000pn1qx6gjk84ap',
  '온라인시즌13_출석부.xlsx': 'cmkcrtas9000pn1qx6gjk84ap',
}

// Excel 파일 경로
const EXCEL_DIR = '/home/seoyoon/다운로드'

interface AttendanceData {
  name: string
  origin: string | null
  sessions: {
    sessionNumber: number
    attended: boolean
    reportSubmitted: boolean
  }[]
}

interface MatchResult {
  memberId: string | null
  memberName: string
  memberCode: string | null
  created: boolean
  needsReview: boolean
  message: string
}

interface AttendanceSaveResult {
  created: number
  updated: number
  skipped: number
}

/**
 * 회원 코드 생성 (YY-YYMM-NN 형식)
 * 출생년도2자리-가입년월-순번
 * 예: 00-2501-01 (출생년도 없음, 2025년 1월 가입, 첫 번째)
 */
async function generateMemberCode(
  birthYear: number | null,
  joinDate: Date
): Promise<string> {
  // 출생년도 코드 (없으면 00)
  const birthCode = birthYear ? String(birthYear).slice(-2) : '00'

  // 가입년월 (YYMM)
  const year = String(joinDate.getFullYear()).slice(-2)
  const month = String(joinDate.getMonth() + 1).padStart(2, '0')
  const yearMonth = year + month

  // 같은 조건의 기존 회원 수 조회하여 순번 결정
  const prefix = `${birthCode}-${yearMonth}-`
  const existingCount = await prisma.member.count({
    where: {
      memberCode: { startsWith: prefix },
    },
  })

  // 순번 (01, 02, ...)
  const sequence = String(existingCount + 1).padStart(2, '0')

  return `${birthCode}-${yearMonth}-${sequence}`
}

// 이름에서 괄호 제거 (예: "김진미(김다예)" → "김진미")
function cleanName(name: string): string {
  return name.replace(/\(.*?\)/g, '').trim()
}

// 고향 정규화 (trim, lowercase)
function normalizeOrigin(origin: string | null): string | null {
  if (!origin) return null
  return origin.trim().toLowerCase()
}

// 회원 매칭 또는 생성
async function findOrCreateMember(
  name: string,
  origin: string | null,
  dryRun: boolean
): Promise<MatchResult> {
  const cleanedName = cleanName(name)
  const normalizedOrigin = normalizeOrigin(origin)

  // 1. 이름으로 매칭 (원본 이름과 정리된 이름 둘 다 시도)
  let membersByName = await prisma.member.findMany({
    where: { name: cleanedName },
  })

  // 원본 이름으로도 시도
  if (membersByName.length === 0 && cleanedName !== name.trim()) {
    membersByName = await prisma.member.findMany({
      where: { name: name.trim() },
    })
  }

  if (membersByName.length === 1) {
    return {
      memberId: membersByName[0].id,
      memberName: membersByName[0].name,
      memberCode: membersByName[0].memberCode,
      created: false,
      needsReview: false,
      message: `이름으로 매칭됨`,
    }
  }

  if (membersByName.length > 1) {
    // 동명이인이 있는 경우, 고향으로 추가 매칭
    if (normalizedOrigin) {
      const memberByOrigin = membersByName.find(m => {
        const memberOrigin = normalizeOrigin(m.origin)
        const memberHometown = normalizeOrigin(m.hometown)
        return memberOrigin === normalizedOrigin || memberHometown === normalizedOrigin
      })
      if (memberByOrigin) {
        return {
          memberId: memberByOrigin.id,
          memberName: memberByOrigin.name,
          memberCode: memberByOrigin.memberCode,
          created: false,
          needsReview: false,
          message: `이름+고향으로 매칭됨 (동명이인 ${membersByName.length}명 중)`,
        }
      }
    }
    // 고향으로도 구분 안 되면 수동 확인 필요 표시
    return {
      memberId: null,
      memberName: cleanedName,
      memberCode: null,
      created: false,
      needsReview: true,
      message: `⚠️ 동명이인 ${membersByName.length}명 - 수동 확인 필요`,
    }
  }

  // 매칭 실패 시 신규 회원 생성
  if (dryRun) {
    return {
      memberId: null,
      memberName: cleanedName,
      memberCode: null,
      created: true,
      needsReview: false,
      message: `🆕 신규 회원 생성 예정`,
    }
  }

  const memberCode = await generateMemberCode(null, new Date())
  const newMember = await prisma.member.create({
    data: {
      memberCode,
      name: cleanedName,
      origin: origin || undefined,
      hometown: origin || undefined,
      grade: 'NEW',
      status: 'ACTIVE',
    },
  })

  // MemberStats 초기화
  await prisma.memberStats.create({
    data: {
      memberId: newMember.id,
    },
  })

  return {
    memberId: newMember.id,
    memberName: newMember.name,
    memberCode: newMember.memberCode,
    created: true,
    needsReview: false,
    message: `🆕 신규 회원 생성됨 (${memberCode})`,
  }
}

// 출석부 파일 파싱
function parseAttendanceFile(filePath: string): AttendanceData[] {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const results: AttendanceData[] = []

  // 헤더 행 찾기 (번호, 이름이 있는 행)
  let headerRow = -1
  let dataStartRow = -1

  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    if (row && row[0] === '번호' && row[1] === '이름') {
      headerRow = i
      // 출석/독후감 서브헤더가 있는지 확인
      for (let j = i + 1; j < Math.min(i + 5, data.length); j++) {
        if (data[j] && data[j][4] === '출석') {
          dataStartRow = j + 1
          break
        }
      }
      if (dataStartRow === -1) {
        dataStartRow = headerRow + 2 // 기본값
      }
      break
    }
  }

  if (headerRow === -1) {
    console.error(`헤더를 찾을 수 없음: ${filePath}`)
    return results
  }

  // 회차 수 계산 (4열부터 출석/독후감 쌍)
  // 헤더 형식: "1회(9/10)" 또는 "5/11\n권윤지" 또는 날짜 형식
  const headerCells = data[headerRow]
  let sessionCount = 0
  for (let col = 4; col < headerCells.length; col += 2) {
    const cell = headerCells[col]
    if (cell && typeof cell === 'string') {
      // "회"가 포함되거나, 날짜 형식(숫자/숫자)이거나, 뭔가 값이 있으면 회차로 간주
      if (cell.includes('회') || /\d+\/\d+/.test(cell) || cell.trim().length > 0) {
        sessionCount++
      }
    } else if (cell !== undefined && cell !== null && cell !== '') {
      sessionCount++
    }
  }

  console.log(`  - 발견된 회차 수: ${sessionCount}`)

  // 데이터 행 파싱
  for (let i = dataStartRow; i < data.length; i++) {
    const row = data[i]
    if (!row || !row[1]) continue // 이름이 없으면 스킵

    const number = row[0]
    if (typeof number !== 'number' || isNaN(number)) continue // 번호가 숫자가 아니면 스킵 (합계 행 등)

    const name = String(row[1]).trim()
    const origin = row[3] ? String(row[3]).trim() : null

    const sessions: AttendanceData['sessions'] = []

    // 각 회차의 출석/독후감 데이터 (4열부터 2열씩)
    for (let s = 0; s < sessionCount; s++) {
      const attendedCol = 4 + (s * 2)
      const reportCol = 5 + (s * 2)

      const attendedVal = row[attendedCol]
      const reportVal = row[reportCol]

      // 출석: 1, '1', '지각', '1(혹은 지각)' 등은 출석으로 처리
      const attended = attendedVal === 1 || attendedVal === '1' ||
        (typeof attendedVal === 'string' && (attendedVal.includes('지각') || attendedVal.startsWith('1')))

      // 독후감: 1 또는 '1'이면 제출
      const reportSubmitted = reportVal === 1 || reportVal === '1'

      sessions.push({
        sessionNumber: s + 1,
        attended,
        reportSubmitted,
      })
    }

    results.push({ name, origin, sessions })
  }

  return results
}

// 출석 데이터 저장 (신규/업데이트/스킵 구분)
async function saveAttendance(
  memberId: string,
  programId: string,
  sessions: AttendanceData['sessions'],
  dryRun: boolean
): Promise<AttendanceSaveResult> {
  const result: AttendanceSaveResult = {
    created: 0,
    updated: 0,
    skipped: 0,
  }

  for (const session of sessions) {
    // 이미 존재하는지 확인
    const existing = await prisma.memberAttendance.findUnique({
      where: {
        memberId_programId_sessionNumber: {
          memberId,
          programId,
          sessionNumber: session.sessionNumber,
        },
      },
    })

    if (existing) {
      // 기존 데이터와 동일하면 스킵
      if (existing.attended === session.attended && existing.reportSubmitted === session.reportSubmitted) {
        result.skipped++
        continue
      }

      // 변경된 데이터만 업데이트
      if (!dryRun) {
        await prisma.memberAttendance.update({
          where: { id: existing.id },
          data: {
            attended: session.attended,
            reportSubmitted: session.reportSubmitted,
          },
        })
      }
      result.updated++
    } else {
      // 신규 생성
      if (!dryRun) {
        await prisma.memberAttendance.create({
          data: {
            memberId,
            programId,
            sessionNumber: session.sessionNumber,
            attended: session.attended,
            reportSubmitted: session.reportSubmitted,
          },
        })
      }
      result.created++
    }
  }

  return result
}

// MemberStats 재계산 (member-stats 서비스 로직 적용)
async function recalculateMemberStats(memberId: string): Promise<void> {
  // 회원의 모든 출석 기록 조회
  const attendances = await prisma.memberAttendance.findMany({
    where: { memberId },
    include: {
      program: {
        select: { id: true, title: true },
      },
    },
  })

  // 참여한 프로그램 ID 집합 (중복 제거)
  const programIds = new Set(attendances.map(a => a.programId))

  // 통계 계산
  const totalPrograms = programIds.size
  const totalSessions = attendances.length
  const totalAttended = attendances.filter(a => a.attended).length
  const totalAbsent = attendances.filter(a => !a.attended).length
  const totalReports = attendances.filter(a => a.reportSubmitted).length

  // 비율 계산 (반올림 처리)
  const attendanceRate = totalSessions > 0
    ? Math.round((totalAttended / totalSessions) * 1000) / 10
    : 0
  const reportRate = totalSessions > 0
    ? Math.round((totalReports / totalSessions) * 1000) / 10
    : 0

  // 노쇼 횟수 (결석 횟수를 노쇼로 간주)
  const noShowCount = totalAbsent

  // 마지막 참여일
  const lastAttendance = attendances
    .filter(a => a.attended && a.sessionDate)
    .sort((a, b) => (b.sessionDate?.getTime() || 0) - (a.sessionDate?.getTime() || 0))[0]

  await prisma.memberStats.upsert({
    where: { memberId },
    update: {
      totalPrograms,
      totalSessions,
      totalBooks: totalPrograms,
      totalAttended,
      totalAbsent,
      totalReports,
      attendanceRate,
      reportRate,
      noShowCount,
      lastParticipatedAt: lastAttendance?.sessionDate || null,
    },
    create: {
      memberId,
      totalPrograms,
      totalSessions,
      totalBooks: totalPrograms,
      totalAttended,
      totalAbsent,
      totalReports,
      attendanceRate,
      reportRate,
      noShowCount,
      lastParticipatedAt: lastAttendance?.sessionDate || null,
    },
  })
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--execute')

  console.log('='.repeat(60))
  console.log('Excel 출석부 데이터 임포트')
  console.log(dryRun ? '🔍 DRY RUN 모드 (실제 저장 안 함)' : '✅ EXECUTE 모드 (실제 저장)')
  console.log('='.repeat(60))

  const stats = {
    totalFiles: 0,
    totalMembers: 0,
    matchedMembers: 0,
    createdMembers: 0,
    duplicatesNeedReview: 0,
    attendancesCreated: 0,
    attendancesUpdated: 0,
    attendancesSkipped: 0,
  }

  const updatedMemberIds: string[] = []
  const needsReviewList: { name: string; origin: string | null; file: string }[] = []

  for (const [fileName, programId] of Object.entries(PROGRAM_MAPPING)) {
    const filePath = path.join(EXCEL_DIR, fileName)

    console.log(`\n📁 처리 중: ${fileName}`)
    console.log(`   프로그램 ID: ${programId}`)

    // 프로그램 확인
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, title: true },
    })

    if (!program) {
      console.log(`   ❌ 프로그램을 찾을 수 없음`)
      continue
    }

    console.log(`   프로그램: ${program.title}`)

    try {
      const attendanceData = parseAttendanceFile(filePath)
      console.log(`   참가자 수: ${attendanceData.length}명`)

      stats.totalFiles++

      for (const data of attendanceData) {
        const matchResult = await findOrCreateMember(data.name, data.origin, dryRun)

        console.log(`   - ${data.name} (${data.origin || '?'}): ${matchResult.message}`)

        stats.totalMembers++

        if (matchResult.needsReview) {
          stats.duplicatesNeedReview++
          needsReviewList.push({
            name: data.name,
            origin: data.origin,
            file: fileName,
          })
        } else if (matchResult.created) {
          stats.createdMembers++
        } else {
          stats.matchedMembers++
        }

        if (matchResult.memberId) {
          const saveResult = await saveAttendance(
            matchResult.memberId,
            programId,
            data.sessions,
            dryRun
          )
          stats.attendancesCreated += saveResult.created
          stats.attendancesUpdated += saveResult.updated
          stats.attendancesSkipped += saveResult.skipped

          if (!updatedMemberIds.includes(matchResult.memberId)) {
            updatedMemberIds.push(matchResult.memberId)
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ 파일 처리 오류: ${error}`)
    }
  }

  // MemberStats 재계산
  if (!dryRun) {
    console.log(`\n📊 MemberStats 재계산 중...`)
    for (const memberId of updatedMemberIds) {
      await recalculateMemberStats(memberId)
    }
    console.log(`   ${updatedMemberIds.length}명의 통계 업데이트 완료`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 최종 결과')
  console.log('='.repeat(60))
  console.log(`처리된 파일: ${stats.totalFiles}개`)
  console.log(`총 참가자: ${stats.totalMembers}명`)
  console.log(`  - 매칭 성공: ${stats.matchedMembers}명`)
  console.log(`  - 신규 생성: ${stats.createdMembers}명`)
  console.log(`  - 수동 확인 필요: ${stats.duplicatesNeedReview}명`)
  console.log(`출석 레코드:`)
  console.log(`  - 신규 생성: ${stats.attendancesCreated}건`)
  console.log(`  - 업데이트: ${stats.attendancesUpdated}건`)
  console.log(`  - 스킵 (변경없음): ${stats.attendancesSkipped}건`)

  // 수동 확인 필요 목록 출력
  if (needsReviewList.length > 0) {
    console.log('\n' + '='.repeat(60))
    console.log('⚠️  수동 확인 필요 목록')
    console.log('='.repeat(60))
    for (const item of needsReviewList) {
      console.log(`  - ${item.name} (${item.origin || '고향 없음'}) - 파일: ${item.file}`)
    }
  }

  if (dryRun) {
    console.log('\n⚠️  실제 저장하려면 --execute 옵션을 사용하세요:')
    console.log('   npx tsx scripts/import-excel-participation.ts --execute')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
