import prisma from '@/lib/db'

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      favoriteGenre: true,
      isPublicProfile: true,
      createdAt: true,
    },
  })

  if (!user) return null

  // BookReport.authorId references Member.id, not User.id
  const member = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  })

  const [programCount, reportCount, quoteCount, attendances] = await Promise.all([
    prisma.programParticipant.count({
      where: { userId, status: 'ACTIVE' },
    }),
    member
      ? prisma.bookReport.count({ where: { authorId: member.id } })
      : Promise.resolve(0),
    prisma.quote.count({ where: { userId } }),
    prisma.programAttendance.findMany({
      where: { participant: { userId } },
      select: { status: true },
    }),
  ])

  const attendanceRate =
    attendances.length > 0
      ? Math.round(
          (attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length /
            attendances.length) *
            100
        )
      : 0

  return {
    ...user,
    stats: {
      programCount,
      reportCount,
      quoteCount,
      attendanceRate,
    },
  }
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      favoriteGenre: true,
      isPublicProfile: true,
      createdAt: true,
    },
  })

  if (!user) return null

  if (!user.isPublicProfile) {
    return { user, isPublic: false as const }
  }

  // BookReport.authorId references Member.id, not User.id
  const member = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  })

  const [programCount, reportCount, quoteCount] = await Promise.all([
    prisma.programParticipant.count({
      where: { userId, status: 'ACTIVE' },
    }),
    member
      ? prisma.bookReport.count({
          where: { authorId: member.id, isPublic: true },
        })
      : Promise.resolve(0),
    prisma.quote.count({ where: { userId } }),
  ])

  return {
    user,
    isPublic: true as const,
    stats: { programCount, reportCount, quoteCount },
  }
}

export async function getRecentActivity(userId: string, limit = 10) {
  // BookReport.authorId references Member.id, not User.id
  const member = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  })

  const [attendances, reports, quotes] = await Promise.all([
    prisma.programAttendance.findMany({
      where: {
        participant: { userId },
        status: { in: ['PRESENT', 'LATE'] },
      },
      include: {
        session: {
          select: {
            sessionNo: true,
            date: true,
            program: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { session: { date: 'desc' } },
      take: limit,
    }),
    member
      ? prisma.bookReport.findMany({
          where: { authorId: member.id },
          select: { id: true, bookTitle: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
      : (Promise.resolve([]) as Promise<{ id: string; bookTitle: string; createdAt: Date }[]>),
    prisma.quote.findMany({
      where: { userId },
      select: { id: true, bookTitle: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ])

  const activities = [
    ...attendances.map((a) => ({
      type: 'attendance' as const,
      id: a.id,
      title: `${a.session.program.title} ${a.session.sessionNo}회차 출석`,
      createdAt: a.session.date,
    })),
    ...reports.map((r) => ({
      type: 'report' as const,
      id: r.id,
      title: `"${r.bookTitle}" 독후감 작성`,
      link: `/club/bookclub/reviews/${r.id}`,
      createdAt: r.createdAt,
    })),
    ...quotes.map((q) => ({
      type: 'quote' as const,
      id: q.id,
      title: `"${q.bookTitle}" 명문장 등록`,
      createdAt: q.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  return activities
}
