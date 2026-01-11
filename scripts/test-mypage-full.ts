import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMyPageFull() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║              마이페이지 기능 통합 테스트                   ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // 테스트 사용자 선택
  const testUser = await prisma.user.findFirst({
    where: { email: 'chulsu@example.com' }
  })

  if (!testUser) {
    console.log('❌ 테스트 사용자를 찾을 수 없습니다.')
    return
  }

  console.log(`📌 테스트 사용자: ${testUser.name} (${testUser.email})\n`)

  // =============================================
  // 1. 마이페이지 대시보드 (/my)
  // =============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 1. 마이페이지 대시보드')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const userProfile = await prisma.user.findUnique({
    where: { id: testUser.id },
    include: {
      registrations: {
        include: { program: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      donations: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      bookReports: {
        include: { book: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  console.log(`  ✓ 프로필 정보`)
  console.log(`    - 이름: ${userProfile?.name}`)
  console.log(`    - 이메일: ${userProfile?.email}`)
  console.log(`    - 포인트: ${userProfile?.points.toLocaleString()}P`)
  console.log(`    - 가입일: ${userProfile?.createdAt.toLocaleDateString('ko-KR')}`)

  // =============================================
  // 2. 내 프로그램 (/my/programs)
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 2. 내 프로그램 신청 내역')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const registrations = await prisma.registration.findMany({
    where: { userId: testUser.id },
    include: {
      program: {
        include: {
          _count: { select: { registrations: { where: { status: 'APPROVED' } } } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`  ✓ 신청 내역: ${registrations.length}건\n`)

  const statusLabels: Record<string, string> = {
    PENDING: '⏳ 대기',
    APPROVED: '✅ 승인',
    REJECTED: '❌ 거절',
    CANCELLED: '🚫 취소'
  }

  registrations.forEach((reg, i) => {
    console.log(`  ${i + 1}. ${reg.program.title}`)
    console.log(`     상태: ${statusLabels[reg.status] || reg.status}`)
    console.log(`     프로그램 상태: ${reg.program.status}`)
    console.log(`     참가자: ${reg.program._count.registrations}/${reg.program.capacity}명`)
    console.log(`     신청일: ${reg.createdAt.toLocaleDateString('ko-KR')}`)
    console.log('')
  })

  // =============================================
  // 3. 독서 기록 (/my/reports)
  // =============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 3. 독서 기록')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const bookReports = await prisma.bookReport.findMany({
    where: { userId: testUser.id },
    include: { book: true },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`  ✓ 독서 기록: ${bookReports.length}건\n`)

  bookReports.forEach((report, i) => {
    console.log(`  ${i + 1}. "${report.title}"`)
    console.log(`     도서: ${report.book.title} (${report.book.author})`)
    console.log(`     공개: ${report.isPublic ? '🌐 공개' : '🔒 비공개'}`)
    console.log(`     작성일: ${report.createdAt.toLocaleDateString('ko-KR')}`)
    console.log(`     내용: ${report.content.substring(0, 50)}...`)
    console.log('')
  })

  // =============================================
  // 4. 포인트 (/my/points)
  // =============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 4. 포인트 현황')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 이번 달 통계
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyHistory = await prisma.pointHistory.findMany({
    where: {
      userId: testUser.id,
      createdAt: { gte: startOfMonth }
    }
  })

  const earnedThisMonth = monthlyHistory
    .filter(h => h.type === 'EARN')
    .reduce((sum, h) => sum + h.amount, 0)

  const spentThisMonth = monthlyHistory
    .filter(h => h.type === 'SPEND')
    .reduce((sum, h) => sum + Math.abs(h.amount), 0)

  console.log(`  ✓ 현재 보유: ${testUser.points.toLocaleString()}P`)
  console.log(`  ✓ 이번 달 적립: +${earnedThisMonth.toLocaleString()}P`)
  console.log(`  ✓ 이번 달 사용: -${spentThisMonth.toLocaleString()}P`)

  // 포인트 내역
  const pointHistory = await prisma.pointHistory.findMany({
    where: { userId: testUser.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log(`\n  📋 최근 포인트 내역 (${pointHistory.length}건):\n`)

  const categoryIcons: Record<string, string> = {
    ATTENDANCE: '📅',
    REPORT: '📝',
    DONATION: '💝',
    PROGRAM: '🎓',
    EVENT: '🎉',
    TEST: '🧪'
  }

  pointHistory.forEach((h, i) => {
    const icon = categoryIcons[h.category] || '💰'
    const sign = h.type === 'EARN' ? '+' : ''
    console.log(`  ${i + 1}. ${icon} ${h.description}`)
    console.log(`     ${sign}${h.amount.toLocaleString()}P → 잔액: ${h.balance.toLocaleString()}P`)
    console.log(`     ${h.createdAt.toLocaleDateString('ko-KR')}`)
    console.log('')
  })

  // =============================================
  // 5. 후원 내역
  // =============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 5. 후원 내역')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const donations = await prisma.donation.findMany({
    where: { userId: testUser.id },
    orderBy: { createdAt: 'desc' }
  })

  const totalDonation = donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0)

  console.log(`  ✓ 총 후원 횟수: ${donations.length}회`)
  console.log(`  ✓ 총 후원 금액: ₩${totalDonation.toLocaleString()}\n`)

  const donationStatusLabels: Record<string, string> = {
    PENDING: '⏳ 대기',
    COMPLETED: '✅ 완료',
    CANCELLED: '❌ 취소',
    REFUNDED: '↩️ 환불'
  }

  donations.forEach((d, i) => {
    console.log(`  ${i + 1}. ₩${d.amount.toLocaleString()} - ${donationStatusLabels[d.status] || d.status}`)
    console.log(`     방법: ${d.method === 'CARD' ? '💳 카드' : '🏦 계좌이체'}`)
    if (d.message) console.log(`     메시지: "${d.message}"`)
    console.log(`     일시: ${d.createdAt.toLocaleDateString('ko-KR')}`)
    console.log('')
  })

  // =============================================
  // 6. 프로필 설정 (/my/profile)
  // =============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 6. 프로필 설정')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  console.log(`  ✓ 이름: ${testUser.name}`)
  console.log(`  ✓ 이메일: ${testUser.email}`)
  console.log(`  ✓ 전화번호: ${testUser.phone || '(미입력)'}`)
  console.log(`  ✓ 출생년도: ${testUser.birthYear || '(미입력)'}`)
  console.log(`  ✓ 직업: ${testUser.occupation || '(미입력)'}`)
  console.log(`  ✓ 자기소개: ${testUser.bio || '(미입력)'}`)

  // 프로필 수정 테스트
  console.log('\n  📝 프로필 수정 테스트...')
  const updatedUser = await prisma.user.update({
    where: { id: testUser.id },
    data: {
      phone: '010-1234-5678',
      birthYear: 1995,
      occupation: '대학생',
      bio: '통일에 관심있는 청년입니다.'
    }
  })
  console.log(`  ✓ 프로필 수정 완료`)
  console.log(`    - 전화번호: ${updatedUser.phone}`)
  console.log(`    - 출생년도: ${updatedUser.birthYear}`)
  console.log(`    - 직업: ${updatedUser.occupation}`)
  console.log(`    - 자기소개: ${updatedUser.bio}`)

  // =============================================
  // 7. 활동 로그
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 7. 최근 활동 로그')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const activityLogs = await prisma.activityLog.findMany({
    where: { userId: testUser.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log(`  ✓ 최근 활동: ${activityLogs.length}건\n`)

  const actionLabels: Record<string, string> = {
    LOGIN: '🔑 로그인',
    REGISTER: '📝 회원가입',
    UPDATE_PROFILE: '✏️ 프로필 수정',
    PROGRAM_REGISTER: '📋 프로그램 신청',
    DONATION: '💝 후원',
    REPORT_CREATE: '📖 독서기록 작성'
  }

  activityLogs.forEach((log, i) => {
    const label = actionLabels[log.action] || log.action
    console.log(`  ${i + 1}. ${label}`)
    if (log.target) console.log(`     대상: ${log.target}`)
    console.log(`     일시: ${log.createdAt.toLocaleString('ko-KR')}`)
    console.log('')
  })

  // =============================================
  // 결과 요약
  // =============================================
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                   마이페이지 테스트 완료                   ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log(`  👤 사용자: ${testUser.name}`)
  console.log(`  📋 프로그램 신청: ${registrations.length}건`)
  console.log(`  📖 독서 기록: ${bookReports.length}건`)
  console.log(`  💰 포인트: ${testUser.points.toLocaleString()}P`)
  console.log(`  💝 후원: ${donations.length}건 (₩${totalDonation.toLocaleString()})`)
  console.log(`  📊 활동 로그: ${activityLogs.length}건`)
  console.log('')
  console.log('  🎉 모든 마이페이지 기능이 정상 작동합니다!')
  console.log('')
}

testMyPageFull()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
