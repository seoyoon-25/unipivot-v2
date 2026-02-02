import { NextRequest, NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/cron/auth'
import prisma from '@/lib/db'

/**
 * GET /api/cron/daily-stats
 * 매일 자정 실행 - 어제 통계 집계 + 로그 출력
 */
export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const yesterdayStart = new Date(now)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)

    const yesterdayEnd = new Date(yesterdayStart)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const dateRange = {
      gte: yesterdayStart,
      lt: yesterdayEnd,
    }

    // 어제의 통계 집계
    const [newUsers, newReports, newQuotes, attendances] = await Promise.all([
      prisma.user.count({
        where: { createdAt: dateRange },
      }),
      prisma.bookReport.count({
        where: { createdAt: dateRange },
      }),
      prisma.quote.count({
        where: { createdAt: dateRange },
      }),
      prisma.programAttendance.count({
        where: {
          checkedAt: dateRange,
          status: { in: ['PRESENT', 'LATE'] },
        },
      }),
    ])

    const dateStr = yesterdayStart.toISOString().split('T')[0]

    console.log(`[Daily Stats] ${dateStr}:`, {
      newUsers,
      newReports,
      newQuotes,
      attendances,
    })

    return NextResponse.json({
      success: true,
      date: dateStr,
      stats: { newUsers, newReports, newQuotes, attendances },
    })
  } catch (error) {
    console.error('Daily stats cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
