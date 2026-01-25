import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

// Excel 파일 경로
const EXCEL_FILE = '/home/seoyoon/다운로드/회원관리_2025년.xlsx'

interface PhoneData {
  name: string
  phone: string
  source: string
}

/**
 * 전화번호 정규화 (010-xxxx-xxxx 형식)
 */
function normalizePhone(phone: string | number | null | undefined): string | null {
  if (!phone) return null

  // 숫자만 추출
  const digits = String(phone).replace(/\D/g, '')

  if (digits.length === 0) return null

  // 10자리 (0 빠진 경우) -> 11자리로 보정
  if (digits.length === 10 && !digits.startsWith('0')) {
    const fullNumber = '0' + digits
    return `${fullNumber.slice(0, 3)}-${fullNumber.slice(3, 7)}-${fullNumber.slice(7)}`
  }

  // 11자리 (정상)
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  // 그 외는 그대로 반환 (하이픈 추가 시도)
  if (digits.length >= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  return null
}

/**
 * 이름 정리 (괄호 제거 등)
 */
function cleanName(name: string): string {
  return name.replace(/\(.*?\)/g, '').trim()
}

/**
 * 회원관리 엑셀에서 전화번호 데이터 추출
 */
function extractPhoneData(): PhoneData[] {
  const workbook = XLSX.readFile(EXCEL_FILE)
  const results: PhoneData[] = []
  const seen = new Map<string, PhoneData>() // 이름 기반 중복 제거

  // 1. 신청명부 시트 (컬럼E: 이름, 컬럼I: 연락처)
  if (workbook.SheetNames.includes('신청명부')) {
    const sheet = workbook.Sheets['신청명부']
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

    console.log('📋 신청명부 시트 처리 중...')

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row) continue

      const name = row[4] // 컬럼 E (0-indexed: 4)
      const phone = row[8] // 컬럼 I (0-indexed: 8)

      if (name && phone) {
        const cleanedName = cleanName(String(name))
        const normalizedPhone = normalizePhone(phone)

        if (cleanedName && normalizedPhone) {
          // 이미 있으면 덮어쓰기 (나중 데이터가 더 최신일 수 있음)
          seen.set(cleanedName, {
            name: cleanedName,
            phone: normalizedPhone,
            source: '신청명부',
          })
        }
      }
    }
  }

  // 2. 회원명부 시트 (컬럼D: 이름, 컬럼H: 연락처)
  if (workbook.SheetNames.includes('회원명부')) {
    const sheet = workbook.Sheets['회원명부']
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

    console.log('📋 회원명부 시트 처리 중...')

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row) continue

      const name = row[3] // 컬럼 D (0-indexed: 3)
      const phone = row[7] // 컬럼 H (0-indexed: 7)

      if (name && phone) {
        const cleanedName = cleanName(String(name))
        const normalizedPhone = normalizePhone(phone)

        if (cleanedName && normalizedPhone) {
          // 회원명부 데이터로 덮어쓰기 (더 정확한 데이터)
          seen.set(cleanedName, {
            name: cleanedName,
            phone: normalizedPhone,
            source: '회원명부',
          })
        }
      }
    }
  }

  // Map을 배열로 변환
  for (const data of seen.values()) {
    results.push(data)
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
  console.log('회원 전화번호 업데이트')
  console.log(dryRun ? '🔍 DRY RUN 모드 (실제 업데이트 안 함)' : '✅ EXECUTE 모드 (실제 업데이트)')
  console.log('='.repeat(60))

  // 1. 엑셀에서 전화번호 데이터 추출
  console.log('\n📖 엑셀 파일 읽는 중...')
  const phoneData = extractPhoneData()
  console.log(`   총 ${phoneData.length}개의 전화번호 데이터 추출됨`)

  // 2. DB 회원과 매칭
  const stats = {
    matched: 0,
    updated: 0,
    skipped: 0, // 이미 같은 번호
    notFound: 0,
    multipleMatches: 0,
  }

  const notFoundList: string[] = []
  const multipleMatchesList: string[] = []
  const updatedList: { name: string; oldPhone: string | null; newPhone: string }[] = []

  console.log('\n🔄 회원 매칭 및 업데이트 중...')

  for (const data of phoneData) {
    // 이름으로 회원 검색
    const members = await prisma.member.findMany({
      where: { name: data.name },
      select: { id: true, name: true, phone: true },
    })

    if (members.length === 0) {
      stats.notFound++
      notFoundList.push(data.name)
      continue
    }

    if (members.length > 1) {
      stats.multipleMatches++
      multipleMatchesList.push(`${data.name} (${members.length}명)`)
      continue
    }

    const member = members[0]
    stats.matched++

    // 이미 같은 번호면 스킵
    if (member.phone === data.phone) {
      stats.skipped++
      continue
    }

    // 업데이트
    if (!dryRun) {
      await prisma.member.update({
        where: { id: member.id },
        data: { phone: data.phone },
      })
    }

    stats.updated++
    updatedList.push({
      name: member.name,
      oldPhone: member.phone,
      newPhone: data.phone,
    })
  }

  // 결과 출력
  console.log('\n' + '='.repeat(60))
  console.log('📊 결과')
  console.log('='.repeat(60))
  console.log(`엑셀 데이터: ${phoneData.length}개`)
  console.log(`매칭 성공: ${stats.matched}명`)
  console.log(`  - 업데이트: ${stats.updated}명`)
  console.log(`  - 스킵 (동일): ${stats.skipped}명`)
  console.log(`매칭 실패: ${stats.notFound}명 (DB에 없음)`)
  console.log(`동명이인: ${stats.multipleMatches}명`)

  // 업데이트 목록 (상위 20개)
  if (updatedList.length > 0) {
    console.log('\n📝 업데이트 목록 (최대 20개):')
    updatedList.slice(0, 20).forEach((item) => {
      console.log(`  - ${item.name}: ${item.oldPhone || '(없음)'} → ${item.newPhone}`)
    })
    if (updatedList.length > 20) {
      console.log(`  ... 외 ${updatedList.length - 20}명`)
    }
  }

  // 동명이인 목록
  if (multipleMatchesList.length > 0) {
    console.log('\n⚠️ 동명이인 (수동 확인 필요):')
    multipleMatchesList.slice(0, 10).forEach((name) => {
      console.log(`  - ${name}`)
    })
    if (multipleMatchesList.length > 10) {
      console.log(`  ... 외 ${multipleMatchesList.length - 10}명`)
    }
  }

  if (dryRun) {
    console.log('\n⚠️ 실제 업데이트하려면 --execute 옵션을 사용하세요:')
    console.log('   npx tsx scripts/update-member-phones.ts --execute')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
