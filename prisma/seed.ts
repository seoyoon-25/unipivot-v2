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
  const generalFund = await prisma.fund.upsert({
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

  // Get account IDs for transactions
  const accounts = await prisma.financeAccount.findMany()
  const getAccountId = (code: string) => accounts.find(a => a.code === code)?.id

  // Sample transactions data
  const sampleTransactions = [
    // 2025년 11월 거래
    { date: '2025-11-01', type: 'INCOME', accountCode: '4301', amount: 5000000, description: '통일부 남북청년교류 보조금 (1차)', vendor: '통일부', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-11-05', type: 'EXPENSE', accountCode: '5201', amount: 800000, description: '11월 사무실 임차료', vendor: '○○빌딩', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-11-05', type: 'EXPENSE', accountCode: '5202', amount: 150000, description: '11월 관리비', vendor: '○○빌딩', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-11-10', type: 'INCOME', accountCode: '4201', amount: 500000, description: '김○○ 후원금', vendor: '김○○', paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-11-12', type: 'EXPENSE', accountCode: '5105', amount: 300000, description: '독서모임 강사료 (박○○ 작가)', vendor: '박○○', paymentMethod: 'TRANSFER', evidenceType: 'SIMPLE' },
    { date: '2025-11-15', type: 'EXPENSE', accountCode: '5101', amount: 3500000, description: '11월 직원 급여', vendor: null, paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-11-15', type: 'EXPENSE', accountCode: '5104', amount: 350000, description: '11월 4대보험료', vendor: '국민건강보험공단', paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-11-18', type: 'INCOME', accountCode: '4401', amount: 240000, description: '독서모임 참가비 (8명 x 30,000원)', vendor: null, paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-11-20', type: 'EXPENSE', accountCode: '5307', amount: 85000, description: '독서모임 다과비', vendor: '○○베이커리', paymentMethod: 'CARD', evidenceType: 'CARD_SLIP' },
    { date: '2025-11-22', type: 'EXPENSE', accountCode: '5303', amount: 200000, description: 'SNS 광고비 (페이스북/인스타)', vendor: 'Meta', paymentMethod: 'CARD', evidenceType: 'CARD_SLIP' },
    { date: '2025-11-25', type: 'INCOME', accountCode: '4202', amount: 1000000, description: '(주)○○기업 후원금', vendor: '(주)○○기업', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-11-28', type: 'EXPENSE', accountCode: '5401', amount: 120000, description: '사무용품 구입', vendor: '오피스디포', paymentMethod: 'CARD', evidenceType: 'CARD_SLIP' },

    // 2025년 12월 거래
    { date: '2025-12-01', type: 'INCOME', accountCode: '4301', amount: 5000000, description: '통일부 남북청년교류 보조금 (2차)', vendor: '통일부', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-12-05', type: 'EXPENSE', accountCode: '5201', amount: 800000, description: '12월 사무실 임차료', vendor: '○○빌딩', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-12-05', type: 'EXPENSE', accountCode: '5202', amount: 150000, description: '12월 관리비', vendor: '○○빌딩', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-12-10', type: 'EXPENSE', accountCode: '5302', amount: 1500000, description: '송년행사 장소대관료', vendor: '○○컨벤션센터', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-12-10', type: 'EXPENSE', accountCode: '5307', amount: 800000, description: '송년행사 케이터링', vendor: '○○케이터링', paymentMethod: 'CARD', evidenceType: 'TAX_INVOICE' },
    { date: '2025-12-12', type: 'INCOME', accountCode: '4201', amount: 300000, description: '이○○ 후원금', vendor: '이○○', paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-12-12', type: 'INCOME', accountCode: '4201', amount: 200000, description: '최○○ 후원금', vendor: '최○○', paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-12-15', type: 'EXPENSE', accountCode: '5101', amount: 3500000, description: '12월 직원 급여', vendor: null, paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-12-15', type: 'EXPENSE', accountCode: '5104', amount: 350000, description: '12월 4대보험료', vendor: '국민건강보험공단', paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-12-18', type: 'EXPENSE', accountCode: '5105', amount: 300000, description: '독서모임 강사료 (박○○ 작가)', vendor: '박○○', paymentMethod: 'TRANSFER', evidenceType: 'SIMPLE' },
    { date: '2025-12-20', type: 'INCOME', accountCode: '4403', amount: 500000, description: '송년행사 참가비 (50명 x 10,000원)', vendor: null, paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2025-12-22', type: 'EXPENSE', accountCode: '5306', amount: 180000, description: '송년행사 교통비 (버스 대절)', vendor: '○○관광', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2025-12-28', type: 'INCOME', accountCode: '4501', amount: 15000, description: '12월 예금이자', vendor: '○○은행', paymentMethod: 'TRANSFER', evidenceType: 'NONE' },

    // 2026년 1월 거래
    { date: '2026-01-02', type: 'INCOME', accountCode: '4101', amount: 600000, description: '2026년 정회원 연회비 (20명 x 30,000원)', vendor: null, paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2026-01-05', type: 'EXPENSE', accountCode: '5201', amount: 800000, description: '1월 사무실 임차료', vendor: '○○빌딩', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2026-01-05', type: 'EXPENSE', accountCode: '5202', amount: 150000, description: '1월 관리비', vendor: '○○빌딩', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2026-01-08', type: 'INCOME', accountCode: '4601', amount: 400000, description: '독서모임 보증금 (8명 x 50,000원)', vendor: null, paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
    { date: '2026-01-10', type: 'EXPENSE', accountCode: '5304', amount: 250000, description: '2026년 활동 리플렛 인쇄', vendor: '○○인쇄', paymentMethod: 'TRANSFER', evidenceType: 'TAX_INVOICE' },
    { date: '2026-01-12', type: 'INCOME', accountCode: '4201', amount: 1000000, description: '박○○ 신년 후원금', vendor: '박○○', paymentMethod: 'TRANSFER', evidenceType: 'NONE' },
  ]

  // Delete existing transactions and create new ones
  await prisma.financeTransaction.deleteMany({})
  console.log('Cleared existing transactions')

  let totalIncome = 0
  let totalExpense = 0

  for (const tx of sampleTransactions) {
    const accountId = getAccountId(tx.accountCode)
    if (!accountId) {
      console.warn(`Account not found for code: ${tx.accountCode}`)
      continue
    }

    await prisma.financeTransaction.create({
      data: {
        date: new Date(tx.date),
        type: tx.type,
        fundId: generalFund.id,
        financeAccountId: accountId,
        amount: tx.amount,
        description: tx.description,
        vendor: tx.vendor,
        paymentMethod: tx.paymentMethod,
        evidenceType: tx.evidenceType,
      },
    })

    if (tx.type === 'INCOME') {
      totalIncome += tx.amount
    } else {
      totalExpense += tx.amount
    }
  }

  console.log(`Created ${sampleTransactions.length} sample transactions`)

  // Update fund balance
  const finalBalance = totalIncome - totalExpense
  await prisma.fund.update({
    where: { id: generalFund.id },
    data: { balance: finalBalance },
  })
  console.log(`Updated fund balance: ${finalBalance.toLocaleString()}원 (수입: ${totalIncome.toLocaleString()}원, 지출: ${totalExpense.toLocaleString()}원)`)

  // =============================================
  // 프로그램 샘플 데이터
  // =============================================
  console.log('\nSeeding program data...')

  const samplePrograms = [
    // 독서모임 (BOOKCLUB)
    {
      title: '17기 남Book북한걸음 - 통일시대의 리더십',
      slug: 'bookclub-17-leadership',
      type: 'BOOKCLUB',
      description: '통일 시대를 준비하는 리더십에 관한 책을 함께 읽고 토론합니다.',
      content: `<h2>프로그램 소개</h2>
<p>남북청년이 함께 책을 읽고 토론하는 독서모임입니다. 이번 기수에서는 '통일시대의 리더십'을 주제로 8주간 진행됩니다.</p>
<h3>진행 도서</h3>
<ul>
<li>리더십의 본질 - 김○○ 저</li>
<li>한반도 평화와 리더십 - 박○○ 저</li>
</ul>
<h3>참가 대상</h3>
<p>남북한 출신 청년 누구나 (만 19세~39세)</p>`,
      capacity: 15,
      feeType: 'DEPOSIT',
      feeAmount: 50000,
      location: '서울 마포구 유니피벗 사무실',
      isOnline: false,
      status: 'RECRUITING',
      recruitStartDate: new Date('2026-01-10'),
      recruitEndDate: new Date('2026-01-31'),
      startDate: new Date('2026-02-08'),
      endDate: new Date('2026-03-29'),
    },
    {
      title: '16기 남Book북한걸음 - 분단의 역사',
      slug: 'bookclub-16-history',
      type: 'BOOKCLUB',
      description: '한반도 분단의 역사를 다룬 책을 함께 읽으며 역사 인식을 공유합니다.',
      content: `<h2>프로그램 소개</h2><p>분단의 역사를 되짚어보는 독서모임입니다.</p>`,
      capacity: 12,
      feeType: 'DEPOSIT',
      feeAmount: 50000,
      location: '서울 마포구 유니피벗 사무실',
      isOnline: false,
      status: 'ONGOING',
      recruitStartDate: new Date('2025-11-01'),
      recruitEndDate: new Date('2025-11-30'),
      startDate: new Date('2025-12-07'),
      endDate: new Date('2026-01-25'),
    },
    {
      title: '15기 남Book북한걸음 - 청년의 꿈',
      slug: 'bookclub-15-dream',
      type: 'BOOKCLUB',
      description: '남북한 청년들의 꿈과 희망에 대한 이야기를 나눕니다.',
      capacity: 12,
      feeType: 'DEPOSIT',
      feeAmount: 50000,
      location: '서울 마포구 유니피벗 사무실',
      isOnline: false,
      status: 'COMPLETED',
      recruitStartDate: new Date('2025-08-01'),
      recruitEndDate: new Date('2025-08-31'),
      startDate: new Date('2025-09-07'),
      endDate: new Date('2025-10-26'),
    },

    // 강연 및 세미나 (SEMINAR)
    {
      title: '2026년 1월 정기 세미나: 한반도 평화 전망',
      slug: 'seminar-2026-01-peace',
      type: 'SEMINAR',
      description: '2026년 한반도 정세와 평화 전망에 대한 전문가 강연',
      content: `<h2>강연 소개</h2>
<p>한반도 전문가를 모시고 2026년 한반도 정세와 평화 전망에 대해 들어봅니다.</p>
<h3>강연자</h3>
<p>○○대학교 정치학과 김○○ 교수</p>
<h3>강연 내용</h3>
<ul>
<li>2025년 남북관계 회고</li>
<li>2026년 한반도 정세 전망</li>
<li>청년들이 할 수 있는 평화 실천</li>
</ul>`,
      capacity: 50,
      feeType: 'FREE',
      feeAmount: 0,
      location: '온라인 (Zoom)',
      isOnline: true,
      status: 'RECRUITING',
      recruitStartDate: new Date('2026-01-01'),
      recruitEndDate: new Date('2026-01-18'),
      startDate: new Date('2026-01-20'),
      endDate: new Date('2026-01-20'),
    },
    {
      title: '북한이탈주민 정착 지원 정책 세미나',
      slug: 'seminar-nk-settlement-policy',
      type: 'SEMINAR',
      description: '북한이탈주민 정착 지원 정책의 현황과 과제',
      content: `<h2>세미나 개요</h2><p>북한이탈주민 정착 지원 정책의 현황을 살펴보고 개선 방안을 논의합니다.</p>`,
      capacity: 40,
      feeType: 'FREE',
      feeAmount: 0,
      location: '서울 종로구 ○○센터',
      isOnline: false,
      status: 'RECRUIT_CLOSED',
      recruitStartDate: new Date('2025-12-01'),
      recruitEndDate: new Date('2025-12-20'),
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-01-15'),
    },
    {
      title: '통일교육 방법론 워크샵',
      slug: 'seminar-unification-education',
      type: 'SEMINAR',
      description: '효과적인 통일교육 방법론에 대한 실습 워크샵',
      capacity: 25,
      feeType: 'FEE',
      feeAmount: 20000,
      location: '서울 마포구 유니피벗 사무실',
      isOnline: false,
      status: 'COMPLETED',
      recruitStartDate: new Date('2025-10-01'),
      recruitEndDate: new Date('2025-10-25'),
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-01'),
    },

    // K-Move
    {
      title: 'K-Move 2026 봄: DMZ 평화 탐방',
      slug: 'kmove-2026-spring-dmz',
      type: 'KMOVE',
      description: 'DMZ 일대를 탐방하며 분단의 현실과 평화의 의미를 느껴봅니다.',
      content: `<h2>탐방 소개</h2>
<p>비무장지대(DMZ) 일대를 직접 방문하여 분단의 현실을 체험하고 평화의 소중함을 느끼는 프로그램입니다.</p>
<h3>탐방 코스</h3>
<ul>
<li>임진각 평화누리공원</li>
<li>도라산역</li>
<li>도라산 전망대</li>
<li>제3땅굴</li>
</ul>
<h3>포함 사항</h3>
<p>왕복 교통비, 입장료, 점심 식사, 여행자 보험</p>`,
      capacity: 30,
      feeType: 'FEE',
      feeAmount: 30000,
      location: '임진각 평화누리공원 집합',
      isOnline: false,
      status: 'RECRUITING',
      recruitStartDate: new Date('2026-01-15'),
      recruitEndDate: new Date('2026-02-28'),
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-15'),
    },
    {
      title: 'K-Move 2025 겨울: 강원도 분단 역사 탐방',
      slug: 'kmove-2025-winter-gangwon',
      type: 'KMOVE',
      description: '강원도 지역의 분단 역사 현장을 탐방합니다.',
      capacity: 25,
      feeType: 'FEE',
      feeAmount: 50000,
      location: '서울역 집합',
      isOnline: false,
      status: 'ONGOING',
      recruitStartDate: new Date('2025-11-01'),
      recruitEndDate: new Date('2025-12-15'),
      startDate: new Date('2026-01-11'),
      endDate: new Date('2026-01-12'),
    },

    // 토론회 (DEBATE)
    {
      title: '2026년 1월 월례 토론회: 청년이 바라보는 통일',
      slug: 'debate-2026-01-youth-unification',
      type: 'DEBATE',
      description: '남북한 청년들이 바라보는 통일에 대한 자유 토론',
      content: `<h2>토론 주제</h2>
<p>청년 세대가 생각하는 통일의 의미와 필요성에 대해 자유롭게 토론합니다.</p>
<h3>토론 형식</h3>
<ul>
<li>발제: 남한 출신 청년 1명, 북한 출신 청년 1명</li>
<li>자유 토론: 전체 참가자</li>
<li>마무리: 의견 정리 및 공유</li>
</ul>`,
      capacity: 20,
      feeType: 'FREE',
      feeAmount: 0,
      location: '온라인 (Zoom) + 오프라인 병행',
      isOnline: true,
      status: 'RECRUITING',
      recruitStartDate: new Date('2026-01-05'),
      recruitEndDate: new Date('2026-01-23'),
      startDate: new Date('2026-01-25'),
      endDate: new Date('2026-01-25'),
    },
    {
      title: '통일 비용 vs 분단 비용 토론회',
      slug: 'debate-unification-cost',
      type: 'DEBATE',
      description: '통일 비용과 분단 비용에 대한 경제적 관점의 토론',
      content: `<h2>토론 배경</h2><p>통일 비용과 분단 비용, 어떤 관점에서 바라봐야 할까요?</p>`,
      capacity: 30,
      feeType: 'FREE',
      feeAmount: 0,
      location: '서울 종로구 ○○회관',
      isOnline: false,
      status: 'COMPLETED',
      recruitStartDate: new Date('2025-11-01'),
      recruitEndDate: new Date('2025-11-20'),
      startDate: new Date('2025-11-30'),
      endDate: new Date('2025-11-30'),
    },
    {
      title: '남북 문화 차이 이해하기 토론회',
      slug: 'debate-culture-difference',
      type: 'DEBATE',
      description: '남북한 문화 차이에 대한 이해와 소통 방안 토론',
      capacity: 25,
      feeType: 'FREE',
      feeAmount: 0,
      location: '온라인 (Zoom)',
      isOnline: true,
      status: 'UPCOMING',
      recruitStartDate: new Date('2026-02-01'),
      recruitEndDate: new Date('2026-02-20'),
      startDate: new Date('2026-02-28'),
      endDate: new Date('2026-02-28'),
    },
  ]

  // 기존 프로그램 삭제하지 않고 upsert
  for (const program of samplePrograms) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      update: {
        title: program.title,
        type: program.type,
        description: program.description,
        content: program.content || null,
        capacity: program.capacity,
        feeType: program.feeType,
        feeAmount: program.feeAmount,
        location: program.location,
        isOnline: program.isOnline,
        status: program.status,
        recruitStartDate: program.recruitStartDate,
        recruitEndDate: program.recruitEndDate,
        startDate: program.startDate,
        endDate: program.endDate,
      },
      create: program,
    })
  }
  console.log(`Created/Updated ${samplePrograms.length} sample programs`)

  // 프로그램 통계 출력
  const programStats = await prisma.program.groupBy({
    by: ['type'],
    _count: true,
  })
  console.log('\n프로그램 현황:')
  const typeLabels: Record<string, string> = {
    BOOKCLUB: '독서모임',
    SEMINAR: '강연/세미나',
    KMOVE: 'K-Move',
    DEBATE: '토론회',
  }
  programStats.forEach(s => {
    console.log(`  ${typeLabels[s.type] || s.type}: ${s._count}개`)
  })

  // =============================================
  // 보증금 샘플 데이터
  // =============================================
  console.log('\nSeeding deposit data...')

  // 프로그램과 사용자 조회
  const programs = await prisma.program.findMany({ take: 3 })
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    take: 7
  })

  if (programs.length > 0 && users.length > 0) {
    // 기존 참여자 삭제
    await prisma.programParticipant.deleteMany({})
    console.log('Cleared existing participants')

    // 보증금 설정 생성
    for (const program of programs) {
      await prisma.depositSetting.upsert({
        where: { programId: program.id },
        update: {
          isEnabled: true,
          totalSessions: 8,
          depositAmount: 50000,
          conditionType: 'ATTENDANCE_ONLY',
          attendanceRate: 80,
        },
        create: {
          programId: program.id,
          isEnabled: true,
          totalSessions: 8,
          depositAmount: 50000,
          conditionType: 'ATTENDANCE_ONLY',
          attendanceRate: 80,
        },
      })
    }
    console.log(`Created deposit settings for ${programs.length} programs`)

    // 참여자 샘플 데이터
    const depositStatuses = ['PAID', 'PAID', 'PAID', 'RETURNED', 'FORFEITED', 'PAID', 'PAID']
    const attendanceRates = [100, 87.5, 75, 100, 50, 62.5, 87.5]

    let participantCount = 0
    for (let i = 0; i < Math.min(users.length, 7); i++) {
      const user = users[i]
      const program = programs[i % programs.length]
      const status = depositStatuses[i]
      const attendanceRate = attendanceRates[i]

      const depositData: any = {
        programId: program.id,
        userId: user.id,
        status: status === 'RETURNED' || status === 'FORFEITED' ? 'COMPLETED' : 'ACTIVE',
        depositAmount: 50000,
        depositStatus: status,
        depositPaidAt: new Date('2025-12-01'),
        finalAttendanceRate: attendanceRate,
      }

      // 정산 완료된 경우
      if (status === 'RETURNED') {
        depositData.returnAmount = 50000
        depositData.returnMethod = 'TRANSFER'
        depositData.settledAt = new Date('2026-01-10')
        depositData.settleNote = '출석률 100% 달성으로 전액 반환'
      } else if (status === 'FORFEITED') {
        depositData.forfeitAmount = 50000
        depositData.settledAt = new Date('2026-01-10')
        depositData.settleNote = '출석률 미달로 전액 차감'
      }

      await prisma.programParticipant.create({ data: depositData })
      participantCount++
    }

    console.log(`Created ${participantCount} participants with deposit data`)

    // 통계 출력
    const stats = await prisma.programParticipant.groupBy({
      by: ['depositStatus'],
      _count: true,
      _sum: { depositAmount: true, returnAmount: true, forfeitAmount: true }
    })
    console.log('\n보증금 현황:')
    stats.forEach(s => {
      console.log(`  ${s.depositStatus}: ${s._count}명, 보증금 ${s._sum.depositAmount?.toLocaleString()}원`)
    })
  } else {
    console.log('No programs or users found, skipping deposit data')
  }

  // =============================================
  // 후원금 샘플 데이터
  // =============================================
  console.log('\nSeeding donation data...')

  // 기존 후원금 삭제
  await prisma.financeDonation.deleteMany({})

  // 샘플 후원금 데이터
  const sampleDonations = [
    // 2025년 11월
    { donorName: '김○○', donorType: 'INDIVIDUAL', amount: 500000, date: '2025-11-10', type: 'ONETIME', receiptIssued: true, receiptNumber: 'D2025-001' },
    { donorName: '(주)○○기업', donorType: 'CORPORATE', amount: 1000000, date: '2025-11-25', type: 'ONETIME', receiptIssued: true, receiptNumber: 'D2025-002' },

    // 2025년 12월
    { donorName: '이○○', donorType: 'INDIVIDUAL', amount: 300000, date: '2025-12-12', type: 'ONETIME', receiptIssued: true, receiptNumber: 'D2025-003' },
    { donorName: '최○○', donorType: 'INDIVIDUAL', amount: 200000, date: '2025-12-12', type: 'ONETIME', receiptIssued: true, receiptNumber: 'D2025-004' },
    { donorName: '(재)○○재단', donorType: 'CORPORATE', amount: 5000000, date: '2025-12-20', type: 'DESIGNATED', designation: '청년교류사업', receiptIssued: true, receiptNumber: 'D2025-005' },

    // 2026년 1월 - 정기 후원
    { donorName: '박○○', donorType: 'INDIVIDUAL', amount: 50000, date: '2026-01-05', type: 'REGULAR', note: '월정기후원', receiptIssued: false },
    { donorName: '정○○', donorType: 'INDIVIDUAL', amount: 30000, date: '2026-01-05', type: 'REGULAR', note: '월정기후원', receiptIssued: false },
    { donorName: '한○○', donorType: 'INDIVIDUAL', amount: 100000, date: '2026-01-05', type: 'REGULAR', note: '월정기후원', receiptIssued: false },
    { donorName: '박○○', donorType: 'INDIVIDUAL', amount: 1000000, date: '2026-01-12', type: 'ONETIME', note: '신년 특별후원', receiptIssued: false },

    // 기업 후원
    { donorName: '(주)△△테크', donorType: 'CORPORATE', amount: 3000000, date: '2026-01-08', type: 'DESIGNATED', designation: '독서모임 운영', receiptIssued: true, receiptNumber: 'D2026-001' },
    { donorName: '○○법률사무소', donorType: 'CORPORATE', amount: 500000, date: '2026-01-10', type: 'ONETIME', receiptIssued: false },
  ]

  for (const donation of sampleDonations) {
    await prisma.financeDonation.create({
      data: {
        donorName: donation.donorName,
        donorType: donation.donorType,
        amount: donation.amount,
        date: new Date(donation.date),
        type: donation.type,
        designation: donation.designation || null,
        receiptIssued: donation.receiptIssued,
        receiptNumber: donation.receiptNumber || null,
        receiptIssuedAt: donation.receiptIssued ? new Date(donation.date) : null,
        note: donation.note || null,
      },
    })
  }

  console.log(`Created ${sampleDonations.length} donation records`)

  // 후원금 통계
  const donationStats = await prisma.financeDonation.aggregate({
    _count: true,
    _sum: { amount: true }
  })
  const byType = await prisma.financeDonation.groupBy({
    by: ['type'],
    _count: true,
    _sum: { amount: true }
  })

  console.log('\n후원금 현황:')
  console.log(`  총 후원: ${donationStats._count}건, ${donationStats._sum.amount?.toLocaleString()}원`)
  byType.forEach(t => {
    const typeLabel = t.type === 'REGULAR' ? '정기후원' : t.type === 'DESIGNATED' ? '지정후원' : '일시후원'
    console.log(`  ${typeLabel}: ${t._count}건, ${t._sum.amount?.toLocaleString()}원`)
  })

  // =============================================
  // 관심사 시스템 초기 데이터
  // =============================================
  console.log('\nSeeding interest system data...')

  // 고정 키워드 (YAML 스펙에 정의된 것들)
  const fixedKeywords = [
    { keyword: '통일교육', category: '교육', isFixed: true, isRecommended: true },
    { keyword: '남북관계', category: '정치/사회', isFixed: true, isRecommended: true },
    { keyword: '한국생활', category: '생활', isFixed: true, isRecommended: true },
    { keyword: '진로상담', category: '진로', isFixed: true, isRecommended: true },
    { keyword: '역사', category: '교육', isFixed: true, isRecommended: true },
    { keyword: '독서', category: '문화', isFixed: true, isRecommended: true },
  ]

  // 추가 추천 키워드
  const recommendedKeywords = [
    { keyword: '북한문화', category: '문화', isFixed: false, isRecommended: true },
    { keyword: '탈북민정착', category: '생활', isFixed: false, isRecommended: true },
    { keyword: '취업', category: '진로', isFixed: false, isRecommended: true },
    { keyword: '심리상담', category: '상담', isFixed: false, isRecommended: true },
    { keyword: '언어', category: '교육', isFixed: false, isRecommended: true },
    { keyword: '문화차이', category: '문화', isFixed: false, isRecommended: true },
    { keyword: '네트워킹', category: '커뮤니티', isFixed: false, isRecommended: true },
    { keyword: '멘토링', category: '교육', isFixed: false, isRecommended: true },
  ]

  const allKeywords = [...fixedKeywords, ...recommendedKeywords]

  for (const kw of allKeywords) {
    await prisma.interestKeyword.upsert({
      where: { keyword: kw.keyword },
      update: {
        category: kw.category,
        isFixed: kw.isFixed,
        isRecommended: kw.isRecommended,
      },
      create: {
        keyword: kw.keyword,
        category: kw.category,
        isFixed: kw.isFixed,
        isRecommended: kw.isRecommended,
        totalCount: 0,
        monthlyCount: 0,
        likeCount: 0,
      },
    })
  }
  console.log(`Created ${allKeywords.length} interest keywords (${fixedKeywords.length} fixed, ${recommendedKeywords.length} recommended)`)

  // 관심사 시스템 설정 초기값
  const interestSettings = [
    { key: 'maxInterestsPerDay', value: '3', description: '하루 최대 관심사 입력 수' },
    { key: 'allowAnonymous', value: 'true', description: '익명 입력 허용 여부' },
    { key: 'wordcloudMinCount', value: '1', description: '워드클라우드 표시 최소 언급 수' },
    { key: 'topRankingCount', value: '5', description: '인기 순위 표시 개수' },
    { key: 'monthlyResetDay', value: '1', description: '월간 통계 초기화 일' },
    { key: 'alertEmailEnabled', value: 'true', description: '알림 이메일 발송 활성화' },
  ]

  for (const setting of interestSettings) {
    await prisma.interestSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: setting,
    })
  }
  console.log(`Created ${interestSettings.length} interest settings`)

  // =============================================
  // 리서치랩 전문가 카테고리 초기 데이터
  // =============================================
  console.log('\nSeeding expert categories...')

  const expertCategories = [
    { name: '통일·북한학', nameEn: 'Unification Studies', icon: 'BookOpen', color: '#3B82F6', sortOrder: 1 },
    { name: '정치·외교', nameEn: 'Politics & Diplomacy', icon: 'Globe', color: '#10B981', sortOrder: 2 },
    { name: '경제·경영', nameEn: 'Economy & Business', icon: 'TrendingUp', color: '#F59E0B', sortOrder: 3 },
    { name: '교육·상담', nameEn: 'Education & Counseling', icon: 'GraduationCap', color: '#8B5CF6', sortOrder: 4 },
    { name: '문화·예술', nameEn: 'Culture & Arts', icon: 'Palette', color: '#EC4899', sortOrder: 5 },
    { name: '언론·미디어', nameEn: 'Media & Communications', icon: 'Mic', color: '#EF4444', sortOrder: 6 },
    { name: '법률·인권', nameEn: 'Law & Human Rights', icon: 'Scale', color: '#6366F1', sortOrder: 7 },
    { name: '의료·보건', nameEn: 'Healthcare & Medical', icon: 'Heart', color: '#14B8A6', sortOrder: 8 },
    { name: '사회복지', nameEn: 'Social Welfare', icon: 'Users', color: '#F97316', sortOrder: 9 },
    { name: 'IT·기술', nameEn: 'IT & Technology', icon: 'Cpu', color: '#06B6D4', sortOrder: 10 },
    { name: '기타', nameEn: 'Others', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 99 },
  ]

  for (const category of expertCategories) {
    await prisma.expertCategory.upsert({
      where: { name: category.name },
      update: {
        nameEn: category.nameEn,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
      },
      create: category,
    })
  }
  console.log(`Created ${expertCategories.length} expert categories`)

  // 샘플 전문가 프로필
  const sampleExperts = [
    {
      name: '김○○',
      title: '통일연구원 연구위원',
      organization: '통일연구원',
      email: 'expert1@example.com',
      origin: 'NORTH',
      defectionYear: 2010,
      settlementYear: 2011,
      hometown: '평양',
      categories: '["통일·북한학", "교육·상담"]',
      specialties: '북한 정치체제, 통일교육',
      lectureTopics: '북한 사회의 이해, 통일 준비, 북한이탈주민 정착',
      lectureAreas: '["서울", "경기"]',
      lectureFeeMin: 30,
      lectureFeeMax: 50,
      bio: '북한 김일성종합대학 정치학과 졸업. 2010년 탈북 후 서울대학교에서 정치학 박사학위 취득. 현재 통일연구원 연구위원으로 재직 중.',
      isVerified: true,
      isPublic: true,
      lectureCount: 45,
      consultingCount: 12,
    },
    {
      name: '이○○',
      title: '탈북민지원센터 상담사',
      organization: '○○탈북민지원센터',
      email: 'expert2@example.com',
      origin: 'NORTH',
      defectionYear: 2015,
      settlementYear: 2016,
      hometown: '함경북도',
      categories: '["교육·상담", "사회복지"]',
      specialties: '탈북민 심리상담, 정착지원',
      lectureTopics: '탈북민 정착 경험, 남북 문화 차이, 심리 적응',
      lectureAreas: '["서울", "경기", "인천"]',
      lectureFeeMin: 20,
      lectureFeeMax: 30,
      bio: '북한에서 간호사로 근무. 탈북 후 상담심리학 석사 취득. 탈북민 심리상담 전문가로 활동 중.',
      isVerified: true,
      isPublic: true,
      lectureCount: 28,
      consultingCount: 35,
    },
    {
      name: '박○○',
      title: '작가 / 통일강사',
      organization: '프리랜서',
      email: 'expert3@example.com',
      origin: 'NORTH',
      defectionYear: 2008,
      settlementYear: 2009,
      hometown: '평안남도',
      categories: '["문화·예술", "언론·미디어"]',
      specialties: '북한 문화, 탈북 수기, 통일 강연',
      lectureTopics: '나의 탈북 이야기, 북한의 일상생활, 청소년 통일교육',
      lectureAreas: '["전국"]',
      lectureFeeMin: 40,
      lectureFeeMax: 80,
      bio: '북한에서 기자로 활동. 탈북 후 작가로 활동하며 여러 권의 탈북 수기를 출간. 전국 학교와 기관에서 통일 강연 진행.',
      isVerified: true,
      isPublic: true,
      lectureCount: 120,
      consultingCount: 5,
    },
  ]

  for (const expert of sampleExperts) {
    const existingExpert = await prisma.expertProfile.findFirst({
      where: { email: expert.email }
    })

    if (!existingExpert) {
      await prisma.expertProfile.create({ data: expert })
    }
  }
  console.log(`Created ${sampleExperts.length} sample expert profiles`)

  // =============================================
  // 리서치랩 설문조사 샘플 데이터
  // =============================================
  console.log('\nSeeding lab surveys...')

  const sampleSurveys = [
    {
      title: '북한이탈주민 정착 경험 설문조사',
      description: '북한이탈주민의 남한 정착 과정과 경험에 대한 연구입니다. 정착 초기 어려움, 지원 제도 이용 경험, 현재 생활 만족도 등을 조사합니다.',
      type: 'SURVEY',
      targetCount: 50,
      currentCount: 23,
      targetOrigin: 'NORTH',
      estimatedTime: 20,
      questionCount: 30,
      rewardType: 'CASH',
      rewardAmount: 20000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-02-28'),
      status: 'RECRUITING',
      isPublic: true,
      requesterOrg: '○○대학교 통일연구소',
    },
    {
      title: '남북한 언어 차이 인식 조사',
      description: '남북한 언어 차이에 대한 인식과 의사소통 경험을 조사하는 설문입니다.',
      type: 'SURVEY',
      targetCount: 100,
      currentCount: 67,
      targetOrigin: 'ANY',
      estimatedTime: 15,
      questionCount: 25,
      rewardType: 'CASH',
      rewardAmount: 15000,
      startDate: new Date('2025-12-15'),
      endDate: new Date('2026-01-31'),
      status: 'RECRUITING',
      isPublic: true,
      requesterOrg: '국립국어원',
    },
    {
      title: '탈북 청년 진로 탐색 인터뷰',
      description: '탈북 청년들의 진로 탐색 과정과 취업 경험에 대한 심층 인터뷰입니다. 1:1 화상 인터뷰로 진행됩니다.',
      type: 'INTERVIEW',
      targetCount: 20,
      currentCount: 8,
      targetOrigin: 'NORTH',
      targetAgeMin: 20,
      targetAgeMax: 35,
      estimatedTime: 60,
      rewardType: 'CASH',
      rewardAmount: 50000,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-03-31'),
      status: 'RECRUITING',
      isPublic: true,
      requesterOrg: '한국청소년정책연구원',
    },
    {
      title: '통일 인식 조사 (남북한 청년 비교)',
      description: '남북한 출신 청년들의 통일에 대한 인식을 비교 분석하는 연구입니다.',
      type: 'SURVEY',
      targetCount: 200,
      currentCount: 200,
      targetOrigin: 'ANY',
      estimatedTime: 25,
      questionCount: 40,
      rewardType: 'CASH',
      rewardAmount: 20000,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-12-31'),
      status: 'COMPLETED',
      isPublic: true,
      requesterOrg: '통일연구원',
    },
  ]

  for (const survey of sampleSurveys) {
    const existingSurvey = await prisma.labSurvey.findFirst({
      where: { title: survey.title }
    })

    if (!existingSurvey) {
      await prisma.labSurvey.create({ data: survey })
    }
  }
  console.log(`Created ${sampleSurveys.length} sample lab surveys`)

  // =============================================
  // 연구동향 샘플 데이터
  // =============================================
  console.log('\nSeeding research trends...')

  const sampleTrends = [
    {
      title: '북한이탈주민의 남한 사회 적응과 정착 지원 정책 연구',
      authors: '김○○, 이○○',
      source: 'RISS',
      sourceUrl: 'https://www.riss.kr/example1',
      publishedDate: new Date('2025-12-15'),
      abstract: '본 연구는 북한이탈주민의 남한 사회 적응 과정을 분석하고, 현행 정착 지원 정책의 효과성을 평가하여 개선 방안을 제시한다. 정착 초기 어려움, 취업, 사회적 관계 형성 등 다양한 측면에서 적응 현황을 파악하였다.',
      keywords: '북한이탈주민, 사회적응, 정착지원, 통일정책',
      category: '탈북민',
      isActive: true,
    },
    {
      title: '한반도 평화 프로세스와 남북관계 전망',
      authors: '박○○',
      source: 'KINU',
      sourceUrl: 'https://www.kinu.or.kr/example2',
      publishedDate: new Date('2025-11-20'),
      abstract: '최근 한반도 정세 변화와 남북관계 동향을 분석하고, 향후 평화 프로세스의 방향성을 전망한다. 국제 정세와 북미 관계 등 외부 요인이 남북관계에 미치는 영향을 종합적으로 검토하였다.',
      keywords: '한반도평화, 남북관계, 북미관계, 비핵화',
      category: '정치·외교',
      isActive: true,
    },
    {
      title: '북한 경제의 구조적 변화와 시장화 연구',
      authors: '최○○, 정○○',
      source: 'DBPIA',
      sourceUrl: 'https://www.dbpia.co.kr/example3',
      publishedDate: new Date('2025-10-05'),
      abstract: '김정은 집권 이후 북한 경제의 구조적 변화를 시장화 관점에서 분석한다. 공식 경제와 비공식 경제의 상호작용, 시장 확산이 주민 생활에 미치는 영향 등을 고찰하였다.',
      keywords: '북한경제, 시장화, 경제개혁, 주민생활',
      category: '경제·사회',
      isActive: true,
    },
    {
      title: '통일교육의 효과성 제고를 위한 교수학습 방법 연구',
      authors: '한○○',
      source: 'KCI',
      sourceUrl: 'https://www.kci.go.kr/example4',
      publishedDate: new Date('2025-09-15'),
      abstract: '학교 통일교육의 현황을 진단하고, 학습자 중심의 효과적인 교수학습 방법을 제안한다. 체험형, 참여형 통일교육 프로그램의 사례를 분석하고 개선 방향을 모색하였다.',
      keywords: '통일교육, 교수학습방법, 평화교육, 학교교육',
      category: '통일교육',
      isActive: true,
    },
    {
      title: '북한 인권 실태와 국제사회의 대응',
      authors: '윤○○, 장○○',
      source: 'RISS',
      sourceUrl: 'https://www.riss.kr/example5',
      publishedDate: new Date('2025-08-20'),
      abstract: '북한의 인권 상황을 유엔 인권이사회 보고서 등 국제 자료를 바탕으로 분석하고, 국제사회의 대응 방안과 한국 정부의 역할을 검토한다.',
      keywords: '북한인권, 유엔인권이사회, 인권외교, 국제사회',
      category: '인권',
      isActive: true,
    },
    {
      title: '남북한 언어 이질화 현상과 통합 방안',
      authors: '조○○',
      source: 'DBPIA',
      sourceUrl: 'https://www.dbpia.co.kr/example6',
      publishedDate: new Date('2025-07-10'),
      abstract: '분단 이후 심화되고 있는 남북한 언어 이질화 현상을 언어학적 관점에서 분석하고, 언어 통합을 위한 정책적 제언을 제시한다.',
      keywords: '남북한언어, 언어이질화, 통일언어, 언어정책',
      category: '북한사회',
      isActive: true,
    },
    {
      title: '탈북 청소년의 학교 적응과 심리사회적 지원 연구',
      authors: '임○○, 강○○',
      source: 'KCI',
      sourceUrl: 'https://www.kci.go.kr/example7',
      publishedDate: new Date('2025-06-25'),
      abstract: '탈북 청소년의 학교 적응 실태를 조사하고, 심리사회적 어려움을 파악하여 효과적인 지원 방안을 모색한다. 학교 현장의 사례 연구를 통해 실천적 함의를 도출하였다.',
      keywords: '탈북청소년, 학교적응, 심리지원, 교육복지',
      category: '탈북민',
      isActive: true,
    },
    {
      title: '북한의 대외정책 변화와 동북아 국제관계',
      authors: '송○○',
      source: 'KINU',
      sourceUrl: 'https://www.kinu.or.kr/example8',
      publishedDate: new Date('2025-05-30'),
      abstract: '최근 북한의 대외정책 변화를 분석하고, 이것이 동북아 국제관계에 미치는 영향을 고찰한다. 중국, 러시아와의 관계 변화에 주목하였다.',
      keywords: '북한외교, 동북아, 북중관계, 북러관계',
      category: '정치·외교',
      isActive: true,
    },
    {
      title: '남북 경제협력의 새로운 패러다임 모색',
      authors: '문○○, 배○○',
      source: 'RISS',
      sourceUrl: 'https://www.riss.kr/example9',
      publishedDate: new Date('2025-04-15'),
      abstract: '기존 남북 경제협력의 성과와 한계를 평가하고, 새로운 협력 모델을 제안한다. 개성공단 사례를 중심으로 지속가능한 경제협력 방안을 모색하였다.',
      keywords: '남북경협, 개성공단, 경제통합, 평화경제',
      category: '경제·사회',
      isActive: true,
    },
    {
      title: '북한이탈주민 취업 실태와 직업훈련 개선 방안',
      authors: '서○○',
      source: 'DBPIA',
      sourceUrl: 'https://www.dbpia.co.kr/example10',
      publishedDate: new Date('2025-03-20'),
      abstract: '북한이탈주민의 취업 현황과 고용 안정성을 분석하고, 직업훈련 프로그램의 효과성을 평가하여 개선 방안을 제시한다.',
      keywords: '북한이탈주민, 취업, 직업훈련, 고용정책',
      category: '탈북민',
      isActive: true,
    },
  ]

  for (const trend of sampleTrends) {
    const existingTrend = await prisma.researchTrend.findFirst({
      where: { title: trend.title }
    })

    if (!existingTrend) {
      await prisma.researchTrend.create({ data: trend })
    }
  }
  console.log(`Created ${sampleTrends.length} sample research trends`)

  // =============================================
  // 샘플 페이지 (계층 구조) 데이터
  // =============================================
  console.log('\nSeeding sample pages...')

  // 폴더 생성
  const programsFolder = await prisma.pageContent.upsert({
    where: { slug: 'programs-folder' },
    update: {},
    create: {
      slug: 'programs-folder',
      title: '프로그램',
      isFolder: true,
      order: 0,
      isPublished: true,
    },
  })

  const aboutFolder = await prisma.pageContent.upsert({
    where: { slug: 'about-folder' },
    update: {},
    create: {
      slug: 'about-folder',
      title: '소개',
      isFolder: true,
      order: 1,
      isPublished: true,
    },
  })

  // 하위 페이지 생성
  const subPages = [
    { slug: 'bookclub-info', title: '독서모임 안내', parentId: programsFolder.id, order: 0 },
    { slug: 'seminar-info', title: '세미나 안내', parentId: programsFolder.id, order: 1 },
    { slug: 'kmove-info', title: 'K-Move 안내', parentId: programsFolder.id, order: 2 },
    { slug: 'about-us', title: '단체 소개', parentId: aboutFolder.id, order: 0 },
    { slug: 'history', title: '연혁', parentId: aboutFolder.id, order: 1 },
    { slug: 'team', title: '조직 구성', parentId: aboutFolder.id, order: 2 },
  ]

  for (const page of subPages) {
    await prisma.pageContent.upsert({
      where: { slug: page.slug },
      update: { parentId: page.parentId, order: page.order },
      create: {
        slug: page.slug,
        title: page.title,
        parentId: page.parentId,
        isFolder: false,
        order: page.order,
        isPublished: false,
        content: `<h1>${page.title}</h1><p>이 페이지의 내용을 작성해주세요.</p>`,
      },
    })
  }

  console.log(`Created 2 folders and ${subPages.length} sub-pages`)

  console.log('\nSeed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
