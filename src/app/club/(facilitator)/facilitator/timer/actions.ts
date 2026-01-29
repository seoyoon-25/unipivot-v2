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

  const { sessionId, times } = input

  // Upsert each speaking time
  for (const t of times) {
    await prisma.speakingTime.upsert({
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

  // Calculate and save stats
  const totalSpeaking = times.reduce((sum, t) => sum + t.duration, 0)
  const participantCount = times.filter((t) => t.duration > 0).length
  const avgSpeaking =
    participantCount > 0 ? Math.round(totalSpeaking / participantCount) : 0

  // Balance score: 0-100, higher = more balanced
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

  await prisma.sessionSpeakingStats.upsert({
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

  revalidatePath('/club/facilitator/timer')

  return { success: true }
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
