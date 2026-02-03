import prisma from '@/lib/db'

export async function collectMetrics() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalUsers,
    todayUsers,
    totalMembers,
    activePrograms,
    totalPrograms,
    todayReports,
    totalReports,
    todayAttendances,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.member.count(),
    prisma.program.count({ where: { status: 'ONGOING' } }),
    prisma.program.count(),
    prisma.bookReport.count({ where: { createdAt: { gte: today } } }),
    prisma.bookReport.count(),
    prisma.programAttendance.count({
      where: { checkedAt: { gte: today }, status: 'PRESENT' },
    }),
  ])

  return {
    timestamp: now.toISOString(),
    users: {
      total: totalUsers,
      today: todayUsers,
      members: totalMembers,
    },
    programs: {
      active: activePrograms,
      total: totalPrograms,
    },
    activity: {
      reportsToday: todayReports,
      reportsTotal: totalReports,
      attendancesToday: todayAttendances,
    },
  }
}
