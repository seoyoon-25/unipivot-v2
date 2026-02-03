import prisma from '@/lib/db'

// 활성 챌린지 목록
export async function getActiveChallenges() {
  const now = new Date()

  return prisma.readingChallenge.findMany({
    where: {
      isActive: true,
      endDate: { gte: now },
    },
    include: {
      _count: { select: { participants: true } },
      creator: { select: { name: true } },
    },
    orderBy: { startDate: 'asc' },
  })
}

// 종료된 챌린지 포함 전체 목록
export async function getAllChallenges() {
  return prisma.readingChallenge.findMany({
    include: {
      _count: { select: { participants: true } },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// 챌린지 상세 (리더보드 포함)
export async function getChallengeWithLeaderboard(challengeId: string) {
  return prisma.readingChallenge.findUnique({
    where: { id: challengeId },
    include: {
      creator: { select: { name: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { progress: 'desc' },
      },
    },
  })
}

// 사용자의 챌린지 참가 현황
export async function getUserChallenges(userId: string) {
  return prisma.challengeParticipant.findMany({
    where: { userId },
    include: {
      challenge: {
        include: {
          _count: { select: { participants: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })
}

// 사용자가 특정 챌린지에 참가 중인지 확인
export async function isUserParticipant(challengeId: string, userId: string) {
  const participant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  })
  return !!participant
}

/**
 * 챌린지 진행도 업데이트 (독후감 작성 시 자동 호출)
 * BookReport.authorId = Member.id이므로 member 조회 필요
 */
export async function updateChallengeProgress(userId: string) {
  const now = new Date()

  // Member 조회 (BookReport.authorId = Member.id)
  const member = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  })

  if (!member) return

  // 사용자가 참가 중인 활성 챌린지
  const participations = await prisma.challengeParticipant.findMany({
    where: {
      userId,
      isCompleted: false,
      challenge: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    },
    include: { challenge: true },
  })

  for (const participation of participations) {
    const { challenge } = participation

    // 챌린지 기간 내 독후감 수 계산
    let progress = 0

    if (challenge.type === 'BOOKS_COUNT') {
      progress = await prisma.bookReport.count({
        where: {
          authorId: member.id,
          createdAt: {
            gte: challenge.startDate,
            lte: challenge.endDate,
          },
        },
      })
    } else if (challenge.type === 'GENRE_SPECIFIC' && challenge.targetGenre) {
      // 장르별 챌린지: ReadBook의 category 필드를 기준으로 필터
      const reports = await prisma.bookReport.findMany({
        where: {
          authorId: member.id,
          createdAt: {
            gte: challenge.startDate,
            lte: challenge.endDate,
          },
        },
        select: { bookTitle: true },
      })

      // ReadBook에서 해당 장르의 책 제목 조회
      const genreBooks = await prisma.readBook.findMany({
        where: {
          title: { in: reports.map((r) => r.bookTitle) },
          category: challenge.targetGenre,
        },
        select: { title: true },
      })

      progress = genreBooks.length
    }

    const isCompleted = progress >= challenge.targetValue

    await prisma.challengeParticipant.update({
      where: { id: participation.id },
      data: {
        progress,
        isCompleted,
        completedAt:
          isCompleted && !participation.isCompleted ? new Date() : participation.completedAt,
      },
    })

    // 챌린지 완료 시 배지 부여 (기존 Badge + UserBadge 시스템 사용)
    if (isCompleted && !participation.isCompleted) {
      await awardChallengeBadge(userId, challenge.id, challenge.title, challenge.targetValue)
    }
  }
}

/**
 * 챌린지 완료 배지 부여 (기존 Badge + UserBadge 시스템)
 */
async function awardChallengeBadge(
  userId: string,
  challengeId: string,
  challengeTitle: string,
  targetValue: number
) {
  // Use challengeId (cuid) for safe, unique badge code instead of user-supplied title
  const code = `CHALLENGE_${challengeId}`

  const badge = await prisma.badge.upsert({
    where: { code },
    update: {},
    create: {
      code,
      name: `${challengeTitle} 달성`,
      description: `${targetValue}권 독서 챌린지 완료`,
      icon: 'Trophy',
      category: 'CHALLENGE',
      condition: JSON.stringify({ type: 'CHALLENGE_COMPLETE' }),
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
