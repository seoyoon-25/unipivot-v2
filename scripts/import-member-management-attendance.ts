import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

// Excel 파일 경로
const EXCEL_FILE = '/home/seoyoon/다운로드/회원관리_2025년.xlsx'

// 프로그램명 → DB Program ID 매핑
const PROGRAM_MAPPING: Record<string, string> = {
  // 오프라인 독서모임
  '[2022] 시즌19-1 남북청년이 함께 살고 싶은 대한민국을 그리다': 'cmkcrt0rw0006n1qx3q4n38hf', // [시즌19]
  '[2022] 시즌19-2 4차 산업혁명': 'cmkcrt0rw0006n1qx3q4n38hf', // [시즌19] - 같은 시즌
  '[2022] 시즌20 전쟁과 우리의 삶, 평화를 지키는 방법': 'cmkcrt08v0005n1qx93o1sgz7', // [시즌20]
  '[2023] 시즌21 고립의 시대 환대를 논하다': 'cmkcrszpr0004n1qxm43xmd4i', // [시즌21]
  '[2023] 시즌23 분단과 사람 독서모임': 'cmkcrsz6o0003n1qxnleaww49', // [시즌22] - 시즌23이 DB에 없어서 시즌22에 매핑
  '[2024] 시즌24 마음힐링': 'cmkcrsynh0002n1qxtb2y8zsc', // [시즌24]
  '[2025] 시즌25 진실과 거짓에 대한 분별력을 키우는 독서모임': 'cmkcrsy380001n1qxo9e6ciqv', // [시즌25]
  // 온라인 독서모임
  '[2024] 시즌9  초집중 훈련': 'cmkcrtcyx000tn1qxjj1tpe1n', // [온라인 시즌9]
  // 기타 프로그램 - 고립에서 환대는 시즌21과 같은 주제
  '[2023] 고립에서 환대': 'cmkcrszpr0004n1qxm43xmd4i', // [시즌21]
  // 세미나
  '[2024] 10주 안에 끝내는 책쓰기': 'cmkcsrp7f0001kq3q1qckatov', // 책쓰기 세미나
  // 미매핑 (DB에 프로그램 없음)
  '[2023] SEX AND LOVE': '', // 별도 프로그램 - 스킵
}

interface AttendanceRecord {
  programName: string
  sessionNumber: number
  sessionDate: Date | null
  memberName: string
  attended: boolean
  reportSubmitted: boolean
}

/**
 * 이름에서 출생년도 분리 (예: "이수림1996" → "이수림")
 */
function extractName(nameWithYear: string): string {
  // 끝에 4자리 숫자가 있으면 제거
  return nameWithYear.replace(/\d{4}$/, '').trim()
}

/**
 * 회차 문자열에서 숫자 추출 (예: "1회" → 1)
 */
function extractSessionNumber(session: string): number {
  const match = String(session).match(/(\d+)/)
  return match ? parseInt(match[1]) : 1
}

/**
 * Excel 날짜 숫자를 Date로 변환
 */
function excelDateToJS(excelDate: number): Date | null {
  if (!excelDate || typeof excelDate !== 'number') return null
  // Excel 날짜는 1900년 1월 1일부터의 일수 (윤년 버그 포함)
  const date = new Date((excelDate - 25569) * 86400 * 1000)
  return date
}

/**
 * 출석부 시트에서 데이터 추출
 */
function extractAttendanceData(): AttendanceRecord[] {
  const workbook = XLSX.readFile(EXCEL_FILE)
  const sheet = workbook.Sheets['출석부']
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const results: AttendanceRecord[] = []

  // 헤더 스킵, 데이터 행 처리
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row || !row[3] || !row[6]) continue // 프로그램명, 이름 필수

    const attended = row[1] === 1 || row[1] === '1'
    const reportSubmitted = row[2] === 1 || row[2] === '1'
    const programName = String(row[3]).trim()
    const sessionStr = row[4] ? String(row[4]) : '1회'
    const dateValue = row[5]
    const nameWithYear = String(row[6]).trim()

    results.push({
      programName,
      sessionNumber: extractSessionNumber(sessionStr),
      sessionDate: typeof dateValue === 'number' ? excelDateToJS(dateValue) : null,
      memberName: extractName(nameWithYear),
      attended,
      reportSubmitted,
    })
  }

  return results
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--execute')

  console.log('='.repeat(60))
  console.log('회원관리 출석부 데이터 임포트')
  console.log(dryRun ? '🔍 DRY RUN 모드 (실제 저장 안 함)' : '✅ EXECUTE 모드 (실제 저장)')
  console.log('='.repeat(60))

  // 1. 출석 데이터 추출
  console.log('\n📖 출석부 시트 읽는 중...')
  const records = extractAttendanceData()
  console.log(`   총 ${records.length}개의 출석 레코드 추출됨`)

  // 프로그램별 통계
  const programStats = new Map<string, number>()
  records.forEach(r => {
    programStats.set(r.programName, (programStats.get(r.programName) || 0) + 1)
  })

  console.log('\n📊 프로그램별 레코드 수:')
  Array.from(programStats.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([prog, count]) => {
      const mapped = PROGRAM_MAPPING[prog]
      const status = mapped ? '✅' : (mapped === '' ? '⚠️ 미매핑' : '❌ 없음')
      console.log(`   ${status} ${prog}: ${count}건`)
    })

  // 2. 회원 매칭 및 저장
  const stats = {
    processed: 0,
    matched: 0,
    notFound: 0,
    noMapping: 0,
    created: 0,
    updated: 0,
    skipped: 0,
  }

  const updatedMemberIds = new Set<string>()
  const notFoundNames = new Set<string>()

  console.log('\n🔄 출석 데이터 처리 중...')

  for (const record of records) {
    stats.processed++

    // 프로그램 매핑 확인
    const programId = PROGRAM_MAPPING[record.programName]
    if (!programId) {
      stats.noMapping++
      continue
    }

    // 회원 검색
    const members = await prisma.member.findMany({
      where: { name: record.memberName },
      select: { id: true, name: true },
    })

    if (members.length === 0) {
      stats.notFound++
      notFoundNames.add(record.memberName)
      continue
    }

    if (members.length > 1) {
      // 동명이인은 첫 번째 매칭 사용 (개선 필요)
    }

    const member = members[0]
    stats.matched++
    updatedMemberIds.add(member.id)

    // 출석 레코드 저장/업데이트
    const existing = await prisma.memberAttendance.findUnique({
      where: {
        memberId_programId_sessionNumber: {
          memberId: member.id,
          programId,
          sessionNumber: record.sessionNumber,
        },
      },
    })

    if (existing) {
      // 기존 데이터와 비교
      if (existing.attended === record.attended && existing.reportSubmitted === record.reportSubmitted) {
        stats.skipped++
        continue
      }

      // 업데이트
      if (!dryRun) {
        await prisma.memberAttendance.update({
          where: { id: existing.id },
          data: {
            attended: record.attended,
            reportSubmitted: record.reportSubmitted,
            sessionDate: record.sessionDate,
          },
        })
      }
      stats.updated++
    } else {
      // 신규 생성
      if (!dryRun) {
        await prisma.memberAttendance.create({
          data: {
            memberId: member.id,
            programId,
            sessionNumber: record.sessionNumber,
            sessionDate: record.sessionDate,
            attended: record.attended,
            reportSubmitted: record.reportSubmitted,
          },
        })
      }
      stats.created++
    }
  }

  // 3. MemberStats 재계산
  if (!dryRun && updatedMemberIds.size > 0) {
    console.log(`\n📊 MemberStats 재계산 중... (${updatedMemberIds.size}명)`)
    for (const memberId of updatedMemberIds) {
      await recalculateMemberStats(memberId)
    }
  }

  // 결과 출력
  console.log('\n' + '='.repeat(60))
  console.log('📊 최종 결과')
  console.log('='.repeat(60))
  console.log(`처리된 레코드: ${stats.processed}건`)
  console.log(`  - 매칭 성공: ${stats.matched}건`)
  console.log(`  - 프로그램 미매핑: ${stats.noMapping}건`)
  console.log(`  - 회원 없음: ${stats.notFound}건`)
  console.log(`출석 레코드:`)
  console.log(`  - 신규 생성: ${stats.created}건`)
  console.log(`  - 업데이트: ${stats.updated}건`)
  console.log(`  - 스킵 (변경없음): ${stats.skipped}건`)
  console.log(`업데이트된 회원: ${updatedMemberIds.size}명`)

  if (notFoundNames.size > 0 && notFoundNames.size <= 20) {
    console.log('\n⚠️ 매칭 실패 회원 (DB에 없음):')
    Array.from(notFoundNames).slice(0, 20).forEach(name => console.log(`  - ${name}`))
  }

  if (dryRun) {
    console.log('\n⚠️ 실제 저장하려면 --execute 옵션을 사용하세요:')
    console.log('   npx tsx scripts/import-member-management-attendance.ts --execute')
  }

  await prisma.$disconnect()
}

/**
 * MemberStats 재계산
 */
async function recalculateMemberStats(memberId: string): Promise<void> {
  const attendances = await prisma.memberAttendance.findMany({
    where: { memberId },
  })

  const programIds = new Set(attendances.map(a => a.programId))
  const totalPrograms = programIds.size
  const totalSessions = attendances.length
  const totalAttended = attendances.filter(a => a.attended).length
  const totalAbsent = attendances.filter(a => !a.attended).length
  const totalReports = attendances.filter(a => a.reportSubmitted).length

  const attendanceRate = totalSessions > 0
    ? Math.round((totalAttended / totalSessions) * 1000) / 10
    : 0
  const reportRate = totalSessions > 0
    ? Math.round((totalReports / totalSessions) * 1000) / 10
    : 0

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
      noShowCount: totalAbsent,
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
      noShowCount: totalAbsent,
      lastParticipatedAt: lastAttendance?.sessionDate || null,
    },
  })
}

main().catch(console.error)
