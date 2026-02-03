import prisma from '@/lib/db'

// 팔로우
export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('자기 자신을 팔로우할 수 없습니다.')
  }

  return prisma.userFollow.create({
    data: { followerId, followingId },
  })
}

// 언팔로우
export async function unfollowUser(followerId: string, followingId: string) {
  return prisma.userFollow.deleteMany({
    where: { followerId, followingId },
  })
}

// 팔로우 여부 확인
export async function isFollowing(followerId: string, followingId: string) {
  const follow = await prisma.userFollow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })
  return !!follow
}

// 팔로워 목록
export async function getFollowers(userId: string, limit = 20) {
  const followers = await prisma.userFollow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: { id: true, name: true, image: true, bio: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return followers.map((f) => f.follower)
}

// 팔로잉 목록
export async function getFollowingList(userId: string, limit = 20) {
  const following = await prisma.userFollow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: { id: true, name: true, image: true, bio: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return following.map((f) => f.following)
}

// 팔로워/팔로잉 수
export async function getFollowCounts(userId: string) {
  const [followersCount, followingCount] = await Promise.all([
    prisma.userFollow.count({ where: { followingId: userId } }),
    prisma.userFollow.count({ where: { followerId: userId } }),
  ])

  return { followers: followersCount, following: followingCount }
}

// 여러 사용자에 대한 팔로우 여부 일괄 확인
export async function getFollowingSet(followerId: string, targetUserIds: string[]) {
  const follows = await prisma.userFollow.findMany({
    where: {
      followerId,
      followingId: { in: targetUserIds },
    },
    select: { followingId: true },
  })

  return new Set(follows.map((f) => f.followingId))
}

// 활동 피드 (팔로잉한 사람들의 활동)
export async function getActivityFeed(userId: string, limit = 20) {
  // 팔로잉 목록
  const followingIds = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })

  const userIds = followingIds.map((f) => f.followingId)
  if (userIds.length === 0) return []

  // BookReport.authorId = Member.id이므로 팔로잉 유저의 member ID 조회
  const members = await prisma.member.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, userId: true },
  })
  const memberIds = members.map((m) => m.id)
  const memberToUser = new Map(members.map((m) => [m.id, m.userId]))

  // 유저 정보 미리 로드
  const usersMap = new Map<string, { id: string; name: string | null; image: string | null }>()
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  })
  for (const u of users) {
    usersMap.set(u.id, u)
  }

  // 독후감, 명문장 활동 조회
  const [reports, quotes] = await Promise.all([
    prisma.bookReport.findMany({
      where: {
        authorId: { in: memberIds },
        isPublic: true,
      },
      select: { id: true, authorId: true, bookTitle: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.quote.findMany({
      where: {
        userId: { in: userIds },
      },
      select: { id: true, userId: true, bookTitle: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ])

  // 통합 및 정렬
  const activities = [
    ...reports.map((r) => {
      const uid = memberToUser.get(r.authorId) || ''
      return {
        type: 'report' as const,
        id: r.id,
        user: usersMap.get(uid) || { id: uid, name: null, image: null },
        title: `"${r.bookTitle}" 독후감을 작성했어요`,
        content: null as string | null,
        link: `/club/bookclub/reviews/${r.id}`,
        createdAt: r.createdAt,
      }
    }),
    ...quotes.map((q) => ({
      type: 'quote' as const,
      id: q.id,
      user: usersMap.get(q.userId) || { id: q.userId, name: null, image: null },
      title: '명문장을 등록했어요',
      content: q.content.length > 100 ? q.content.slice(0, 100) + '...' : q.content,
      link: null as string | null,
      createdAt: q.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  return activities
}

// 독서 친구 추천
export async function discoverUsers(userId: string, limit = 10) {
  // 이미 팔로우한 사용자 제외
  const followingRecords = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const excludeIds = [userId, ...followingRecords.map((f) => f.followingId)]

  // 같은 프로그램 참가자
  const myPrograms = await prisma.programParticipant.findMany({
    where: { userId },
    select: { programId: true },
  })
  const programIds = myPrograms.map((p) => p.programId)

  const sameProgram =
    programIds.length > 0
      ? await prisma.programParticipant.findMany({
          where: {
            programId: { in: programIds },
            userId: { notIn: excludeIds },
          },
          include: {
            user: { select: { id: true, name: true, image: true, bio: true } },
          },
          distinct: ['userId'],
          take: limit,
        })
      : []

  // 활동적인 사용자 (공개 프로필, 독후감 많은 순)
  const activeUsers = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      isPublicProfile: true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      _count: { select: { quotes: true } },
    },
    orderBy: { quotes: { _count: 'desc' } },
    take: limit,
  })

  // 중복 제거 및 합치기
  const seen = new Set<string>()
  const recommendations: {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    reason: string
  }[] = []

  for (const p of sameProgram) {
    if (!seen.has(p.user.id)) {
      seen.add(p.user.id)
      recommendations.push({ ...p.user, reason: '같은 프로그램 참가자' })
    }
  }

  for (const u of activeUsers) {
    if (!seen.has(u.id) && recommendations.length < limit) {
      seen.add(u.id)
      recommendations.push({
        id: u.id,
        name: u.name,
        image: u.image,
        bio: u.bio,
        reason: `명문장 ${u._count.quotes}개 등록`,
      })
    }
  }

  return recommendations.slice(0, limit)
}
