import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPoints() {
  console.log('=== 포인트 기능 테스트 ===\n')

  // 테스트 사용자들
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true, name: true, points: true }
  })

  console.log('--- 현재 포인트 현황 ---')
  users.forEach(u => {
    console.log(`${u.name}: ${u.points.toLocaleString()}P`)
  })

  // 샘플 포인트 내역 생성
  console.log('\n--- 샘플 포인트 내역 생성 ---')

  const testUser = users[0] // 첫 번째 사용자
  console.log(`테스트 대상: ${testUser.name}`)

  // 기존 포인트 내역 삭제
  await prisma.pointHistory.deleteMany({
    where: { userId: testUser.id }
  })

  // 포인트 내역 생성 함수
  async function addPointHistory(
    userId: string,
    amount: number,
    category: string,
    description: string,
    daysAgo: number = 0
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    })

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)

    return prisma.pointHistory.create({
      data: {
        userId,
        amount,
        type: amount >= 0 ? 'EARN' : 'SPEND',
        category,
        description,
        balance: user!.points,
        createdAt
      }
    })
  }

  // 다양한 포인트 내역 추가
  const histories = [
    { amount: 100, category: 'ATTENDANCE', description: '16기 역사 독서모임 출석', daysAgo: 0 },
    { amount: 200, category: 'REPORT', description: '독서 기록 작성 - 한반도의 미래', daysAgo: 1 },
    { amount: 100, category: 'ATTENDANCE', description: '15기 철학 독서모임 출석', daysAgo: 3 },
    { amount: 500, category: 'PROGRAM', description: '15기 독서모임 완료 보너스', daysAgo: 5 },
    { amount: -300, category: 'EXCHANGE', description: '유니피벗 스티커 교환', daysAgo: 7 },
    { amount: 150, category: 'EVENT', description: '신년 이벤트 참여', daysAgo: 10 },
    { amount: 5000, category: 'DONATION', description: '후원 감사 포인트 (₩50,000)', daysAgo: 15 },
    { amount: 100, category: 'ATTENDANCE', description: '세미나 참석', daysAgo: 20 },
  ]

  for (const h of histories) {
    await addPointHistory(testUser.id, h.amount, h.category, h.description, h.daysAgo)
    const type = h.amount >= 0 ? '적립' : '사용'
    console.log(`[${type}] ${h.description}: ${h.amount >= 0 ? '+' : ''}${h.amount}P`)
  }

  // 다른 사용자들에게도 샘플 내역 추가
  console.log('\n--- 다른 사용자 포인트 내역 추가 ---')
  for (const user of users.slice(1, 4)) {
    await prisma.pointHistory.deleteMany({ where: { userId: user.id } })

    await addPointHistory(user.id, 100, 'ATTENDANCE', '독서모임 출석', 0)
    await addPointHistory(user.id, 200, 'REPORT', '독서 기록 작성', 2)
    await addPointHistory(user.id, 3000, 'DONATION', '후원 감사 포인트', 5)

    console.log(`${user.name}: 3건 추가`)
  }

  // 최종 확인
  console.log('\n--- 포인트 내역 확인 ---')
  const allHistory = await prisma.pointHistory.findMany({
    where: { userId: testUser.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  console.log(`${testUser.name}의 최근 포인트 내역:`)
  allHistory.forEach((h, i) => {
    const typeLabel = h.type === 'EARN' ? '✅' : '🔻'
    const amountStr = h.amount >= 0 ? `+${h.amount}` : `${h.amount}`
    console.log(`${i + 1}. ${typeLabel} ${h.description}: ${amountStr}P (잔액: ${h.balance}P)`)
  })

  // 이번 달 통계
  console.log('\n--- 이번 달 통계 ---')
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyHistory = await prisma.pointHistory.findMany({
    where: {
      userId: testUser.id,
      createdAt: { gte: startOfMonth }
    }
  })

  const earned = monthlyHistory
    .filter(h => h.type === 'EARN')
    .reduce((sum, h) => sum + h.amount, 0)

  const spent = monthlyHistory
    .filter(h => h.type === 'SPEND')
    .reduce((sum, h) => sum + Math.abs(h.amount), 0)

  console.log(`이번 달 적립: +${earned.toLocaleString()}P`)
  console.log(`이번 달 사용: -${spent.toLocaleString()}P`)
  console.log(`현재 보유: ${testUser.points.toLocaleString()}P`)

  console.log('\n=== 테스트 완료 ===')
}

testPoints()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
