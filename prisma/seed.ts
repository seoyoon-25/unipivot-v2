import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 비영리법인 표준 계정과목
const financeAccounts = [
  // 수입 계정 (INCOME)
  { code: '4100', name: '회비수입', type: 'INCOME', category: '사업수입', sortOrder: 100 },
  { code: '4101', name: '정회원회비', type: 'INCOME', category: '사업수입', subcategory: '회비', sortOrder: 101 },
  { code: '4102', name: '준회원회비', type: 'INCOME', category: '사업수입', subcategory: '회비', sortOrder: 102 },
  { code: '4200', name: '기부금수입', type: 'INCOME', category: '사업수입', sortOrder: 200 },
  { code: '4201', name: '개인기부금', type: 'INCOME', category: '사업수입', subcategory: '기부금', sortOrder: 201 },
  { code: '4202', name: '법인기부금', type: 'INCOME', category: '사업수입', subcategory: '기부금', sortOrder: 202 },
  { code: '4203', name: '지정기부금', type: 'INCOME', category: '사업수입', subcategory: '기부금', sortOrder: 203 },
  { code: '4300', name: '보조금수입', type: 'INCOME', category: '사업수입', sortOrder: 300 },
  { code: '4301', name: '정부보조금', type: 'INCOME', category: '사업수입', subcategory: '보조금', sortOrder: 301 },
  { code: '4302', name: '지자체보조금', type: 'INCOME', category: '사업수입', subcategory: '보조금', sortOrder: 302 },
  { code: '4303', name: '민간보조금', type: 'INCOME', category: '사업수입', subcategory: '보조금', sortOrder: 303 },
  { code: '4400', name: '사업수입', type: 'INCOME', category: '사업수입', sortOrder: 400 },
  { code: '4401', name: '프로그램참가비', type: 'INCOME', category: '사업수입', subcategory: '사업', sortOrder: 401 },
  { code: '4402', name: '교육수입', type: 'INCOME', category: '사업수입', subcategory: '사업', sortOrder: 402 },
  { code: '4403', name: '행사수입', type: 'INCOME', category: '사업수입', subcategory: '사업', sortOrder: 403 },
  { code: '4500', name: '기타수입', type: 'INCOME', category: '사업외수입', sortOrder: 500 },
  { code: '4501', name: '이자수입', type: 'INCOME', category: '사업외수입', subcategory: '금융', sortOrder: 501 },
  { code: '4502', name: '잡수입', type: 'INCOME', category: '사업외수입', subcategory: '기타', sortOrder: 502 },
  { code: '4600', name: '보증금수입', type: 'INCOME', category: '보증금', sortOrder: 600 },
  { code: '4601', name: '프로그램보증금', type: 'INCOME', category: '보증금', subcategory: '보증금', sortOrder: 601 },

  // 지출 계정 (EXPENSE)
  { code: '5100', name: '인건비', type: 'EXPENSE', category: '사업비', sortOrder: 1100 },
  { code: '5101', name: '급여', type: 'EXPENSE', category: '사업비', subcategory: '인건비', sortOrder: 1101 },
  { code: '5102', name: '상여금', type: 'EXPENSE', category: '사업비', subcategory: '인건비', sortOrder: 1102 },
  { code: '5103', name: '퇴직급여', type: 'EXPENSE', category: '사업비', subcategory: '인건비', sortOrder: 1103 },
  { code: '5104', name: '4대보험', type: 'EXPENSE', category: '사업비', subcategory: '인건비', sortOrder: 1104 },
  { code: '5105', name: '강사료', type: 'EXPENSE', category: '사업비', subcategory: '인건비', sortOrder: 1105 },
  { code: '5106', name: '자문료', type: 'EXPENSE', category: '사업비', subcategory: '인건비', sortOrder: 1106 },
  { code: '5200', name: '운영비', type: 'EXPENSE', category: '사업비', sortOrder: 1200 },
  { code: '5201', name: '임차료', type: 'EXPENSE', category: '사업비', subcategory: '운영비', sortOrder: 1201 },
  { code: '5202', name: '관리비', type: 'EXPENSE', category: '사업비', subcategory: '운영비', sortOrder: 1202 },
  { code: '5203', name: '통신비', type: 'EXPENSE', category: '사업비', subcategory: '운영비', sortOrder: 1203 },
  { code: '5204', name: '수도광열비', type: 'EXPENSE', category: '사업비', subcategory: '운영비', sortOrder: 1204 },
  { code: '5205', name: '세금과공과', type: 'EXPENSE', category: '사업비', subcategory: '운영비', sortOrder: 1205 },
  { code: '5206', name: '보험료', type: 'EXPENSE', category: '사업비', subcategory: '운영비', sortOrder: 1206 },
  { code: '5300', name: '사업비', type: 'EXPENSE', category: '사업비', sortOrder: 1300 },
  { code: '5301', name: '교육훈련비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1301 },
  { code: '5302', name: '행사비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1302 },
  { code: '5303', name: '홍보비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1303 },
  { code: '5304', name: '인쇄비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1304 },
  { code: '5305', name: '회의비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1305 },
  { code: '5306', name: '여비교통비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1306 },
  { code: '5307', name: '식비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1307 },
  { code: '5308', name: '재료비', type: 'EXPENSE', category: '사업비', subcategory: '사업비', sortOrder: 1308 },
  { code: '5400', name: '사무비', type: 'EXPENSE', category: '일반관리비', sortOrder: 1400 },
  { code: '5401', name: '소모품비', type: 'EXPENSE', category: '일반관리비', subcategory: '사무비', sortOrder: 1401 },
  { code: '5402', name: '도서구입비', type: 'EXPENSE', category: '일반관리비', subcategory: '사무비', sortOrder: 1402 },
  { code: '5403', name: '차량유지비', type: 'EXPENSE', category: '일반관리비', subcategory: '사무비', sortOrder: 1403 },
  { code: '5404', name: '수선비', type: 'EXPENSE', category: '일반관리비', subcategory: '사무비', sortOrder: 1404 },
  { code: '5500', name: '기타지출', type: 'EXPENSE', category: '기타', sortOrder: 1500 },
  { code: '5501', name: '잡비', type: 'EXPENSE', category: '기타', subcategory: '기타', sortOrder: 1501 },
  { code: '5502', name: '전기이월', type: 'EXPENSE', category: '기타', subcategory: '기타', sortOrder: 1502 },
  { code: '5600', name: '보증금지출', type: 'EXPENSE', category: '보증금', sortOrder: 1600 },
  { code: '5601', name: '보증금반환', type: 'EXPENSE', category: '보증금', subcategory: '보증금', sortOrder: 1601 },
  { code: '5602', name: '보증금환입', type: 'EXPENSE', category: '보증금', subcategory: '보증금', sortOrder: 1602 },

  // 자산 계정 (ASSET)
  { code: '1100', name: '유동자산', type: 'ASSET', category: '자산', sortOrder: 10 },
  { code: '1101', name: '현금', type: 'ASSET', category: '자산', subcategory: '유동자산', sortOrder: 11 },
  { code: '1102', name: '보통예금', type: 'ASSET', category: '자산', subcategory: '유동자산', sortOrder: 12 },
  { code: '1103', name: '정기예금', type: 'ASSET', category: '자산', subcategory: '유동자산', sortOrder: 13 },
  { code: '1104', name: '미수금', type: 'ASSET', category: '자산', subcategory: '유동자산', sortOrder: 14 },
  { code: '1105', name: '선급금', type: 'ASSET', category: '자산', subcategory: '유동자산', sortOrder: 15 },
  { code: '1106', name: '보증금자산', type: 'ASSET', category: '자산', subcategory: '유동자산', sortOrder: 16 },
  { code: '1200', name: '비유동자산', type: 'ASSET', category: '자산', sortOrder: 20 },
  { code: '1201', name: '비품', type: 'ASSET', category: '자산', subcategory: '비유동자산', sortOrder: 21 },
  { code: '1202', name: '차량운반구', type: 'ASSET', category: '자산', subcategory: '비유동자산', sortOrder: 22 },
  { code: '1203', name: '임차보증금', type: 'ASSET', category: '자산', subcategory: '비유동자산', sortOrder: 23 },

  // 부채 계정 (LIABILITY)
  { code: '2100', name: '유동부채', type: 'LIABILITY', category: '부채', sortOrder: 50 },
  { code: '2101', name: '미지급금', type: 'LIABILITY', category: '부채', subcategory: '유동부채', sortOrder: 51 },
  { code: '2102', name: '예수금', type: 'LIABILITY', category: '부채', subcategory: '유동부채', sortOrder: 52 },
  { code: '2103', name: '선수금', type: 'LIABILITY', category: '부채', subcategory: '유동부채', sortOrder: 53 },
  { code: '2104', name: '보증금부채', type: 'LIABILITY', category: '부채', subcategory: '유동부채', sortOrder: 54 },
]

async function main() {
  console.log('Seeding finance accounts...')

  // Create finance accounts
  for (const account of financeAccounts) {
    await prisma.financeAccount.upsert({
      where: { code: account.code },
      update: account,
      create: {
        ...account,
        isSystem: true,
      },
    })
  }

  console.log(`Created ${financeAccounts.length} finance accounts`)

  // Create current fiscal year
  const currentYear = new Date().getFullYear()
  await prisma.fiscalYear.upsert({
    where: { year: currentYear },
    update: {},
    create: {
      year: currentYear,
      startDate: new Date(`${currentYear}-01-01`),
      endDate: new Date(`${currentYear}-12-31`),
      isCurrent: true,
      isClosed: false,
    },
  })
  console.log(`Created fiscal year ${currentYear}`)

  // Create general fund
  await prisma.fund.upsert({
    where: { id: 'general-fund' },
    update: {},
    create: {
      id: 'general-fund',
      name: '일반기금',
      type: 'GENERAL',
      description: '단체의 일반 운영을 위한 기금',
      balance: 0,
      isActive: true,
    },
  })
  console.log('Created general fund')

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
