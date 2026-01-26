import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// 파일명 → 프로그램 ID 매핑
const FILE_MAPPING: Record<string, string> = {
  // 온라인 프로그램
  '[출석부] 온라인 시즌3.xlsx': 'cmkcrte1j000vn1qxxmwokkrh', // [시즌3]더 '행복한 삶'을 위한 독서
  '[출석부] 온라인 시즌4.xlsx': 'cmkcrtgmx0010n1qx6k6ftmvd', // [시즌4] 남북한걸음
  '[출석부] 온라인 시즌5 저출생, 대한민국의 위기.xlsx': 'cmkcrtg4b000zn1qx0q0upsg5', // [시즌5] 남북한걸음
  '[출석부] 온라인 시즌6 환경 독서모임.xlsx': 'cmkcrtfmc000yn1qxacflc3wc', // [시즌6] 남북한걸음
  '[출석부] 온라인 시즌7 SDGs 독서모임.xlsx': 'cmkcrtf3d000xn1qxlitx5sy7', // [시즌7] 남북한걸음
  '[출석부] 시즌8  독서모임.xlsx': 'cmkcrteko000wn1qx18l2hyf1', // [시즌8] 온라인 독서모임
  '[출석부] 시즌9 온라인 독서모임의 사본.xlsx': 'cmkcrtcyx000tn1qxjj1tpe1n', // [온라인 시즌9]
  '[온라인시즌11] 출석부.xlsx': 'cmkcrtbwc000rn1qxoc7gbdk2', // [온라인 시즌11]
  '[온라인시즌12] 출석부.xlsx': 'cmkcrtbca000qn1qxabqlhrck', // [온라인 시즌12]
  '[온라인시즌13] 출석부.xlsx': 'cmkcrtas9000pn1qx6gjk84ap', // [온라인 시즌13]

  // 오프라인 프로그램
  '시즌19-1 출석부.xlsx': 'cmkcrt0rw0006n1qx3q4n38hf', // [시즌19]
  '시즌19-2 출석부.xlsx': 'cmkcrt0rw0006n1qx3q4n38hf', // [시즌19] - 같은 시즌
  '[출석부] 시즌 20.xlsx': 'cmkcrt08v0005n1qx93o1sgz7', // [시즌20]
  '[출석부] 시즌 21 고립&환대.xlsx': 'cmkcrszpr0004n1qxm43xmd4i', // [시즌21]
  '[출석부] 시즌 22 성과 사랑.xlsx': 'cmkcrsz6o0003n1qxnleaww49', // [시즌22]
  '[출석부] 시즌23 탈북민 저서 독서모임.xlsx': 'cmkcrsz6o0003n1qxnleaww49', // [시즌22] - 시즌23은 DB에 없음
  '[출석부] 시즌24 마음힐링 독서모임.xlsx': 'cmkcrsynh0002n1qxtb2y8zsc', // [시즌24]
  '[출석부] 시즌25 진실과 거짓.xlsx': 'cmkcrsy380001n1qxo9e6ciqv', // [오프라인 시즌25]
  '[출석부] 시즌26 Ai와 생존하기 독서모임.xlsx': 'cmkcrsxjv0000n1qx5d3a3jtr', // [오프라인 시즌26]

  // 세미나
  '매력만점 대화법 출석.xlsx': 'cmkcsrrh10004kq3qstl2ive3', // 2024년 매력만점 대화법
  '[출석부] 10주 안에 끝내는 책쓰기.xlsx': 'cmkcsrp7f0001kq3q1qckatov', // 책쓰기 세미나
}

interface AttendanceData {
  memberName: string
  sessions: { sessionNumber: number; attended: boolean; reportSubmitted: boolean }[]
}

/**
 * 이름 정리 (괄호 내용, 숫자 제거)
 */
function cleanName(name: string): string {
  if (!name) return ''
  return String(name)
    .replace(/\(.*?\)/g, '') // 괄호 제거
    .replace(/\d{4}$/, '') // 끝 4자리 숫자 제거
    .trim()
}

/**
 * 출석 값 파싱 (1, "1", "지각" → true, 0, "0", "-", null → false)
 */
function parseAttendance(value: any): boolean {
  if (value === 1 || value === '1' || value === 'O' || value === 'o') return true
  if (typeof value === 'string' && value.includes('지각')) return true
  return false
}

/**
 * 표준 형식 파싱 (시즌3~시즌26 등)
 * 구조: 번호, 이름, 비고, 고향, [출석, 독후감] x N회
 */
function parseStandardFormat(filePath: string, hasReportColumn: boolean = true): AttendanceData[] {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames.find(s => s.includes('출석')) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const results: AttendanceData[] = []

  // 헤더 행 찾기 (번호, 이름이 있는 행)
  let headerRowIdx = -1
  let dataStartIdx = -1

  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    if (!row) continue
    if (row[0] === '번호' && row[1] === '이름') {
      headerRowIdx = i
      // 다음 행이 "출석", "독후감" 행인지 확인
      const nextRow = data[i + 1]
      if (nextRow && (nextRow[4] === '출석' || (nextRow[0] === null && nextRow[4]))) {
        dataStartIdx = i + 2
        // 그 다음 행도 체크
        const nextNextRow = data[i + 2]
        if (nextNextRow && nextNextRow[4] === '출석') {
          dataStartIdx = i + 3
        }
      } else {
        dataStartIdx = i + 1
      }
      break
    }
    // 번호 없이 바로 숫자로 시작하는 경우
    if (typeof row[0] === 'number' && row[1] && typeof row[1] === 'string') {
      dataStartIdx = i
      break
    }
  }

  if (dataStartIdx === -1) {
    console.log(`  ⚠️ 헤더를 찾을 수 없음: ${filePath}`)
    return results
  }

  // 데이터 시작 열 (보통 4번째 컬럼부터 출석 데이터)
  const attendanceStartCol = 4

  // 데이터 행 처리
  for (let i = dataStartIdx; i < data.length; i++) {
    const row = data[i]
    if (!row || !row[1]) continue

    const nameRaw = row[1]
    if (typeof nameRaw !== 'string' && typeof nameRaw !== 'number') continue

    const name = cleanName(String(nameRaw))
    if (!name || name === '이름') continue

    const sessions: { sessionNumber: number; attended: boolean; reportSubmitted: boolean }[] = []

    // 출석 데이터 추출
    if (hasReportColumn) {
      // 출석, 독후감이 번갈아 나오는 형식
      let sessionNum = 1
      for (let col = attendanceStartCol; col < row.length; col += 2) {
        const attended = parseAttendance(row[col])
        const report = col + 1 < row.length ? parseAttendance(row[col + 1]) : false
        sessions.push({ sessionNumber: sessionNum, attended, reportSubmitted: report })
        sessionNum++
      }
    } else {
      // 출석만 있는 형식
      let sessionNum = 1
      for (let col = attendanceStartCol; col < row.length; col++) {
        const attended = parseAttendance(row[col])
        sessions.push({ sessionNumber: sessionNum, attended, reportSubmitted: false })
        sessionNum++
      }
    }

    if (sessions.length > 0 && sessions.some(s => s.attended)) {
      results.push({ memberName: name, sessions })
    }
  }

  return results
}

/**
 * 시즌19 형식 파싱 (독후감 컬럼 없음)
 */
function parseSeason19Format(filePath: string): AttendanceData[] {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames.find(s => s.includes('출석')) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const results: AttendanceData[] = []

  // 데이터 시작 행 찾기
  let dataStartIdx = -1
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    if (!row) continue
    if (typeof row[0] === 'number' && row[1] && typeof row[1] === 'string') {
      dataStartIdx = i
      break
    }
  }

  if (dataStartIdx === -1) return results

  for (let i = dataStartIdx; i < data.length; i++) {
    const row = data[i]
    if (!row || !row[1]) continue

    const name = cleanName(String(row[1]))
    if (!name) continue

    const sessions: { sessionNumber: number; attended: boolean; reportSubmitted: boolean }[] = []

    // 출석 데이터 (4번째 컬럼부터)
    let sessionNum = 1
    for (let col = 4; col < row.length; col++) {
      const attended = parseAttendance(row[col])
      sessions.push({ sessionNumber: sessionNum, attended, reportSubmitted: false })
      sessionNum++
    }

    if (sessions.length > 0) {
      results.push({ memberName: name, sessions })
    }
  }

  return results
}

/**
 * 매력만점 대화법 형식 파싱
 */
function parseDialogueFormat(filePath: string): AttendanceData[] {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const results: AttendanceData[] = []

  // 첫 행이 헤더
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row || !row[1]) continue

    const name = cleanName(String(row[1]))
    if (!name) continue

    const sessions: { sessionNumber: number; attended: boolean; reportSubmitted: boolean }[] = []

    // 1차, 2차, 3차 (컬럼 2, 3, 4)
    for (let sessionNum = 1; sessionNum <= 3; sessionNum++) {
      const value = row[sessionNum + 1] // 컬럼 2, 3, 4
      // 값이 0보다 크면 출석 (점수 형태)
      const attended = typeof value === 'number' && value > 0
      sessions.push({ sessionNumber: sessionNum, attended, reportSubmitted: false })
    }

    if (sessions.some(s => s.attended)) {
      results.push({ memberName: name, sessions })
    }
  }

  return results
}

/**
 * 책쓰기 형식 파싱
 */
function parseBookWritingFormat(filePath: string): AttendanceData[] {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const results: AttendanceData[] = []

  // 데이터 행 찾기 (번호가 1인 행부터)
  let dataStartIdx = -1
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (row && row[0] === 1) {
      dataStartIdx = i
      break
    }
  }

  if (dataStartIdx === -1) return results

  for (let i = dataStartIdx; i < data.length; i++) {
    const row = data[i]
    if (!row || typeof row[0] !== 'number' || !row[1]) continue

    const name = cleanName(String(row[1]))
    if (!name) continue

    const sessions: { sessionNumber: number; attended: boolean; reportSubmitted: boolean }[] = []

    // 출석 데이터 (3번째 컬럼부터)
    let sessionNum = 1
    for (let col = 3; col < row.length && sessionNum <= 10; col++) {
      const attended = parseAttendance(row[col])
      sessions.push({ sessionNumber: sessionNum, attended, reportSubmitted: false })
      sessionNum++
    }

    if (sessions.some(s => s.attended)) {
      results.push({ memberName: name, sessions })
    }
  }

  return results
}

/**
 * 파일 형식에 따른 파서 선택
 */
function parseFile(filePath: string): AttendanceData[] {
  const fileName = path.basename(filePath)

  if (fileName.includes('시즌19')) {
    return parseSeason19Format(filePath)
  }
  if (fileName.includes('매력만점')) {
    return parseDialogueFormat(filePath)
  }
  if (fileName.includes('책쓰기')) {
    return parseBookWritingFormat(filePath)
  }

  // 기본 표준 형식 (출석/독후감 컬럼 여부 자동 감지)
  return parseStandardFormat(filePath, true)
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

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--execute')

  // 파일 목록 (커맨드라인 또는 하드코딩)
  const files = [
    // 온라인
    '/home/seoyoon/바탕화면/새 폴더/온라인/[출석부] 온라인 시즌3.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[출석부] 온라인 시즌4.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[출석부] 온라인 시즌5 저출생, 대한민국의 위기.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[출석부] 온라인 시즌6 환경 독서모임.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[출석부] 온라인 시즌7 SDGs 독서모임.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[출석부] 시즌8  독서모임.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[출석부] 시즌9 온라인 독서모임의 사본.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[온라인시즌11] 출석부.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[온라인시즌12] 출석부.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/온라인/[온라인시즌13] 출석부.xlsx',
    // 오프라인
    '/home/seoyoon/바탕화면/새 폴더/오프라인/시즌19-1 출석부.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/시즌19-2 출석부.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/[출석부] 시즌 20.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/[출석부] 시즌 21 고립&환대.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/[출석부] 시즌 22 성과 사랑.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/[출석부] 시즌23 탈북민 저서 독서모임.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/[출석부] 시즌24 마음힐링 독서모임.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/[출석부] 시즌25 진실과 거짓.xlsx',
    '/home/seoyoon/바탕화면/새 폴더/오프라인/[출석부] 시즌26 Ai와 생존하기 독서모임.xlsx',
    // 세미나
    '/home/seoyoon/다운로드/매력만점 대화법 출석.xlsx',
    '/home/seoyoon/다운로드/[출석부] 10주 안에 끝내는 책쓰기.xlsx',
  ]

  console.log('='.repeat(60))
  console.log('전체 출석부 데이터 임포트')
  console.log(dryRun ? '🔍 DRY RUN 모드 (실제 저장 안 함)' : '✅ EXECUTE 모드 (실제 저장)')
  console.log('='.repeat(60))

  const stats = {
    filesProcessed: 0,
    filesSkipped: 0,
    totalRecords: 0,
    matched: 0,
    notFound: 0,
    created: 0,
    updated: 0,
    skipped: 0,
  }

  const updatedMemberIds = new Set<string>()
  const notFoundNames = new Set<string>()

  for (const filePath of files) {
    const fileName = path.basename(filePath)
    const programId = FILE_MAPPING[fileName]

    if (!programId) {
      console.log(`\n⚠️ 매핑 없음: ${fileName}`)
      stats.filesSkipped++
      continue
    }

    if (!fs.existsSync(filePath)) {
      console.log(`\n❌ 파일 없음: ${fileName}`)
      stats.filesSkipped++
      continue
    }

    console.log(`\n📖 ${fileName}`)

    try {
      const attendanceData = parseFile(filePath)
      console.log(`   ${attendanceData.length}명의 데이터 추출`)
      stats.filesProcessed++

      for (const data of attendanceData) {
        // 회원 검색
        const members = await prisma.member.findMany({
          where: { name: data.memberName },
          select: { id: true, name: true },
        })

        if (members.length === 0) {
          stats.notFound++
          notFoundNames.add(data.memberName)
          continue
        }

        const member = members[0]
        stats.matched++
        updatedMemberIds.add(member.id)

        // 각 세션 데이터 저장
        for (const session of data.sessions) {
          stats.totalRecords++

          const existing = await prisma.memberAttendance.findUnique({
            where: {
              memberId_programId_sessionNumber: {
                memberId: member.id,
                programId,
                sessionNumber: session.sessionNumber,
              },
            },
          })

          if (existing) {
            if (existing.attended === session.attended && existing.reportSubmitted === session.reportSubmitted) {
              stats.skipped++
              continue
            }

            if (!dryRun) {
              await prisma.memberAttendance.update({
                where: { id: existing.id },
                data: {
                  attended: session.attended,
                  reportSubmitted: session.reportSubmitted,
                },
              })
            }
            stats.updated++
          } else {
            if (!dryRun) {
              await prisma.memberAttendance.create({
                data: {
                  memberId: member.id,
                  programId,
                  sessionNumber: session.sessionNumber,
                  attended: session.attended,
                  reportSubmitted: session.reportSubmitted,
                },
              })
            }
            stats.created++
          }
        }
      }
    } catch (error: any) {
      console.log(`   ❌ 오류: ${error.message}`)
    }
  }

  // MemberStats 재계산
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
  console.log(`파일 처리: ${stats.filesProcessed}개 (스킵: ${stats.filesSkipped}개)`)
  console.log(`회원 매칭: ${stats.matched}건 (못 찾음: ${stats.notFound}건)`)
  console.log(`출석 레코드:`)
  console.log(`  - 신규 생성: ${stats.created}건`)
  console.log(`  - 업데이트: ${stats.updated}건`)
  console.log(`  - 스킵 (변경없음): ${stats.skipped}건`)
  console.log(`업데이트된 회원: ${updatedMemberIds.size}명`)

  if (notFoundNames.size > 0) {
    console.log(`\n⚠️ 매칭 실패 회원 (상위 30개):`)
    Array.from(notFoundNames).slice(0, 30).forEach(name => console.log(`  - ${name}`))
    if (notFoundNames.size > 30) {
      console.log(`  ... 외 ${notFoundNames.size - 30}명`)
    }
  }

  if (dryRun) {
    console.log('\n⚠️ 실제 저장하려면 --execute 옵션을 사용하세요:')
    console.log('   npx tsx scripts/import-all-attendance.ts --execute')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
