import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 만족도 조사 리마인더 발송 내역
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 조사 정보 조회
    const survey = await prisma.satisfactionSurvey.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        reminderEnabled: true,
        reminderDays: true,
        lastReminderAt: true,
        deadline: true,
        targetCount: true,
        responseCount: true,
        program: {
          select: { id: true, title: true },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: '조사를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 리마인더 발송 내역 조회
    const reminders = await prisma.surveyReminder.findMany({
      where: { surveyId: id },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    })

    // 일별 통계
    const remindersByDay = reminders.reduce(
      (acc, reminder) => {
        const day = reminder.daysBeforeDeadline
        if (!acc[day]) {
          acc[day] = { sent: 0, failed: 0 }
        }
        if (reminder.status === 'SENT') {
          acc[day].sent++
        } else {
          acc[day].failed++
        }
        return acc
      },
      {} as Record<number, { sent: number; failed: number }>
    )

    // 리마인더 설정 일수별 발송 현황
    const reminderDays: number[] = survey.reminderDays
      ? JSON.parse(survey.reminderDays)
      : [3, 1]

    const dayStats = reminderDays.map((day) => ({
      daysBeforeDeadline: day,
      sent: remindersByDay[day]?.sent || 0,
      failed: remindersByDay[day]?.failed || 0,
      total: (remindersByDay[day]?.sent || 0) + (remindersByDay[day]?.failed || 0),
    }))

    return NextResponse.json({
      survey: {
        ...survey,
        reminderDays: reminderDays.map(Number),
      },
      stats: {
        totalReminders: reminders.length,
        uniqueRecipients: new Set(reminders.map((r) => r.userId)).size,
        lastSentAt: reminders[0]?.sentAt || null,
        byDay: dayStats,
      },
      reminders: reminders.map((r) => ({
        id: r.id,
        daysBeforeDeadline: r.daysBeforeDeadline,
        sentAt: r.sentAt,
        channel: r.channel,
        status: r.status,
        user: r.application.user,
      })),
    })
  } catch (error) {
    console.error('Get reminders error:', error)
    return NextResponse.json(
      { error: '리마인더 내역을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
