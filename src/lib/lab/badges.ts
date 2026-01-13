// 뱃지 계산 및 관리 로직

import { BadgeData, BadgeTypes } from './constants'

interface LabProfileForBadge {
  surveyCount: number
  interviewCount: number
  lectureCount: number
  expertProfileId?: string | null
  expertVerificationStatus: string
  expertVerifiedAt?: Date | null
  badges?: string | null
}

/**
 * 뱃지 데이터 파싱
 */
export function parseBadges(badgesJson: string | null | undefined): BadgeData {
  if (!badgesJson) return {}
  try {
    return JSON.parse(badgesJson) as BadgeData
  } catch {
    return {}
  }
}

/**
 * 뱃지 데이터 직렬화
 */
export function stringifyBadges(badges: BadgeData): string {
  return JSON.stringify(badges)
}

/**
 * 프로필 기반 뱃지 계산
 */
export function calculateBadges(profile: LabProfileForBadge): BadgeData {
  const existingBadges = parseBadges(profile.badges)
  const now = new Date().toISOString()

  const badges: BadgeData = {}

  // 전문가 뱃지 - 인증 필요
  if (profile.expertProfileId && profile.expertVerificationStatus === 'VERIFIED') {
    badges.expert = {
      earned: true,
      earnedAt: existingBadges.expert?.earnedAt || profile.expertVerifiedAt?.toISOString() || now,
      expertProfileId: profile.expertProfileId,
    }
  } else if (existingBadges.expert?.earned) {
    // 기존에 있었다면 유지 (인증 취소 시 별도 처리 필요)
    badges.expert = existingBadges.expert
  }

  // 강사 뱃지 - 강연 1회 이상
  if (profile.lectureCount >= 1) {
    badges.instructor = {
      earned: true,
      earnedAt: existingBadges.instructor?.earnedAt || now,
      matchCount: profile.lectureCount,
    }
  } else if (existingBadges.instructor) {
    badges.instructor = {
      ...existingBadges.instructor,
      matchCount: profile.lectureCount,
    }
  }

  // 참가자 뱃지 - 설문/인터뷰 1회 이상
  const totalParticipation = profile.surveyCount + profile.interviewCount
  if (totalParticipation >= 1) {
    badges.participant = {
      earned: true,
      earnedAt: existingBadges.participant?.earnedAt || now,
      surveyCount: profile.surveyCount,
      interviewCount: profile.interviewCount,
    }
  } else if (existingBadges.participant) {
    badges.participant = {
      ...existingBadges.participant,
      surveyCount: profile.surveyCount,
      interviewCount: profile.interviewCount,
    }
  }

  return badges
}

/**
 * 획득한 뱃지 목록 반환
 */
export function getEarnedBadges(badges: BadgeData): Array<{
  type: keyof typeof BadgeTypes
  label: string
  description: string
  color: string
  earnedAt?: string
  stats?: string
}> {
  const earned = []

  if (badges.expert?.earned) {
    earned.push({
      type: 'EXPERT' as const,
      ...BadgeTypes.EXPERT,
      earnedAt: badges.expert.earnedAt,
    })
  }

  if (badges.instructor?.earned) {
    earned.push({
      type: 'INSTRUCTOR' as const,
      ...BadgeTypes.INSTRUCTOR,
      earnedAt: badges.instructor.earnedAt,
      stats: `강연 ${badges.instructor.matchCount}회`,
    })
  }

  if (badges.participant?.earned) {
    const stats = []
    if (badges.participant.surveyCount > 0) {
      stats.push(`설문 ${badges.participant.surveyCount}회`)
    }
    if (badges.participant.interviewCount > 0) {
      stats.push(`인터뷰 ${badges.participant.interviewCount}회`)
    }
    earned.push({
      type: 'PARTICIPANT' as const,
      ...BadgeTypes.PARTICIPANT,
      earnedAt: badges.participant.earnedAt,
      stats: stats.join(', '),
    })
  }

  return earned
}

/**
 * 뱃지 업데이트가 필요한지 확인
 */
export function needsBadgeUpdate(
  currentBadges: BadgeData,
  profile: LabProfileForBadge
): boolean {
  const calculatedBadges = calculateBadges(profile)

  // 전문가 뱃지 변경
  if (calculatedBadges.expert?.earned !== currentBadges.expert?.earned) {
    return true
  }

  // 강사 뱃지 변경
  if (calculatedBadges.instructor?.earned !== currentBadges.instructor?.earned) {
    return true
  }
  if (calculatedBadges.instructor?.matchCount !== currentBadges.instructor?.matchCount) {
    return true
  }

  // 참가자 뱃지 변경
  if (calculatedBadges.participant?.earned !== currentBadges.participant?.earned) {
    return true
  }
  if (
    calculatedBadges.participant?.surveyCount !== currentBadges.participant?.surveyCount ||
    calculatedBadges.participant?.interviewCount !== currentBadges.participant?.interviewCount
  ) {
    return true
  }

  return false
}
