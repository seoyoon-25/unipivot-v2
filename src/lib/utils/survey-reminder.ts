import prisma from '@/lib/db'

/**
 * 설문 리마인더 유틸리티
 */

interface ReminderTarget {
  userId: string
  userName: string | null
  userEmail: string | null
  surveyId: string
  surveyTitle: string
  applicationId: string
  deadline: Date
  daysUntilDeadline: number
}

/**
 * 리마인더 발송 대상 조회
 */
export async function getSurveyReminderTargets(): Promise<ReminderTarget[]> {
  const now = new Date()
  const targets: ReminderTarget[] = []

  // Get active surveys with reminders enabled
  const surveys = await prisma.satisfactionSurvey.findMany({
    where: {
      status: 'ACTIVE',
      reminderEnabled: true,
      deadline: {
        gt: now, // Not expired
      },
    },
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
      reminders: {
        select: {
          userId: true,
          daysBeforeDeadline: true,
          sentAt: true,
        },
      },
    },
  })

  for (const survey of surveys) {
    const deadline = new Date(survey.deadline)
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Parse reminder days
    let reminderDays: number[] = []
    try {
      reminderDays = JSON.parse(survey.reminderDays || '[]')
    } catch {
      reminderDays = [3, 1] // Default
    }

    // Check if today is a reminder day
    if (!reminderDays.includes(daysUntilDeadline)) {
      continue
    }

    // Get users who haven't responded
    const respondedUserIds = new Set(survey.responses.map((r) => r.userId))

    // Get users who already received reminder for this day
    const reminderSentUserIds = new Set(
      survey.reminders
        .filter(
          (r) =>
            r.daysBeforeDeadline === daysUntilDeadline &&
            isSameDay(r.sentAt, now)
        )
        .map((r) => r.userId)
    )

    for (const application of survey.program.applications) {
      // Skip if no userId
      if (!application.userId) {
        continue
      }

      // Skip if already responded
      if (respondedUserIds.has(application.userId)) {
        continue
      }

      // Skip if already sent reminder today for this day
      if (reminderSentUserIds.has(application.userId)) {
        continue
      }

      targets.push({
        userId: application.userId,
        userName: application.user?.name ?? null,
        userEmail: application.user?.email ?? null,
        surveyId: survey.id,
        surveyTitle: survey.title,
        applicationId: application.id,
        deadline: deadline,
        daysUntilDeadline,
      })
    }
  }

  return targets
}

/**
 * 리마인더 발송 처리
 */
export async function sendSurveyReminders() {
  const targets = await getSurveyReminderTargets()
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const target of targets) {
    try {
      // Create notification
      await prisma.notification.create({
        data: {
          userId: target.userId,
          type: 'SURVEY_REMINDER',
          title: '만족도 조사 리마인더',
          content: `"${target.surveyTitle}" 설문이 ${target.daysUntilDeadline}일 후 마감됩니다.`,
          link: `/surveys/${target.surveyId}/respond`,
        },
      })

      // Record reminder sent
      await prisma.surveyReminder.create({
        data: {
          surveyId: target.surveyId,
          applicationId: target.applicationId,
          userId: target.userId,
          daysBeforeDeadline: target.daysUntilDeadline,
          sentAt: new Date(),
        },
      })

      // TODO: Send email/push notification
      // await sendEmail(target.userEmail, ...)
      // await sendPush(target.userId, ...)

      results.sent++
    } catch (error) {
      results.failed++
      results.errors.push(
        `User ${target.userId}, Survey ${target.surveyId}: ${error}`
      )
    }
  }

  return results
}

/**
 * 특정 사용자에게 리마인더 발송
 */
export async function sendReminderToUser(
  surveyId: string,
  userId: string,
  applicationId: string
) {
  const survey = await prisma.satisfactionSurvey.findUnique({
    where: { id: surveyId },
    include: {
      program: true,
    },
  })

  if (!survey) {
    throw new Error('Survey not found')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const deadline = new Date(survey.deadline)
  const now = new Date()
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'SURVEY_REMINDER',
      title: '만족도 조사 안내',
      content: `"${survey.title}" 설문이 ${daysUntilDeadline}일 후 마감됩니다.`,
      link: `/surveys/${surveyId}/respond`,
    },
  })

  // Record reminder
  await prisma.surveyReminder.create({
    data: {
      surveyId,
      applicationId,
      userId,
      daysBeforeDeadline: daysUntilDeadline,
      sentAt: new Date(),
    },
  })

  return { success: true }
}

/**
 * 리마인더 이력 조회
 */
export async function getSurveyReminderHistory(surveyId: string) {
  const reminders = await prisma.surveyReminder.findMany({
    where: { surveyId },
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

  return reminders.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.application?.user?.name || null,
    userEmail: r.application?.user?.email || null,
    daysBeforeDeadline: r.daysBeforeDeadline,
    sentAt: r.sentAt,
    channel: r.channel,
    status: r.status,
  }))
}

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * 만료된 설문 자동 마감
 */
export async function closeExpiredSurveys() {
  const now = new Date()

  const expiredSurveys = await prisma.satisfactionSurvey.findMany({
    where: {
      status: 'ACTIVE',
      deadline: {
        lt: now,
      },
    },
  })

  let closed = 0
  for (const survey of expiredSurveys) {
    await prisma.satisfactionSurvey.update({
      where: { id: survey.id },
      data: {
        status: 'CLOSED',
        closedAt: now,
      },
    })
    closed++
  }

  return {
    closed,
    timestamp: now.toISOString(),
  }
}

/**
 * 독후감 마감 리마인더 발송
 */
export async function sendBookReportReminders() {
  const now = new Date()
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Find sessions with upcoming book report deadlines (tomorrow)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  // Get sessions happening tomorrow (deadline is day before = today 23:59)
  const upcomingSessions = await prisma.programSession.findMany({
    where: {
      date: {
        gte: today,
        lte: tomorrow,
      },
    },
    include: {
      program: {
        include: {
          participants: {
            where: {
              status: 'ACTIVE',
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
    },
  })

  for (const session of upcomingSessions) {
    // Get users who haven't submitted book reports for this session
    const submittedReports = await prisma.bookReport.findMany({
      where: {
        sessionId: session.id,
      },
      select: {
        authorId: true,
      },
    })

    // Get member IDs for participants
    const memberIds = await prisma.member.findMany({
      where: {
        userId: {
          in: session.program.participants.map(p => p.userId),
        },
      },
      select: {
        id: true,
        userId: true,
      },
    })

    const userToMember = new Map(memberIds.map(m => [m.userId, m.id]))
    const submittedMemberIds = new Set(submittedReports.map(r => r.authorId))

    for (const participant of session.program.participants) {
      const memberId = userToMember.get(participant.userId)
      if (memberId && submittedMemberIds.has(memberId)) {
        continue // Already submitted
      }

      try {
        await prisma.notification.create({
          data: {
            userId: participant.userId,
            type: 'BOOK_REPORT_REMINDER',
            title: '독후감 마감 임박',
            content: `"${session.program.title}" ${session.sessionNo}회차 독후감 마감이 내일입니다.`,
            link: `/mypage/programs/${session.programId}/sessions/${session.id}/review/write`,
          },
        })
        results.sent++
      } catch (error) {
        results.failed++
        results.errors.push(`User ${participant.userId}: ${error}`)
      }
    }
  }

  return results
}
