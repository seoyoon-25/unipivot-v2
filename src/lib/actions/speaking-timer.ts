'use server'

import prisma from '@/lib/db'

// 참가자의 타이머 시작/정지
export async function toggleSpeakingTimer(
  sessionId: string,
  userId: string
) {
  // 현재 상태 조회
  const existing = await prisma.speakingTime.findUnique({
    where: {
      sessionId_userId: { sessionId, userId }
    }
  })

  if (!existing) {
    // 새로 생성하고 시작
    return await prisma.speakingTime.create({
      data: {
        sessionId,
        userId,
        isActive: true,
        duration: 0
      }
    })
  }

  // 토글
  if (existing.isActive) {
    // 정지 - 시간은 클라이언트에서 업데이트
    return await prisma.speakingTime.update({
      where: { id: existing.id },
      data: { isActive: false }
    })
  } else {
    // 다른 발언자 중지
    await prisma.speakingTime.updateMany({
      where: {
        sessionId,
        isActive: true,
        NOT: { userId }
      },
      data: { isActive: false }
    })

    // 시작
    return await prisma.speakingTime.update({
      where: { id: existing.id },
      data: { isActive: true }
    })
  }
}

// 발언 시간 업데이트
export async function updateSpeakingDuration(
  sessionId: string,
  userId: string,
  duration: number
) {
  return await prisma.speakingTime.upsert({
    where: {
      sessionId_userId: { sessionId, userId }
    },
    create: {
      sessionId,
      userId,
      duration,
      isActive: false
    },
    update: {
      duration
    }
  })
}

// 모든 타이머 리셋
export async function resetAllTimers(sessionId: string) {
  await prisma.speakingTime.updateMany({
    where: { sessionId },
    data: {
      duration: 0,
      isActive: false
    }
  })

  // 통계도 리셋
  await prisma.sessionSpeakingStats.deleteMany({
    where: { sessionId }
  })

  return { success: true }
}

// 세션의 모든 발언 시간 조회
export async function getSessionSpeakingTimes(sessionId: string) {
  return await prisma.speakingTime.findMany({
    where: { sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: { duration: 'desc' }
  })
}

// 발언 통계 계산 및 저장
export async function calculateSpeakingStats(sessionId: string) {
  const speakingTimes = await prisma.speakingTime.findMany({
    where: { sessionId }
  })

  if (speakingTimes.length === 0) {
    return null
  }

  // 총 발언 시간
  const totalSpeakingTime = speakingTimes.reduce(
    (sum, st) => sum + st.duration,
    0
  )

  // 발언한 참가자 수
  const participantsWithSpeaking = speakingTimes.filter(st => st.duration > 0)
  const participantCount = participantsWithSpeaking.length

  // 평균 발언 시간
  const averageSpeakingTime =
    participantCount > 0 ? Math.floor(totalSpeakingTime / participantCount) : 0

  // 상위 발언자
  const sortedSpeakers = [...speakingTimes]
    .filter(st => st.duration > 0)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map(st => ({
      userId: st.userId,
      duration: st.duration,
      percentage:
        totalSpeakingTime > 0
          ? Math.round((st.duration / totalSpeakingTime) * 100)
          : 0
    }))

  // 발언하지 않은 참가자
  const silentParticipants = speakingTimes
    .filter(st => st.duration === 0)
    .map(st => st.userId)

  // 발언 균형도 점수 계산 (표준편차 기반)
  let balanceScore = 100
  if (participantCount > 1) {
    const mean = averageSpeakingTime
    const variance =
      participantsWithSpeaking.reduce(
        (sum, st) => sum + Math.pow(st.duration - mean, 2),
        0
      ) / participantCount
    const stdDev = Math.sqrt(variance)
    const cv = mean > 0 ? stdDev / mean : 0 // 변동계수
    balanceScore = Math.max(0, Math.round(100 - cv * 100))
  }

  // DB 저장
  const stats = await prisma.sessionSpeakingStats.upsert({
    where: { sessionId },
    create: {
      sessionId,
      totalSpeakingTime,
      averageSpeakingTime,
      participantCount,
      balanceScore,
      topSpeakers: JSON.stringify(sortedSpeakers),
      silentParticipants: JSON.stringify(silentParticipants)
    },
    update: {
      totalSpeakingTime,
      averageSpeakingTime,
      participantCount,
      balanceScore,
      topSpeakers: JSON.stringify(sortedSpeakers),
      silentParticipants: JSON.stringify(silentParticipants)
    }
  })

  return stats
}

// 세션 발언 통계 조회
export async function getSessionSpeakingStats(sessionId: string) {
  return await prisma.sessionSpeakingStats.findUnique({
    where: { sessionId }
  })
}
