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
