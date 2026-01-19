import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendSurveyReminder } from '@/lib/services/messaging-service'

// 크론 작업 인증 키 확인
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // 개발 환경에서는 검증 스킵
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // 프로덕션에서 CRON_SECRET이 설정되지 않으면 실패
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

// GET: 리마인더 발송 대상 조회 (테스트용)
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const surveys = await getSurveysNeedingReminders(now)

    return NextResponse.json({
      currentTime: now.toISOString(),
      surveysNeedingReminders: surveys.length,
      surveys: surveys.map((s) => ({
        id: s.id,
        title: s.title,
        deadline: s.deadline,
        daysLeft: Math.ceil(
          (new Date(s.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
        reminderDays: s.reminderDays ? JSON.parse(s.reminderDays) : [3, 1],
        targetCount: s.targetCount,
        responseCount: s.responseCount,
        pendingResponses: s.targetCount - s.responseCount,
      })),
    })
  } catch (error) {
    console.error('Get reminders error:', error)
    return NextResponse.json(
      { error: '리마인더 조회 실패' },
      { status: 500 }
    )
  }
}

// POST: 리마인더 자동 발송 실행
export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results: {
    surveyId: string
    programTitle: string
    daysBeforeDeadline: number
    sent: number
    failed: number
    skipped: number
  }[] = []

  try {
    const now = new Date()
    const surveys = await getSurveysNeedingReminders(now)

    for (const survey of surveys) {
      const reminderDays: number[] = survey.reminderDays
        ? JSON.parse(survey.reminderDays)
        : [3, 1]
      const daysLeft = Math.ceil(
        (new Date(survey.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      // 오늘 발송해야 하는 리마인더 일수 찾기
      const todayReminderDay = reminderDays.find((d) => d === daysLeft)
      if (todayReminderDay === undefined) continue

      // 아직 응답하지 않은 신청자 조회
      const pendingApplications = await prisma.programApplication.findMany({
        where: {
          programId: survey.programId,
          status: 'ACCEPTED',
          surveySubmitted: false,
          // 이미 해당 일수에 리마인더를 받지 않은 사람만
          NOT: {
            surveyReminders: {
              some: {
                surveyId: survey.id,
                daysBeforeDeadline: todayReminderDay,
              },
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      })

      if (pendingApplications.length === 0) {
        results.push({
          surveyId: survey.id,
          programTitle: survey.program.title,
          daysBeforeDeadline: todayReminderDay,
          sent: 0,
          failed: 0,
          skipped: 0,
        })
        continue
      }

      // 전화번호가 있는 수신자만 필터링
      const recipients = pendingApplications
        .filter((app) => app.user?.phone)
        .map((app) => ({
          applicationId: app.id,
          userId: app.user!.id,
          name: app.user!.name || '회원',
          phone: app.user!.phone!,
        }))

      const skipped = pendingApplications.length - recipients.length

      if (recipients.length === 0) {
        results.push({
          surveyId: survey.id,
          programTitle: survey.program.title,
          daysBeforeDeadline: todayReminderDay,
          sent: 0,
          failed: 0,
          skipped,
        })
        continue
      }

      // 리마인더 발송
      const sendResult = await sendSurveyReminder(
        survey.id,
        survey.program.title,
        survey.deadline,
        recipients
      )

      // 발송 기록 저장
      for (const recipient of recipients) {
        try {
          await prisma.surveyReminder.create({
            data: {
              surveyId: survey.id,
              applicationId: recipient.applicationId,
              userId: recipient.userId,
              daysBeforeDeadline: todayReminderDay,
              channel: 'KAKAO',
              status: 'SENT',
            },
          })
        } catch (error) {
          // 중복 키 에러 무시 (이미 발송된 경우)
          console.error('Failed to save reminder record:', error)
        }
      }

      // 조사의 마지막 리마인더 시각 업데이트
      await prisma.satisfactionSurvey.update({
        where: { id: survey.id },
        data: { lastReminderAt: now },
      })

      results.push({
        surveyId: survey.id,
        programTitle: survey.program.title,
        daysBeforeDeadline: todayReminderDay,
        sent: sendResult.sent,
        failed: sendResult.failed,
        skipped,
      })
    }

    const totalSent = results.reduce((sum, r) => sum + r.sent, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0)
    const duration = Date.now() - startTime

    // 실행 로그 기록
    console.log(
      `[Survey Reminders] Completed: ${totalSent} sent, ${totalFailed} failed, ${totalSkipped} skipped (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      summary: {
        surveysProcessed: surveys.length,
        totalSent,
        totalFailed,
        totalSkipped,
        durationMs: duration,
      },
      details: results,
    })
  } catch (error) {
    console.error('Survey reminder cron error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '리마인더 발송 실패',
      },
      { status: 500 }
    )
  }
}

// 리마인더 발송이 필요한 조사 조회
async function getSurveysNeedingReminders(now: Date) {
  // 현재 진행 중인 조사 중 리마인더가 활성화된 것
  const surveys = await prisma.satisfactionSurvey.findMany({
    where: {
      status: 'SENT',
      reminderEnabled: true,
      deadline: {
        gt: now, // 아직 마감되지 않은
      },
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  // 리마인더 발송 일자에 해당하는 조사만 필터링
  return surveys.filter((survey) => {
    const reminderDays: number[] = survey.reminderDays
      ? JSON.parse(survey.reminderDays)
      : [3, 1]
    const daysLeft = Math.ceil(
      (new Date(survey.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return reminderDays.includes(daysLeft)
  })
}
