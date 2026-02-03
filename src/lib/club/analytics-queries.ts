import prisma from '@/lib/db'
import { createCachedQuery, CacheTags } from '@/lib/cache'

export type Period = '7d' | '30d' | '90d' | '1y'

function getPeriodDates(period: Period) {
  const now = new Date()
  const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period]
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return { start, end: now }
}

// 종합 통계
async function _getOverviewStats(period: Period) {
  const { start, end } = getPeriodDates(period)
  const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()))

  const [
    currentUsers,
    prevUsers,
    currentReports,
    prevReports,
    currentAttendances,
    prevAttendances,
    activeUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.user.count({ where: { createdAt: { gte: prevStart, lt: start } } }),
    prisma.bookReport.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.bookReport.count({ where: { createdAt: { gte: prevStart, lt: start } } }),
    prisma.programAttendance.count({
      where: { checkedAt: { gte: start, lte: end }, status: { in: ['PRESENT', 'LATE'] } },
    }),
    prisma.programAttendance.count({
      where: { checkedAt: { gte: prevStart, lt: start }, status: { in: ['PRESENT', 'LATE'] } },
    }),
    prisma.user.count({
      where: {
        OR: [
          { quotes: { some: { createdAt: { gte: start } } } },
          { programParticipants: { some: { attendances: { some: { checkedAt: { gte: start } } } } } },
        ],
      },
    }),
  ])

  function calcChange(current: number, previous: number) {
    return previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0
  }

  return {
    newUsers: { current: currentUsers, previous: prevUsers, change: calcChange(currentUsers, prevUsers) },
    reports: { current: currentReports, previous: prevReports, change: calcChange(currentReports, prevReports) },
    attendances: { current: currentAttendances, previous: prevAttendances, change: calcChange(currentAttendances, prevAttendances) },
    activeUsers,
  }
}

export const getOverviewStats = createCachedQuery(
  _getOverviewStats,
  ['analytics', 'overview'],
  { tags: [CacheTags.analytics], revalidate: 600 }
)

// 일별 성장 데이터
async function _getDailyGrowth(period: Period) {
  const { start } = getPeriodDates(period)

  const [users, reports] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.bookReport.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
  ])

  const dailyData: Record<string, { users: number; reports: number }> = {}

  users.forEach((u) => {
    const date = u.createdAt.toISOString().split('T')[0]
    if (!dailyData[date]) dailyData[date] = { users: 0, reports: 0 }
    dailyData[date].users += 1
  })

  reports.forEach((r) => {
    const date = r.createdAt.toISOString().split('T')[0]
    if (!dailyData[date]) dailyData[date] = { users: 0, reports: 0 }
    dailyData[date].reports += 1
  })

  return Object.entries(dailyData)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export const getDailyGrowth = createCachedQuery(
  _getDailyGrowth,
  ['analytics', 'daily-growth'],
  { tags: [CacheTags.analytics], revalidate: 600 }
)

// 사용자 분석
async function _getUserAnalytics(period: Period) {
  const { start } = getPeriodDates(period)

  const [totalUsers, newUsers, activeUsers, roleDistribution] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: start } } }),
    prisma.user.count({
      where: {
        OR: [
          { quotes: { some: { createdAt: { gte: start } } } },
          { programParticipants: { some: { attendances: { some: { checkedAt: { gte: start } } } } } },
        ],
      },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
  ])

  return {
    totalUsers,
    newUsers,
    activeUsers,
    retentionRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
    roleDistribution: roleDistribution.map((r) => ({
      role: r.role,
      count: r._count,
    })),
  }
}

export const getUserAnalytics = createCachedQuery(
  _getUserAnalytics,
  ['analytics', 'users'],
  { tags: [CacheTags.analytics], revalidate: 600 }
)

// 콘텐츠 분석
async function _getContentAnalytics(period: Period) {
  const { start } = getPeriodDates(period)

  const [totalReports, newReports, totalQuotes, newQuotes, avgRating, topBooks] =
    await Promise.all([
      prisma.bookReport.count(),
      prisma.bookReport.count({ where: { createdAt: { gte: start } } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { createdAt: { gte: start } } }),
      prisma.bookReport.aggregate({
        where: { rating: { not: null } },
        _avg: { rating: true },
      }),
      prisma.bookReport.groupBy({
        by: ['bookTitle'],
        _count: { bookTitle: true },
        orderBy: { _count: { bookTitle: 'desc' } },
        take: 10,
      }),
    ])

  return {
    totalReports,
    newReports,
    totalQuotes,
    newQuotes,
    avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
    topBooks: topBooks.map((b) => ({ title: b.bookTitle, count: b._count.bookTitle })),
  }
}

export const getContentAnalytics = createCachedQuery(
  _getContentAnalytics,
  ['analytics', 'content'],
  { tags: [CacheTags.analytics, CacheTags.bookReports], revalidate: 600 }
)

// 참여도 분석
async function _getEngagementAnalytics(period: Period) {
  const { start } = getPeriodDates(period)

  const [totalSessions, attendanceStats, programStats] = await Promise.all([
    prisma.programSession.count({
      where: { date: { gte: start, lte: new Date() } },
    }),
    prisma.programAttendance.groupBy({
      by: ['status'],
      where: { checkedAt: { gte: start } },
      _count: true,
    }),
    prisma.program.findMany({
      where: { status: 'ONGOING' },
      select: {
        id: true,
        title: true,
        _count: { select: { participants: true, sessions: true } },
      },
    }),
  ])

  const totalAttendances = attendanceStats.reduce((sum, s) => sum + s._count, 0)
  const presentCount = attendanceStats.find((s) => s.status === 'PRESENT')?._count || 0
  const lateCount = attendanceStats.find((s) => s.status === 'LATE')?._count || 0

  return {
    totalSessions,
    attendanceRate:
      totalAttendances > 0
        ? Math.round(((presentCount + lateCount) / totalAttendances) * 100)
        : 0,
    attendanceBreakdown: attendanceStats.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    activePrograms: programStats.map((p) => ({
      id: p.id,
      title: p.title,
      participants: p._count.participants,
      sessions: p._count.sessions,
    })),
  }
}

export const getEngagementAnalytics = createCachedQuery(
  _getEngagementAnalytics,
  ['analytics', 'engagement'],
  { tags: [CacheTags.analytics], revalidate: 600 }
)
