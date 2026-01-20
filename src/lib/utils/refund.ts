/**
 * 보증금 환급 자격 계산 유틸리티
 *
 * 환급 조건:
 * - 출석률 50% 이상 OR
 * - 독후감 제출률 50% 이상
 */

interface AttendanceData {
  present: number
  late: number
  absent: number
  total: number
}

interface ReviewData {
  submitted: number
  total: number
}

export interface RefundEligibility {
  isEligible: boolean
  attendanceRate: number
  attendanceMet: boolean
  reviewRate: number
  reviewMet: boolean
  reason: string
  details: {
    attendance: AttendanceData
    reviews: ReviewData
  }
}

/**
 * 환급 자격 계산
 * @param attendance 출석 데이터
 * @param reviews 독후감 데이터
 * @returns RefundEligibility 환급 자격 정보
 */
export function calculateRefundEligibility(
  attendance: AttendanceData,
  reviews: ReviewData
): RefundEligibility {
  // 출석률 계산 (지각도 출석으로 인정)
  const attendanceRate = attendance.total > 0
    ? Math.round(((attendance.present + attendance.late) / attendance.total) * 100)
    : 0

  // 독후감 제출률 계산
  const reviewRate = reviews.total > 0
    ? Math.round((reviews.submitted / reviews.total) * 100)
    : 0

  // 조건 충족 여부
  const attendanceMet = attendanceRate >= 50
  const reviewMet = reviewRate >= 50

  // 환급 자격 판정
  const isEligible = attendanceMet || reviewMet

  // 사유 생성
  let reason = ''
  if (isEligible) {
    if (attendanceMet && reviewMet) {
      reason = `출석률 ${attendanceRate}%, 독후감 ${reviewRate}% 달성`
    } else if (attendanceMet) {
      reason = `출석률 ${attendanceRate}% 달성`
    } else {
      reason = `독후감 ${reviewRate}% 달성`
    }
  } else {
    reason = `출석률 ${attendanceRate}%, 독후감 ${reviewRate}% (50% 미달)`
  }

  return {
    isEligible,
    attendanceRate,
    attendanceMet,
    reviewRate,
    reviewMet,
    reason,
    details: {
      attendance,
      reviews,
    },
  }
}

/**
 * 환급 필요 금액 계산
 */
export function calculateRefundAmount(
  depositAmount: number,
  eligibility: RefundEligibility
): number {
  return eligibility.isEligible ? depositAmount : 0
}

/**
 * 환급 상태 텍스트 반환
 */
export function getRefundStatusText(eligibility: RefundEligibility): string {
  if (eligibility.isEligible) {
    return '환급 대상'
  }
  return '환급 불가'
}

/**
 * 환급 안내 메시지 생성
 */
export function getRefundGuidanceMessage(
  eligibility: RefundEligibility,
  remainingSessions: number
): string {
  if (eligibility.isEligible) {
    return '축하합니다! 환급 자격을 충족하셨습니다.'
  }

  const { attendanceRate, reviewRate, details } = eligibility
  const messages: string[] = []

  // 출석 안내
  if (attendanceRate < 50 && remainingSessions > 0) {
    const neededAttendance = Math.ceil(details.attendance.total * 0.5) - (details.attendance.present + details.attendance.late)
    if (neededAttendance <= remainingSessions) {
      messages.push(`남은 ${remainingSessions}회차 중 ${neededAttendance}회 이상 출석하면 환급 가능`)
    }
  }

  // 독후감 안내
  if (reviewRate < 50 && remainingSessions > 0) {
    const neededReviews = Math.ceil(details.reviews.total * 0.5) - details.reviews.submitted
    if (neededReviews <= remainingSessions) {
      messages.push(`남은 ${remainingSessions}회차 중 ${neededReviews}개 이상 독후감 제출 시 환급 가능`)
    }
  }

  if (messages.length === 0) {
    return '아쉽지만 환급 조건을 충족하지 못했습니다.'
  }

  return messages.join(' 또는 ')
}

/**
 * 환급 진행 상황 백분율 계산 (더 높은 쪽 기준)
 */
export function getRefundProgress(eligibility: RefundEligibility): number {
  const { attendanceRate, reviewRate } = eligibility
  const progress = Math.max(attendanceRate, reviewRate)
  return Math.min(progress * 2, 100) // 50%가 100%가 되도록 스케일링
}

/**
 * 환급 계좌 정보 유효성 검사
 */
export interface RefundAccountInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export function validateRefundAccount(account: RefundAccountInfo): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!account.bankName.trim()) {
    errors.bankName = '은행명을 입력해주세요'
  }

  if (!account.accountNumber.trim()) {
    errors.accountNumber = '계좌번호를 입력해주세요'
  } else if (!/^[\d-]+$/.test(account.accountNumber.replace(/\s/g, ''))) {
    errors.accountNumber = '올바른 계좌번호 형식이 아닙니다'
  }

  if (!account.accountHolder.trim()) {
    errors.accountHolder = '예금주명을 입력해주세요'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 계좌번호 포맷팅 (마스킹)
 */
export function formatAccountNumber(accountNumber: string, masked = false): string {
  const cleaned = accountNumber.replace(/\D/g, '')

  if (masked && cleaned.length > 4) {
    const visible = cleaned.slice(-4)
    const hidden = '*'.repeat(cleaned.length - 4)
    return hidden + visible
  }

  return cleaned
}
