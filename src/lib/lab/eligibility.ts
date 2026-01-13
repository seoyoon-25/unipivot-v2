// 설문 참가 자격 확인 로직

interface LabSurveyEligibility {
  targetAgeMin?: number | null
  targetAgeMax?: number | null
  targetCategories?: string | null // JSON array
  targetOrigin?: string | null
}

interface LabProfileEligibility {
  birthYear?: number | null
  user?: {
    originCategory?: string | null
    origin?: string | null
  } | null
}

export interface EligibilityResult {
  eligible: boolean
  reason?: string
  details?: {
    ageCheck?: { passed: boolean; message?: string }
    categoryCheck?: { passed: boolean; message?: string }
    duplicateCheck?: { passed: boolean; message?: string }
  }
}

/**
 * 설문 참가 자격 확인
 */
export function checkSurveyEligibility(
  survey: LabSurveyEligibility,
  profile: LabProfileEligibility,
  alreadyParticipated: boolean = false
): EligibilityResult {
  const details: EligibilityResult['details'] = {}
  const reasons: string[] = []

  // 1. 중복 참여 확인
  if (alreadyParticipated) {
    details.duplicateCheck = {
      passed: false,
      message: '이미 참여한 설문입니다.',
    }
    reasons.push('이미 참여한 설문입니다.')
  } else {
    details.duplicateCheck = { passed: true }
  }

  // 2. 나이 제한 확인
  const currentYear = new Date().getFullYear()
  const userAge = profile.birthYear ? currentYear - profile.birthYear : null

  if (userAge !== null) {
    if (survey.targetAgeMin && userAge < survey.targetAgeMin) {
      const message = `만 ${survey.targetAgeMin}세 이상만 참여 가능합니다. (현재 만 ${userAge}세)`
      details.ageCheck = {
        passed: false,
        message,
      }
      reasons.push(message)
    } else if (survey.targetAgeMax && userAge > survey.targetAgeMax) {
      const message = `만 ${survey.targetAgeMax}세 이하만 참여 가능합니다. (현재 만 ${userAge}세)`
      details.ageCheck = {
        passed: false,
        message,
      }
      reasons.push(message)
    } else {
      details.ageCheck = { passed: true }
    }
  } else if (survey.targetAgeMin || survey.targetAgeMax) {
    const message = '나이 정보가 필요합니다. 프로필을 완성해주세요.'
    details.ageCheck = {
      passed: false,
      message,
    }
    reasons.push(message)
  } else {
    details.ageCheck = { passed: true }
  }

  // 3. 출신 카테고리 확인
  if (survey.targetCategories) {
    try {
      const categories: string[] = JSON.parse(survey.targetCategories)
      if (categories.length > 0) {
        const userCategory = profile.user?.originCategory
        if (!userCategory) {
          const message = '출신 배경 정보가 필요합니다. 프로필을 완성해주세요.'
          details.categoryCheck = {
            passed: false,
            message,
          }
          reasons.push(message)
        } else if (!categories.includes(userCategory)) {
          const message = '이 설문은 특정 출신 배경만 참여 가능합니다.'
          details.categoryCheck = {
            passed: false,
            message,
          }
          reasons.push(message)
        } else {
          details.categoryCheck = { passed: true }
        }
      } else {
        details.categoryCheck = { passed: true }
      }
    } catch {
      details.categoryCheck = { passed: true }
    }
  } else {
    details.categoryCheck = { passed: true }
  }

  // 기존 origin 필드 확인 (레거시 지원)
  if (survey.targetOrigin && survey.targetOrigin !== 'ANY') {
    const userOrigin = profile.user?.origin
    if (!userOrigin) {
      if (!details.categoryCheck || details.categoryCheck.passed) {
        const message = '출신 정보가 필요합니다. 프로필을 완성해주세요.'
        details.categoryCheck = {
          passed: false,
          message,
        }
        reasons.push(message)
      }
    } else if (userOrigin !== survey.targetOrigin) {
      if (!details.categoryCheck || details.categoryCheck.passed) {
        const message = '이 설문은 특정 출신만 참여 가능합니다.'
        details.categoryCheck = {
          passed: false,
          message,
        }
        reasons.push(message)
      }
    }
  }

  const eligible = reasons.length === 0

  return {
    eligible,
    reason: eligible ? undefined : reasons.join(' '),
    details,
  }
}

/**
 * 나이 계산
 */
export function calculateAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear
}

/**
 * 설문 대상 나이대 표시 문자열
 */
export function getTargetAgeRangeText(
  targetAgeMin?: number | null,
  targetAgeMax?: number | null
): string {
  if (!targetAgeMin && !targetAgeMax) return '전 연령'
  if (targetAgeMin && !targetAgeMax) return `만 ${targetAgeMin}세 이상`
  if (!targetAgeMin && targetAgeMax) return `만 ${targetAgeMax}세 이하`
  return `만 ${targetAgeMin}~${targetAgeMax}세`
}
