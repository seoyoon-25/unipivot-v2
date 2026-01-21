'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateLevel } from '@/lib/utils/badges'

// 배지 체크 및 부여
export async function checkAndAwardBadges(userId: string) {
  const awardedBadges: string[] = []

  // 사용자 통계 조회
  const stats = await getUserStats(userId)

  // 배지 조건 정의
  const badgeConditions = [
    {
      code: 'ATTENDANCE_STREAK_5',
      check: () => stats.attendanceStreak >= 5
    },
    {
      code: 'ATTENDANCE_STREAK_10',
      check: () => stats.attendanceStreak >= 10
    },
    {
      code: 'PERFECT_ATTENDANCE',
      check: () => stats.attendanceRate >= 100 && stats.totalSessions >= 4
    },
    {
      code: 'FACILITATOR_3',
      check: () => stats.facilitatedCount >= 3
    },
    {
      code: 'FACILITATOR_10',
      check: () => stats.facilitatedCount >= 10
    },
    {
      code: 'REPORT_WRITER_5',
      check: () => stats.reportCount >= 5
    },
    {
      code: 'REPORT_WRITER_20',
      check: () => stats.reportCount >= 20
    },
    {
      code: 'ACTIVE_SPEAKER',
      check: () => stats.averageSpeakingTime >= 300 // 5분 이상
    },
    {
      code: 'BOOK_LOVER_5',
      check: () => stats.booksRead >= 5
    },
    {
      code: 'BOOK_LOVER_20',
      check: () => stats.booksRead >= 20
    }
  ]

  for (const condition of badgeConditions) {
    if (condition.check()) {
      const awarded = await awardBadge(userId, condition.code)
      if (awarded) {
        awardedBadges.push(condition.code)
      }
    }
  }

  return awardedBadges
}

// 배지 부여
export async function awardBadge(
  userId: string,
  badgeCode: string,
  programId?: string
) {
  // 배지 존재 확인
  const badge = await prisma.badge.findUnique({
    where: { code: badgeCode }
  })

  if (!badge) {
    return false
  }

  // 이미 보유 확인
  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: { userId, badgeId: badge.id }
    }
  })

  if (existing) {
    return false
  }

  // 배지 부여
  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
      programId
    }
  })

  return true
}

// XP 부여
export async function awardXP(userId: string, amount: number, reason: string) {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, xp: amount },
    update: { xp: { increment: amount } }
  })

  // 레벨업 체크
  const newLevel = calculateLevel(profile.xp)
  if (newLevel > profile.level) {
    await prisma.userProfile.update({
      where: { userId },
      data: { level: newLevel }
    })

    // 레벨업 배지 체크
    if (newLevel >= 5) await awardBadge(userId, 'LEVEL_5')
    if (newLevel >= 10) await awardBadge(userId, 'LEVEL_10')
    if (newLevel >= 20) await awardBadge(userId, 'LEVEL_20')
  }

  return { xp: profile.xp + amount, level: newLevel }
}

// 사용자 통계 조회
async function getUserStats(userId: string) {
  const [
    attendances,
    reports,
    facilitations,
    speakingTimes
  ] = await Promise.all([
    prisma.programAttendance.findMany({
      where: {
        participant: { userId },
        status: 'PRESENT'
      }
    }),
    prisma.bookReport.count({
      where: { authorId: userId }
    }),
    prisma.sessionFacilitator.count({
      where: { userId }
    }),
    prisma.speakingTime.findMany({
      where: { userId }
    })
  ])

  // 출석 연속 기록 계산
  const attendanceStreak = calculateAttendanceStreak(attendances)

  // 총 발언 시간
  const totalSpeakingTime = speakingTimes.reduce((sum, st) => sum + st.duration, 0)
  const averageSpeakingTime =
    speakingTimes.length > 0 ? totalSpeakingTime / speakingTimes.length : 0

  // 읽은 책 수 (참여한 프로그램 세션 수)
  const booksRead = await prisma.programSession.count({
    where: {
      attendances: {
        some: {
          participant: { userId },
          status: 'PRESENT'
        }
      }
    }
  })

  return {
    totalSessions: attendances.length,
    attendanceStreak,
    attendanceRate:
      attendances.length > 0
        ? Math.round(
            (attendances.filter(a => a.status === 'PRESENT').length /
              attendances.length) *
              100
          )
        : 0,
    reportCount: reports,
    facilitatedCount: facilitations,
    averageSpeakingTime,
    booksRead
  }
}

// 출석 연속 기록 계산
function calculateAttendanceStreak(attendances: any[]) {
  if (attendances.length === 0) return 0

  // 날짜순 정렬
  const sorted = attendances
    .filter(a => a.status === 'PRESENT')
    .sort(
      (a, b) =>
        new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    )

  let streak = 1
  // 간단한 연속 계산 (연속 출석 세션 수)
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i - 1].checkedAt)
    const prev = new Date(sorted[i].checkedAt)
    const diffDays = Math.floor(
      (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays <= 14) {
      // 2주 이내면 연속으로 간주
      streak++
    } else {
      break
    }
  }

  return streak
}

// 사용자 배지 목록 조회
export async function getUserBadges(userId?: string) {
  const session = await getServerSession(authOptions)
  const targetUserId = userId || session?.user?.id

  if (!targetUserId) return []

  return await prisma.userBadge.findMany({
    where: { userId: targetUserId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' }
  })
}

// 사용자 프로필 조회
export async function getUserProfile(userId?: string) {
  const session = await getServerSession(authOptions)
  const targetUserId = userId || session?.user?.id

  if (!targetUserId) return null

  let profile = await prisma.userProfile.findUnique({
    where: { userId: targetUserId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      }
    }
  })

  // 프로필이 없으면 생성
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        }
      }
    })
  }

  return profile
}

// 프로필 통계 업데이트
export async function updateUserProfileStats(userId: string) {
  const stats = await getUserStats(userId)

  // 참여한 프로그램 수
  const totalPrograms = await prisma.programParticipant.count({
    where: { userId }
  })

  return await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      totalPrograms,
      totalBooks: stats.booksRead,
      totalFacilitated: stats.facilitatedCount,
      attendanceRate: stats.attendanceRate,
      reportRate: stats.reportCount > 0 ? 100 : 0,
      averageSpeakingTime: Math.floor(stats.averageSpeakingTime)
    },
    update: {
      totalPrograms,
      totalBooks: stats.booksRead,
      totalFacilitated: stats.facilitatedCount,
      attendanceRate: stats.attendanceRate,
      averageSpeakingTime: Math.floor(stats.averageSpeakingTime)
    }
  })
}

// 모든 배지 목록 조회
export async function getAllBadges() {
  return await prisma.badge.findMany({
    orderBy: { category: 'asc' }
  })
}

// 배지 시드 데이터 생성
export async function seedBadges() {
  const badges = [
    {
      code: 'ATTENDANCE_STREAK_5',
      name: '꾸준한 독서인',
      description: '5회 연속 출석',
      icon: '🔥',
      category: 'ATTENDANCE',
      condition: JSON.stringify({ type: 'streak', value: 5 })
    },
    {
      code: 'ATTENDANCE_STREAK_10',
      name: '열혈 독서인',
      description: '10회 연속 출석',
      icon: '💪',
      category: 'ATTENDANCE',
      condition: JSON.stringify({ type: 'streak', value: 10 })
    },
    {
      code: 'PERFECT_ATTENDANCE',
      name: '개근왕',
      description: '시즌 개근 달성',
      icon: '👑',
      category: 'ATTENDANCE',
      condition: JSON.stringify({ type: 'perfect', value: 100 })
    },
    {
      code: 'FACILITATOR_3',
      name: '신입 진행자',
      description: '3회 이상 모임 진행',
      icon: '🎤',
      category: 'FACILITATOR',
      condition: JSON.stringify({ type: 'count', value: 3 })
    },
    {
      code: 'FACILITATOR_10',
      name: '베테랑 진행자',
      description: '10회 이상 모임 진행',
      icon: '🌟',
      category: 'FACILITATOR',
      condition: JSON.stringify({ type: 'count', value: 10 })
    },
    {
      code: 'REPORT_WRITER_5',
      name: '기록하는 독서인',
      description: '5개 이상 독후감 작성',
      icon: '✍️',
      category: 'REPORT',
      condition: JSON.stringify({ type: 'count', value: 5 })
    },
    {
      code: 'REPORT_WRITER_20',
      name: '독후감 마스터',
      description: '20개 이상 독후감 작성',
      icon: '📚',
      category: 'REPORT',
      condition: JSON.stringify({ type: 'count', value: 20 })
    },
    {
      code: 'ACTIVE_SPEAKER',
      name: '활발한 토론가',
      description: '평균 발언 시간 5분 이상',
      icon: '💬',
      category: 'SPEAKING',
      condition: JSON.stringify({ type: 'average', value: 300 })
    },
    {
      code: 'BOOK_LOVER_5',
      name: '책 애호가',
      description: '5권 이상 읽기',
      icon: '📖',
      category: 'READING',
      condition: JSON.stringify({ type: 'count', value: 5 })
    },
    {
      code: 'BOOK_LOVER_20',
      name: '다독가',
      description: '20권 이상 읽기',
      icon: '📕',
      category: 'READING',
      condition: JSON.stringify({ type: 'count', value: 20 })
    },
    {
      code: 'LEVEL_5',
      name: '성장하는 독서인',
      description: '레벨 5 달성',
      icon: '⬆️',
      category: 'LEVEL',
      condition: JSON.stringify({ type: 'level', value: 5 })
    },
    {
      code: 'LEVEL_10',
      name: '숙련된 독서인',
      description: '레벨 10 달성',
      icon: '🎯',
      category: 'LEVEL',
      condition: JSON.stringify({ type: 'level', value: 10 })
    },
    {
      code: 'LEVEL_20',
      name: '독서 마스터',
      description: '레벨 20 달성',
      icon: '🏆',
      category: 'LEVEL',
      condition: JSON.stringify({ type: 'level', value: 20 })
    },
    {
      code: 'PRAISED_PARTICIPANT',
      name: '칭찬받은 참가자',
      description: '3회 이상 칭찬 카드 받음',
      icon: '⭐',
      category: 'SPECIAL',
      condition: JSON.stringify({ type: 'praise', value: 3 })
    }
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      create: badge,
      update: badge
    })
  }

  return { success: true, count: badges.length }
}
