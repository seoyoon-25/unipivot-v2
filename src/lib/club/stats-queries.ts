import prisma from '@/lib/db'

type Period = '3m' | '6m' | '1y' | 'all'

function getPeriodStart(period: Period): Date | null {
  if (period === 'all') return null
  const now = new Date()
  switch (period) {
    case '3m':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    case '6m':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    case '1y':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  }
}

export async function getStatsOverview(userId: string, period: Period) {
  const periodStart = getPeriodStart(period)

  const [thisMonthAttendance, totalAttendance, totalBooks] = await Promise.all([
    prisma.programAttendance.count({
      where: {
        participant: { userId },
        status: { in: ['PRESENT', 'LATE'] },
        session: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    }),
    prisma.programAttendance.findMany({
      where: {
        participant: { userId },
        ...(periodStart && { session: { date: { gte: periodStart } } }),
      },
      select: { status: true },
    }),
    prisma.bookReport.count({
      where: {
        authorId: userId,
        ...(periodStart && { createdAt: { gte: periodStart } }),
      },
    }),
  ])

  const attendanceRate =
    totalAttendance.length > 0
      ? Math.round(
          (totalAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length /
            totalAttendance.length) *
            100
        )
      : 0

  return {
    thisMonthAttendance,
    attendanceRate,
    totalBooks,
  }
}

export async function getMonthlyAttendance(userId: string, period: Period) {
  const periodStart = getPeriodStart(period)

  const attendances = await prisma.programAttendance.findMany({
    where: {
      participant: { userId },
      ...(periodStart && { session: { date: { gte: periodStart } } }),
    },
    select: {
      status: true,
      session: { select: { date: true } },
    },
    orderBy: { session: { date: 'asc' } },
  })

  const monthlyData: Record<string, { present: number; absent: number; total: number }> = {}

  attendances.forEach((a) => {
    const d = a.session.date
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData[month]) {
      monthlyData[month] = { present: 0, absent: 0, total: 0 }
    }
    monthlyData[month].total++
    if (a.status === 'PRESENT' || a.status === 'LATE') {
      monthlyData[month].present++
    } else {
      monthlyData[month].absent++
    }
  })

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
    rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
  }))
}

export async function getMonthlyReading(userId: string, period: Period) {
  const periodStart = getPeriodStart(period)

  const reports = await prisma.bookReport.findMany({
    where: {
      authorId: userId,
      ...(periodStart && { createdAt: { gte: periodStart } }),
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const monthlyData: Record<string, number> = {}

  reports.forEach((r) => {
    const month = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`
    monthlyData[month] = (monthlyData[month] || 0) + 1
  })

  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count,
  }))
}

export async function getGenreDistribution(userId: string, period: Period) {
  const periodStart = getPeriodStart(period)

  const favorites = await prisma.favoriteBook.findMany({
    where: {
      userId,
      ...(periodStart && { createdAt: { gte: periodStart } }),
    },
    include: {
      readBook: { select: { category: true } },
    },
  })

  const genreCount: Record<string, number> = {}

  favorites.forEach((f) => {
    const genre = f.readBook?.category || 'other'
    genreCount[genre] = (genreCount[genre] || 0) + 1
  })

  const total = Object.values(genreCount).reduce((a, b) => a + b, 0)

  return Object.entries(genreCount)
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}
