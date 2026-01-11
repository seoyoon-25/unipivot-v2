import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDonation() {
  console.log('=== 후원 기능 테스트 ===\n')

  // 1. 현재 후원 현황
  console.log('--- 후원 현황 ---')
  const donations = await prisma.donation.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  })

  const totalAmount = donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0)

  console.log(`총 후원 건수: ${donations.length}건`)
  console.log(`완료된 후원금: ₩${totalAmount.toLocaleString()}`)
  console.log('')

  donations.forEach((d, i) => {
    const statusLabel = {
      COMPLETED: '✅ 완료',
      PENDING: '⏳ 대기',
      CANCELLED: '❌ 취소'
    }[d.status] || d.status

    const methodLabel = {
      BANK_TRANSFER: '계좌이체',
      CARD: '카드결제'
    }[d.method || ''] || d.method || '미지정'

    console.log(`${i + 1}. ${d.user?.name || '익명'} - ₩${d.amount.toLocaleString()} (${methodLabel}) - ${statusLabel}`)
    if (d.message) console.log(`   메시지: "${d.message}"`)
  })

  // 2. 대기 중인 후원 확인
  console.log('\n--- 대기 중인 후원 ---')
  const pendingDonations = donations.filter(d => d.status === 'PENDING')
  if (pendingDonations.length === 0) {
    console.log('대기 중인 후원이 없습니다.')
  } else {
    pendingDonations.forEach(d => {
      console.log(`- ${d.user?.name}: ₩${d.amount.toLocaleString()}`)
    })
  }

  // 3. 후원 승인 테스트 (PENDING → COMPLETED)
  if (pendingDonations.length > 0) {
    console.log('\n--- 후원 승인 테스트 ---')
    const donationToApprove = pendingDonations[0]
    console.log(`대상: ${donationToApprove.user?.name} - ₩${donationToApprove.amount.toLocaleString()}`)

    const approved = await prisma.donation.update({
      where: { id: donationToApprove.id },
      data: { status: 'COMPLETED' }
    })
    console.log(`[성공] 상태 변경: PENDING → ${approved.status}`)

    // 포인트 적립 (후원금의 10%)
    const pointsToAdd = Math.floor(donationToApprove.amount * 0.1)
    if (donationToApprove.userId) {
      await prisma.user.update({
        where: { id: donationToApprove.userId },
        data: { points: { increment: pointsToAdd } }
      })
      console.log(`[성공] 포인트 적립: +${pointsToAdd}P`)
    }

    // 활동 로그
    if (donationToApprove.userId) {
      await prisma.activityLog.create({
        data: {
          userId: donationToApprove.userId,
          action: 'DONATION_COMPLETED',
          target: `₩${donationToApprove.amount.toLocaleString()}`,
          targetId: donationToApprove.id
        }
      })
      console.log('[성공] 활동 로그 기록됨')
    }
  }

  // 4. 새 후원 생성 테스트
  console.log('\n--- 새 후원 생성 테스트 ---')
  const newDonation = await prisma.donation.create({
    data: {
      userId: 'cmk90mokt0006b0asb6jno7mw', // 김수진
      amount: 20000,
      type: 'ONE_TIME',
      method: 'CARD',
      message: '테스트 후원입니다',
      status: 'PENDING'
    },
    include: { user: true }
  })
  console.log(`[성공] 후원 생성: ${newDonation.user?.name} - ₩${newDonation.amount.toLocaleString()}`)
  console.log(`상태: ${newDonation.status}`)

  // 5. 최종 통계
  console.log('\n--- 최종 후원 통계 ---')
  const finalDonations = await prisma.donation.findMany({
    where: { status: 'COMPLETED' }
  })
  const finalTotal = finalDonations.reduce((sum, d) => sum + d.amount, 0)
  console.log(`완료된 후원: ${finalDonations.length}건`)
  console.log(`총 후원금: ₩${finalTotal.toLocaleString()}`)

  // 6. 월별 후원 통계
  console.log('\n--- 후원자 순위 ---')
  const userDonations = await prisma.donation.groupBy({
    by: ['userId'],
    where: { status: 'COMPLETED' },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5
  })

  for (const ud of userDonations) {
    if (ud.userId) {
      const user = await prisma.user.findUnique({ where: { id: ud.userId } })
      console.log(`${user?.name}: ₩${ud._sum.amount?.toLocaleString()}`)
    }
  }

  console.log('\n=== 테스트 완료 ===')
}

testDonation()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
