import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { sendNotification, generateSurveyReminderEmail } from '@/lib/services/notification-sender'

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

// POST: 리마인더 즉시 발송
export async function POST(
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
      include: {
        program: {
          include: {
            applications: {
              where: {
                status: 'APPROVED',
              },
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
        },
        responses: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: '조사를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 마감 확인
    const deadline = new Date(survey.deadline)
    const now = new Date()
    if (deadline < now) {
      return NextResponse.json({ error: '마감된 조사입니다.' }, { status: 400 })
    }

    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // 응답한 사용자 제외
    const respondedUserIds = new Set(survey.responses.map((r) => r.userId))

    // 미응답자 추출
    const nonRespondents = survey.program.applications.filter(
      (app) => app.userId && !respondedUserIds.has(app.userId)
    )

    if (nonRespondents.length === 0) {
      return NextResponse.json({
        message: '모든 참가자가 이미 응답했습니다.',
        sent: 0,
        failed: 0,
      })
    }

    const results = { sent: 0, failed: 0, errors: [] as string[] }
    const surveyLink = `/surveys/${survey.id}/respond`

    for (const application of nonRespondents) {
      if (!application.userId) continue

      try {
        // 통합 알림 발송 (인앱 + 이메일)
        await sendNotification({
          userId: application.userId,
          type: 'SURVEY_REMINDER',
          title: '만족도 조사 리마인더',
          content: `"${survey.title}" 설문이 ${daysUntilDeadline}일 후 마감됩니다.`,
          link: surveyLink,
          email: application.user?.email ? {
            to: application.user.email,
            subject: `[유니피벗] 만족도 조사 참여 안내 - ${survey.title}`,
            html: await generateSurveyReminderEmail(
              application.user.name,
              survey.title,
              daysUntilDeadline,
              surveyLink
            ),
          } : undefined,
        })

        // 리마인더 기록 저장
        await prisma.surveyReminder.create({
          data: {
            surveyId: survey.id,
            applicationId: application.id,
            userId: application.userId,
            daysBeforeDeadline: daysUntilDeadline,
            sentAt: new Date(),
            channel: 'EMAIL',
            status: 'SENT',
          },
        })

        results.sent++
      } catch (error) {
        results.failed++
        results.errors.push(`User ${application.userId}: ${error}`)
        console.error(`Failed to send reminder to ${application.userId}:`, error)
      }
    }

    // 마지막 리마인더 발송 시간 업데이트
    await prisma.satisfactionSurvey.update({
      where: { id },
      data: {
        lastReminderAt: new Date(),
      },
    })

    return NextResponse.json({
      message: `리마인더 발송 완료: ${results.sent}명 성공, ${results.failed}명 실패`,
      sent: results.sent,
      failed: results.failed,
    })
  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json(
      { error: '리마인더 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
