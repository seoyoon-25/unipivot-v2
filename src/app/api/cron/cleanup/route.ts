import { NextRequest, NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/cron/auth'
import prisma from '@/lib/db'

/**
 * GET /api/cron/cleanup
 * 매주 일요일 새벽 3시 실행 - 오래된 읽은 알림 삭제 + 만료 챌린지 비활성화
 */
export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 30일 이상 된 읽은 알림 삭제
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: { lt: thirtyDaysAgo },
      },
    })

    // 만료된 챌린지 비활성화
    const expiredChallenges = await prisma.readingChallenge.updateMany({
      where: {
        isActive: true,
        endDate: { lt: now },
      },
      data: { isActive: false },
    })

    // 90일 이상 된 이메일 로그 삭제
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const deletedEmailLogs = await prisma.emailLog.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    })

    console.log('[Cleanup]', {
      deletedNotifications: deletedNotifications.count,
      expiredChallenges: expiredChallenges.count,
      deletedEmailLogs: deletedEmailLogs.count,
    })

    return NextResponse.json({
      success: true,
      deletedNotifications: deletedNotifications.count,
      expiredChallenges: expiredChallenges.count,
      deletedEmailLogs: deletedEmailLogs.count,
    })
  } catch (error) {
    console.error('Cleanup cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
