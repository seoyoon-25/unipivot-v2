import { NextRequest, NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/cron/auth'
import prisma from '@/lib/db'
import { createNotification } from '@/lib/club/notification-service'
import { sendEmail, sessionReminderTemplate } from '@/lib/email'

/**
 * GET /api/cron/session-reminder
 * 매일 오전 9시 실행 - 내일 예정된 세션 참가자에게 리마인더 발송
 */
export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const tomorrowStart = new Date(now)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)
    tomorrowStart.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrowStart)
    tomorrowEnd.setHours(23, 59, 59, 999)

    // 내일 예정된 세션 조회
    const upcomingSessions = await prisma.programSession.findMany({
      where: {
        date: {
          gte: tomorrowStart,
          lt: tomorrowEnd,
        },
      },
      include: {
        program: {
          include: {
            participants: {
              where: { status: 'ACTIVE' },
              include: {
                user: {
                  select: { id: true, email: true, name: true },
                },
              },
            },
          },
        },
      },
    })

    let notificationsSent = 0
    let emailsSent = 0

    for (const session of upcomingSessions) {
      for (const participant of session.program.participants) {
        // 앱 내 알림 (사용자 설정 체크는 createNotification 내부에서 수행)
        const notification = await createNotification({
          userId: participant.user.id,
          type: 'SESSION_REMINDER',
          title: '모임 리마인더',
          content: `내일 ${session.program.title} ${session.sessionNo}회차 모임이 있습니다.`,
          link: `/club/programs/${session.programId}`,
          programId: session.programId,
          sessionId: session.id,
        })

        if (notification) notificationsSent++

        // 이메일 알림
        if (participant.user.email) {
          const sent = await sendEmail({
            to: participant.user.email,
            subject: `[유니클럽] ${session.program.title} 모임 안내`,
            html: sessionReminderTemplate({
              userName: participant.user.name || '회원',
              programTitle: session.program.title,
              sessionNo: session.sessionNo,
              date: session.date,
              location: session.location || undefined,
            }),
          })
          if (sent) emailsSent++
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessions: upcomingSessions.length,
      notificationsSent,
      emailsSent,
    })
  } catch (error) {
    console.error('Session reminder cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
