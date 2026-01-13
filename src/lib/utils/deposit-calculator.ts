// 반환 정책 타입
export type RefundPolicyType = 'ONE_TIME' | 'ATTENDANCE_ONLY' | 'ATTENDANCE_AND_REPORT'

// 반환 정책 기준
export interface RefundPolicyCriteria {
  minAttendance: number // 최소 출석률 (%)
  minReport?: number // 최소 독후감 제출률 (%)
  refundRate: number // 반환률 (%)
  label: string // 설명
}

// 기본 반환 정책
export const DEFAULT_REFUND_POLICIES: Record<RefundPolicyType, RefundPolicyCriteria[]> = {
  ONE_TIME: [
    { minAttendance: 100, refundRate: 100, label: '참석 시 전액 반환' },
    { minAttendance: 0, refundRate: 0, label: '불참 시 미반환' },
  ],
  ATTENDANCE_ONLY: [
    { minAttendance: 100, refundRate: 100, label: '출석 100%' },
    { minAttendance: 80, refundRate: 80, label: '출석 80% 이상' },
    { minAttendance: 60, refundRate: 60, label: '출석 60% 이상' },
    { minAttendance: 0, refundRate: 0, label: '출석 60% 미만' },
  ],
  ATTENDANCE_AND_REPORT: [
    { minAttendance: 100, minReport: 100, refundRate: 100, label: '출석 100%, 독후감 100%' },
    { minAttendance: 100, minReport: 80, refundRate: 90, label: '출석 100%, 독후감 80%+' },
    { minAttendance: 80, minReport: 80, refundRate: 80, label: '출석 80%+, 독후감 80%+' },
    { minAttendance: 80, minReport: 60, refundRate: 70, label: '출석 80%+, 독후감 60%+' },
    { minAttendance: 60, minReport: 60, refundRate: 60, label: '출석 60%+, 독후감 60%+' },
    { minAttendance: 0, minReport: 0, refundRate: 0, label: '기준 미달' },
  ],
}

// 계산 입력
export interface DepositCalculationInput {
  depositAmount: number
  refundPolicyType: RefundPolicyType
  refundPolicy: RefundPolicyCriteria[]
  totalSessions: number
  attendedSessions: number
  submittedReports: number
  approvedReports?: number
  surveySubmitted: boolean
  surveyRequired: boolean
  attended?: boolean // 1회성 프로그램용
}

// 계산 결과
export interface DepositCalculationResult {
  attendanceRate: number // 출석률 (%)
  reportRate: number // 독후감 제출률 (%)
  refundRate: number // 반환률 (%)
  refundAmount: number // 반환 금액
  reason: string // 반환 사유
  eligible: boolean // 반환 대상 여부
  ineligibleReason?: string // 반환 불가 사유
  matchedPolicy?: RefundPolicyCriteria // 적용된 정책
}

/**
 * 보증금 반환 금액 계산
 */
export function calculateRefund(input: DepositCalculationInput): DepositCalculationResult {
  const {
    depositAmount,
    refundPolicyType,
    refundPolicy,
    totalSessions,
    attendedSessions,
    submittedReports,
    approvedReports,
    surveySubmitted,
    surveyRequired,
    attended,
  } = input

  // 만족도 조사 필수인데 미제출인 경우
  if (surveyRequired && !surveySubmitted) {
    return {
      attendanceRate: 0,
      reportRate: 0,
      refundRate: 0,
      refundAmount: 0,
      reason: '만족도 조사 미제출',
      eligible: false,
      ineligibleReason: '만족도 조사에 응답하지 않아 보증금이 반환되지 않습니다.',
    }
  }

  // 1회성 프로그램
  if (refundPolicyType === 'ONE_TIME') {
    if (attended) {
      return {
        attendanceRate: 100,
        reportRate: 0,
        refundRate: 100,
        refundAmount: depositAmount,
        reason: '참석 완료',
        eligible: true,
        matchedPolicy: refundPolicy[0],
      }
    } else {
      return {
        attendanceRate: 0,
        reportRate: 0,
        refundRate: 0,
        refundAmount: 0,
        reason: '불참',
        eligible: false,
        ineligibleReason: '프로그램에 불참하여 보증금이 반환되지 않습니다.',
        matchedPolicy: refundPolicy[1],
      }
    }
  }

  // 다회차 프로그램 - 출석률 계산
  const attendanceRate =
    totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0

  // 독후감 제출률 계산 (승인된 것 기준, 없으면 제출된 것 기준)
  const reportCount = approvedReports ?? submittedReports
  const reportRate = totalSessions > 0 ? Math.round((reportCount / totalSessions) * 100) : 0

  // 정책에서 반환률 결정 (정렬된 정책에서 첫 번째 매칭)
  let matchedPolicy: RefundPolicyCriteria | undefined
  let refundRate = 0
  let reason = ''

  // 정책을 높은 기준부터 확인
  const sortedPolicies = [...refundPolicy].sort((a, b) => b.minAttendance - a.minAttendance)

  for (const policy of sortedPolicies) {
    if (refundPolicyType === 'ATTENDANCE_ONLY') {
      if (attendanceRate >= policy.minAttendance) {
        matchedPolicy = policy
        refundRate = policy.refundRate
        reason = `출석률 ${attendanceRate}% (${policy.label})`
        break
      }
    } else if (refundPolicyType === 'ATTENDANCE_AND_REPORT') {
      const minReport = policy.minReport ?? 0
      if (attendanceRate >= policy.minAttendance && reportRate >= minReport) {
        matchedPolicy = policy
        refundRate = policy.refundRate
        reason = `출석 ${attendanceRate}%, 독후감 ${reportRate}% (${policy.label})`
        break
      }
    }
  }

  const refundAmount = Math.round(depositAmount * (refundRate / 100))

  return {
    attendanceRate,
    reportRate,
    refundRate,
    refundAmount,
    reason,
    eligible: refundAmount > 0,
    ineligibleReason:
      refundAmount === 0
        ? `출석률(${attendanceRate}%) 또는 독후감 제출률(${reportRate}%)이 기준에 미달합니다.`
        : undefined,
    matchedPolicy,
  }
}

/**
 * 회차별 보증금 계산 (독서모임용)
 */
export function calculatePerSessionRefund(input: {
  depositPerSession: number
  sessions: Array<{
    attended: boolean
    reportSubmitted: boolean
    reportApproved?: boolean
  }>
  requireReport: boolean
  surveySubmitted: boolean
  surveyRequired: boolean
}): {
  totalRefund: number
  sessionResults: Array<{
    refundable: boolean
    amount: number
    reason: string
  }>
} {
  const { depositPerSession, sessions, requireReport, surveySubmitted, surveyRequired } = input

  // 만족도 조사 필수인데 미제출
  if (surveyRequired && !surveySubmitted) {
    return {
      totalRefund: 0,
      sessionResults: sessions.map(() => ({
        refundable: false,
        amount: 0,
        reason: '만족도 조사 미제출',
      })),
    }
  }

  const sessionResults = sessions.map((session, index) => {
    if (!session.attended) {
      return {
        refundable: false,
        amount: 0,
        reason: `${index + 1}회차 불참`,
      }
    }

    if (requireReport) {
      if (!session.reportSubmitted) {
        return {
          refundable: false,
          amount: 0,
          reason: `${index + 1}회차 독후감 미제출`,
        }
      }
      if (session.reportApproved === false) {
        return {
          refundable: false,
          amount: 0,
          reason: `${index + 1}회차 독후감 미승인`,
        }
      }
    }

    return {
      refundable: true,
      amount: depositPerSession,
      reason: `${index + 1}회차 조건 충족`,
    }
  })

  const totalRefund = sessionResults.reduce((sum, r) => sum + r.amount, 0)

  return {
    totalRefund,
    sessionResults,
  }
}

/**
 * 반환 금액 포맷팅
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * 반환률에 따른 상태 라벨
 */
export function getRefundStatusLabel(refundRate: number): {
  label: string
  color: string
} {
  if (refundRate === 100) {
    return { label: '전액 반환', color: 'green' }
  } else if (refundRate >= 80) {
    return { label: '대부분 반환', color: 'blue' }
  } else if (refundRate >= 60) {
    return { label: '일부 반환', color: 'yellow' }
  } else if (refundRate > 0) {
    return { label: '최소 반환', color: 'orange' }
  } else {
    return { label: '미반환', color: 'red' }
  }
}
