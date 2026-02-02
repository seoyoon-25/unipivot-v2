import prisma from '@/lib/db'

// Helper: find yearly goal (month = null) using findFirst since Prisma
// compound unique doesn't support null in where clause
async function findYearlyGoal(userId: string, year: number) {
  return prisma.readingGoal.findFirst({
    where: { userId, year, month: null },
  })
}

export async function getCurrentGoals(userId: string) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [yearlyGoal, monthlyGoal] = await Promise.all([
    findYearlyGoal(userId, year),
    prisma.readingGoal.findUnique({
      where: { userId_year_month: { userId, year, month } },
    }),
  ])

  return { yearlyGoal, monthlyGoal }
}

/**
 * Update goal progress after a book report is created.
 * BookReport.authorId = Member.id, so we need to find member first.
 */
export async function updateGoalProgress(userId: string) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // BookReport.authorId references Member.id, not User.id
  const member = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  })

  if (!member) return

  // Count reports this year
  const yearlyCount = await prisma.bookReport.count({
    where: {
      authorId: member.id,
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  })

  // Count reports this month
  const monthlyCount = await prisma.bookReport.count({
    where: {
      authorId: member.id,
      createdAt: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  })

  // Update yearly goal
  const yearlyGoal = await findYearlyGoal(userId, year)

  if (yearlyGoal) {
    const isCompleted = yearlyCount >= yearlyGoal.targetBooks
    await prisma.readingGoal.update({
      where: { id: yearlyGoal.id },
      data: {
        achievedBooks: yearlyCount,
        isCompleted,
        completedAt:
          isCompleted && !yearlyGoal.isCompleted ? new Date() : yearlyGoal.completedAt,
      },
    })

    if (isCompleted && !yearlyGoal.isCompleted) {
      await awardGoalBadge(userId, 'GOAL_YEARLY', `${year}년 독서 목표 달성`)
    }
  }

  // Update monthly goal
  const monthlyGoal = await prisma.readingGoal.findUnique({
    where: { userId_year_month: { userId, year, month } },
  })

  if (monthlyGoal) {
    const isCompleted = monthlyCount >= monthlyGoal.targetBooks
    await prisma.readingGoal.update({
      where: { id: monthlyGoal.id },
      data: {
        achievedBooks: monthlyCount,
        isCompleted,
        completedAt:
          isCompleted && !monthlyGoal.isCompleted ? new Date() : monthlyGoal.completedAt,
      },
    })

    if (isCompleted && !monthlyGoal.isCompleted) {
      await awardGoalBadge(userId, 'GOAL_MONTHLY', `${year}년 ${month}월 독서 목표 달성`)
    }
  }
}

/**
 * Award a goal badge using the existing Badge + UserBadge system.
 * Creates the Badge record if it doesn't exist, then links it to the user.
 */
async function awardGoalBadge(userId: string, category: string, badgeName: string) {
  const code = `${category}_${badgeName}`

  const badge = await prisma.badge.upsert({
    where: { code },
    update: {},
    create: {
      code,
      name: badgeName,
      description: badgeName,
      icon: category === 'GOAL_YEARLY' ? 'Trophy' : 'Target',
      category,
      condition: JSON.stringify({ type: category }),
    },
  })

  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  })

  if (!existing) {
    await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    })
  }
}

export async function getUserGoalBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: {
      userId,
      badge: { category: { startsWith: 'GOAL_' } },
    },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  })
}

export async function getGoalHistory(userId: string) {
  return prisma.readingGoal.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
}
