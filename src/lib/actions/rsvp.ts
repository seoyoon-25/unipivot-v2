'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import type { RSVPStatus, RSVPStats } from '@/types/facilitator'

/**
 * 1. RSVP 요청 발송 (세션에 대해)
 */
export async function sendRSVPRequests(
  sessionId: string,
  senderId: string
) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: { program: true },
  })

  if (!session) {
    throw new Error('세션을 찾을 수 없습니다.')
  }

  // 권한 확인 (운영진만)
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId: session.programId,
      userId: senderId,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: senderId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 RSVP를 발송할 수 있습니다.')
  }

  // 활성 참가자 조회
  const participants = await prisma.programParticipant.findMany({
    where: {
      programId: session.programId,
      status: 'ACTIVE',
    },
  })

  // RSVP 생성 (이미 있으면 skip)
  let created = 0
  for (const participant of participants) {
    const existing = await prisma.sessionRSVP.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: participant.userId,
        },
      },
    })

    if (!existing) {
      await prisma.sessionRSVP.create({
        data: {
          sessionId,
          userId: participant.userId,
          status: 'PENDING',
        },
      })
      created++
    }
  }

  // TODO: 참가자들에게 알림 발송

  revalidatePath(`/mypage/programs/${session.programId}`)
  revalidatePath(`/mypage/programs/${session.programId}/sessions/${sessionId}`)

  return { created, total: participants.length }
}

/**
 * 2. RSVP 응답
 */
export async function respondRSVP(
  rsvpId: string,
  userId: string,
  status: RSVPStatus,
  note?: string
) {
  const rsvp = await prisma.sessionRSVP.findUnique({
    where: { id: rsvpId },
    include: { session: true },
  })

  if (!rsvp) {
    throw new Error('RSVP를 찾을 수 없습니다.')
  }

  if (rsvp.userId !== userId) {
    throw new Error('본인의 RSVP만 응답할 수 있습니다.')
  }

  const updated = await prisma.sessionRSVP.update({
    where: { id: rsvpId },
    data: {
      status,
      note,
      respondedAt: new Date(),
    },
  })

  revalidatePath(`/mypage/programs/${rsvp.session.programId}`)
  revalidatePath(`/rsvp/${rsvpId}`)

  return updated
}

/**
 * 3. RSVP 상태 조회 (세션별)
 */
export async function getSessionRSVPStatus(sessionId: string): Promise<RSVPStats> {
  const rsvps = await prisma.sessionRSVP.findMany({
    where: { sessionId },
  })

  const total = rsvps.length
  const attending = rsvps.filter(r => r.status === 'ATTENDING').length
  const notAttending = rsvps.filter(r => r.status === 'NOT_ATTENDING').length
  const maybe = rsvps.filter(r => r.status === 'MAYBE').length
  const pending = rsvps.filter(r => r.status === 'PENDING').length

  return {
    total,
    attending,
    notAttending,
    maybe,
    pending,
    responseRate: total > 0 ? Math.round(((total - pending) / total) * 100) : 0,
  }
}

/**
 * 4. RSVP 목록 조회 (세션별)
 */
export async function getSessionRSVPs(sessionId: string) {
  const rsvps = await prisma.sessionRSVP.findMany({
    where: { sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' },
      { respondedAt: 'desc' },
    ],
  })

  return rsvps
}

/**
 * 5. RSVP 리마인더 발송
 */
export async function sendRSVPReminder(
  sessionId: string,
  senderId: string
) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: { program: true },
  })

  if (!session) {
    throw new Error('세션을 찾을 수 없습니다.')
  }

  // 권한 확인
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId: session.programId,
      userId: senderId,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: senderId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 리마인더를 발송할 수 있습니다.')
  }

  // 미응답자 조회
  const pendingRSVPs = await prisma.sessionRSVP.findMany({
    where: {
      sessionId,
      status: 'PENDING',
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
  })

  // 리마인더 발송 기록 업데이트
  for (const rsvp of pendingRSVPs) {
    await prisma.sessionRSVP.update({
      where: { id: rsvp.id },
      data: { reminderSentAt: new Date() },
    })

    // TODO: 실제 알림 발송 (이메일, 푸시 등)
  }

  revalidatePath(`/mypage/programs/${session.programId}`)

  return { sent: pendingRSVPs.length }
}

/**
 * 6. 내 RSVP 조회
 */
export async function getMyRSVP(sessionId: string, userId: string) {
  const rsvp = await prisma.sessionRSVP.findUnique({
    where: {
      sessionId_userId: { sessionId, userId },
    },
    include: {
      session: {
        include: {
          program: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  })

  return rsvp
}

/**
 * 7. RSVP 직접 응답 (세션/유저로)
 */
export async function respondRSVPDirect(
  sessionId: string,
  userId: string,
  status: RSVPStatus,
  note?: string
) {
  // RSVP가 없으면 생성
  const rsvp = await prisma.sessionRSVP.upsert({
    where: {
      sessionId_userId: { sessionId, userId },
    },
    create: {
      sessionId,
      userId,
      status,
      note,
      respondedAt: new Date(),
    },
    update: {
      status,
      note,
      respondedAt: new Date(),
    },
  })

  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
  })

  if (session) {
    revalidatePath(`/mypage/programs/${session.programId}`)
    revalidatePath(`/mypage/programs/${session.programId}/sessions/${sessionId}`)
  }

  return rsvp
}

/**
 * 8. 자동 RSVP 발송 (Cron용)
 */
export async function autoSendRSVPRequests(daysBeforeSession: number = 3) {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + daysBeforeSession)
  targetDate.setHours(23, 59, 59, 999)

  const startOfDay = new Date()
  startOfDay.setDate(startOfDay.getDate() + daysBeforeSession)
  startOfDay.setHours(0, 0, 0, 0)

  // N일 후 예정된 세션 조회 (RSVP가 없는 것만)
  const sessions = await prisma.programSession.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: targetDate,
      },
      program: {
        rsvpEnabled: true,
        status: 'ACTIVE',
      },
      rsvps: {
        none: {},
      },
    },
    include: {
      program: true,
    },
  })

  let totalCreated = 0

  for (const session of sessions) {
    // 참가자들에게 RSVP 생성
    const participants = await prisma.programParticipant.findMany({
      where: {
        programId: session.programId,
        status: 'ACTIVE',
      },
    })

    for (const participant of participants) {
      const existing = await prisma.sessionRSVP.findUnique({
        where: {
          sessionId_userId: {
            sessionId: session.id,
            userId: participant.userId,
          },
        },
      })

      if (!existing) {
        await prisma.sessionRSVP.create({
          data: {
            sessionId: session.id,
            userId: participant.userId,
            status: 'PENDING',
          },
        })
        totalCreated++
      }
    }

    // TODO: 참가자들에게 알림 발송
  }

  return {
    sessionsProcessed: sessions.length,
    rsvpsCreated: totalCreated,
  }
}

/**
 * 9. 미응답 RSVP 리마인더 자동 발송 (Cron용)
 */
export async function autoSendRSVPReminders(hoursBeforeDeadline: number = 24) {
  const now = new Date()

  // RSVP 마감이 임박한 세션 조회
  const sessions = await prisma.programSession.findMany({
    where: {
      date: {
        gte: now,
      },
      program: {
        rsvpEnabled: true,
        status: 'ACTIVE',
      },
    },
    include: {
      program: true,
      rsvps: {
        where: {
          status: 'PENDING',
          OR: [
            { reminderSentAt: null },
            {
              reminderSentAt: {
                lt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24시간 이상 전
              },
            },
          ],
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
  })

  let totalSent = 0

  for (const session of sessions) {
    const deadlineHours = session.program.rsvpDeadlineHours || 24
    const deadline = new Date(session.date)
    deadline.setHours(deadline.getHours() - deadlineHours)

    // 마감이 hoursBeforeDeadline 시간 내인지 확인
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDeadline <= hoursBeforeDeadline && hoursUntilDeadline > 0) {
      for (const rsvp of session.rsvps) {
        await prisma.sessionRSVP.update({
          where: { id: rsvp.id },
          data: { reminderSentAt: new Date() },
        })

        // TODO: 실제 알림 발송
        totalSent++
      }
    }
  }

  return { sent: totalSent }
}

/**
 * 10. RSVP ID로 조회 (공개 응답 페이지용)
 */
export async function getRSVPById(rsvpId: string) {
  const rsvp = await prisma.sessionRSVP.findUnique({
    where: { id: rsvpId },
    include: {
      session: {
        include: {
          program: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return rsvp
}
