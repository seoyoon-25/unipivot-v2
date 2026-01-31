'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

interface SaveSpeakingTimesInput {
  sessionId: string
  times: { userId: string; duration: number }[]
}

export async function saveSpeakingTimes(input: SaveSpeakingTimesInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  try {
    const { sessionId, times } = input

    // Verify session exists and check role
    const programSession = await prisma.programSession.findUnique({
      where: { id: sessionId },
      select: { programId: true },
    })

    if (!programSession) {
      throw new Error('세션을 찾을 수 없습니다')
    }

    // Role check: ADMIN/SUPER_ADMIN or program ORGANIZER/FACILITATOR
    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      const membership = await prisma.programMembership.findFirst({
        where: {
          userId: session.user.id,
          programId: programSession.programId,
          role: { in: ['ORGANIZER', 'FACILITATOR'] },
        },
      })
      if (!membership) {
        throw new Error('권한이 없습니다')
      }
    }

    // Calculate stats
    const totalSpeaking = times.reduce((sum, t) => sum + t.duration, 0)
    const participantCount = times.filter((t) => t.duration > 0).length
    const avgSpeaking =
      participantCount > 0 ? Math.round(totalSpeaking / participantCount) : 0

    const maxTime = Math.max(...times.map((t) => t.duration), 1)
    const minTime = Math.min(
      ...times.filter((t) => t.duration > 0).map((t) => t.duration),
      maxTime
    )
    const balanceScore =
      maxTime > 0 ? Math.round((minTime / maxTime) * 100) : 0

    const topSpeakers = [...times]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3)
      .map((t) => t.userId)

    const silentParticipants = times
      .filter((t) => t.duration === 0)
      .map((t) => t.userId)

    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
      for (const t of times) {
        await tx.speakingTime.upsert({
          where: {
            sessionId_userId: { sessionId, userId: t.userId },
          },
          create: {
            sessionId,
            userId: t.userId,
            duration: t.duration,
            isActive: false,
          },
          update: {
            duration: t.duration,
            isActive: false,
          },
        })
      }

      await tx.sessionSpeakingStats.upsert({
        where: { sessionId },
        create: {
          sessionId,
          totalSpeakingTime: totalSpeaking,
          averageSpeakingTime: avgSpeaking,
          participantCount,
          balanceScore,
          topSpeakers: JSON.stringify(topSpeakers),
          silentParticipants: JSON.stringify(silentParticipants),
        },
        update: {
          totalSpeakingTime: totalSpeaking,
          averageSpeakingTime: avgSpeaking,
          participantCount,
          balanceScore,
          topSpeakers: JSON.stringify(topSpeakers),
          silentParticipants: JSON.stringify(silentParticipants),
        },
      })
    })

    revalidatePath('/club/facilitator/timer')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('발언 시간 저장 중 오류가 발생했습니다')
  }
}

/**
 * 진행자용 세션 목록 (참가자 포함)
 */
export async function getTimerSessions() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  // Get programs where user is facilitator
  const memberships = await prisma.programMembership.findMany({
    where: {
      userId: session.user.id,
      role: { in: ['ORGANIZER', 'FACILITATOR'] },
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          sessions: {
            orderBy: { date: 'desc' },
            take: 10,
            select: {
              id: true,
              sessionNo: true,
              title: true,
              date: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return memberships.map((m) => ({
    programId: m.program.id,
    programTitle: m.program.title,
    sessions: m.program.sessions,
    participants: m.program.participants.map((p) => ({
      userId: p.user.id,
      name: p.user.name,
    })),
  }))
}
