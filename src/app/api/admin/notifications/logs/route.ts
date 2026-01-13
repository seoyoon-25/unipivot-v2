import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 알림 발송 로그 목록
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const channel = searchParams.get('channel')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}

    if (channel && channel !== 'all') {
      where.channel = channel
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (date && date !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (date) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = { gte: startDate }
    }

    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { recipientPhone: { contains: search } },
        { recipientEmail: { contains: search } },
      ]
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notificationLog.count({ where }),
    ])

    // Get user info for each log
    const recipientIds = logs
      .filter((log) => log.recipientId)
      .map((log) => log.recipientId as string)

    const users = await prisma.user.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, name: true, email: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const logsWithRecipient = logs.map((log) => ({
      ...log,
      recipient: log.recipientId ? userMap.get(log.recipientId) || null : null,
    }))

    // Get stats
    const [totalCount, sentCount, failedCount, pendingCount, channelCounts] = await Promise.all([
      prisma.notificationLog.count(),
      prisma.notificationLog.count({ where: { status: 'SENT' } }),
      prisma.notificationLog.count({ where: { status: 'FAILED' } }),
      prisma.notificationLog.count({ where: { status: 'PENDING' } }),
      prisma.notificationLog.groupBy({
        by: ['channel'],
        _count: { id: true },
      }),
    ])

    const byChannel = channelCounts.reduce(
      (acc, item) => {
        acc[item.channel] = item._count.id
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      logs: logsWithRecipient,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        total: totalCount,
        sent: sentCount,
        failed: failedCount,
        pending: pendingCount,
        byChannel,
      },
    })
  } catch (error) {
    console.error('Get notification logs error:', error)
    return NextResponse.json(
      { error: '발송 로그를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
