import {
  calculateRefund,
  calculatePerSessionRefund,
  formatCurrency,
  getRefundStatusLabel,
  DEFAULT_REFUND_POLICIES,
  type DepositCalculationInput,
} from '@/lib/utils/deposit-calculator'

describe('calculateRefund', () => {
  const baseInput: DepositCalculationInput = {
    depositAmount: 100000,
    refundPolicyType: 'ATTENDANCE_ONLY',
    refundPolicy: DEFAULT_REFUND_POLICIES.ATTENDANCE_ONLY,
    totalSessions: 10,
    attendedSessions: 10,
    submittedReports: 0,
    surveySubmitted: true,
    surveyRequired: true,
  }

  it('returns 0 when survey required but not submitted', () => {
    const result = calculateRefund({ ...baseInput, surveySubmitted: false })
    expect(result.eligible).toBe(false)
    expect(result.refundAmount).toBe(0)
    expect(result.reason).toContain('만족도 조사')
  })

  describe('ONE_TIME policy', () => {
    const oneTimeInput: DepositCalculationInput = {
      ...baseInput,
      refundPolicyType: 'ONE_TIME',
      refundPolicy: DEFAULT_REFUND_POLICIES.ONE_TIME,
    }

    it('returns full refund when attended', () => {
      const result = calculateRefund({ ...oneTimeInput, attended: true })
      expect(result.eligible).toBe(true)
      expect(result.refundAmount).toBe(100000)
      expect(result.refundRate).toBe(100)
    })

    it('returns 0 when not attended', () => {
      const result = calculateRefund({ ...oneTimeInput, attended: false })
      expect(result.eligible).toBe(false)
      expect(result.refundAmount).toBe(0)
    })
  })

  describe('ATTENDANCE_ONLY policy', () => {
    it('returns 100% for perfect attendance', () => {
      const result = calculateRefund(baseInput)
      expect(result.refundRate).toBe(100)
      expect(result.refundAmount).toBe(100000)
    })

    it('returns 80% for 80% attendance', () => {
      const result = calculateRefund({ ...baseInput, attendedSessions: 8 })
      expect(result.refundRate).toBe(80)
      expect(result.refundAmount).toBe(80000)
    })

    it('returns 60% for 60% attendance', () => {
      const result = calculateRefund({ ...baseInput, attendedSessions: 6 })
      expect(result.refundRate).toBe(60)
      expect(result.refundAmount).toBe(60000)
    })

    it('returns 0% for below 60% attendance', () => {
      const result = calculateRefund({ ...baseInput, attendedSessions: 5 })
      expect(result.refundRate).toBe(0)
      expect(result.refundAmount).toBe(0)
      expect(result.eligible).toBe(false)
    })
  })

  describe('ATTENDANCE_AND_REPORT policy', () => {
    const reportInput: DepositCalculationInput = {
      ...baseInput,
      refundPolicyType: 'ATTENDANCE_AND_REPORT',
      refundPolicy: DEFAULT_REFUND_POLICIES.ATTENDANCE_AND_REPORT,
    }

    it('returns 100% for perfect attendance and reports', () => {
      const result = calculateRefund({
        ...reportInput,
        attendedSessions: 10,
        submittedReports: 10,
      })
      expect(result.refundRate).toBe(100)
    })

    it('uses approvedReports over submittedReports when available', () => {
      const result = calculateRefund({
        ...reportInput,
        attendedSessions: 10,
        submittedReports: 10,
        approvedReports: 6,
      })
      // approved 6/10 = 60%, attendance 100% -> 출석 100%, 독후감 60% -> probably 80% from sorted policies
      expect(result.refundRate).toBeLessThan(100)
    })

    it('returns 0% when both attendance and reports are below threshold', () => {
      const result = calculateRefund({
        ...reportInput,
        attendedSessions: 3,
        submittedReports: 3,
      })
      expect(result.refundRate).toBe(0)
      expect(result.eligible).toBe(false)
    })
  })

  it('returns 0 rate when totalSessions is 0', () => {
    const result = calculateRefund({ ...baseInput, totalSessions: 0, attendedSessions: 0 })
    expect(result.attendanceRate).toBe(0)
  })
})

describe('calculatePerSessionRefund', () => {
  it('returns full refund for all sessions attended', () => {
    const result = calculatePerSessionRefund({
      depositPerSession: 10000,
      sessions: [
        { attended: true, reportSubmitted: true },
        { attended: true, reportSubmitted: true },
      ],
      requireReport: false,
      surveySubmitted: true,
      surveyRequired: true,
    })
    expect(result.totalRefund).toBe(20000)
    expect(result.sessionResults).toHaveLength(2)
    expect(result.sessionResults[0].refundable).toBe(true)
  })

  it('returns 0 for unattended sessions', () => {
    const result = calculatePerSessionRefund({
      depositPerSession: 10000,
      sessions: [
        { attended: false, reportSubmitted: false },
        { attended: true, reportSubmitted: false },
      ],
      requireReport: false,
      surveySubmitted: true,
      surveyRequired: false,
    })
    expect(result.totalRefund).toBe(10000)
    expect(result.sessionResults[0].refundable).toBe(false)
    expect(result.sessionResults[0].reason).toContain('불참')
  })

  it('returns 0 when report required but not submitted', () => {
    const result = calculatePerSessionRefund({
      depositPerSession: 10000,
      sessions: [{ attended: true, reportSubmitted: false }],
      requireReport: true,
      surveySubmitted: true,
      surveyRequired: false,
    })
    expect(result.totalRefund).toBe(0)
    expect(result.sessionResults[0].reason).toContain('독후감 미제출')
  })

  it('returns 0 when report not approved', () => {
    const result = calculatePerSessionRefund({
      depositPerSession: 10000,
      sessions: [{ attended: true, reportSubmitted: true, reportApproved: false }],
      requireReport: true,
      surveySubmitted: true,
      surveyRequired: false,
    })
    expect(result.totalRefund).toBe(0)
    expect(result.sessionResults[0].reason).toContain('미승인')
  })

  it('returns 0 for all sessions when survey required but missing', () => {
    const result = calculatePerSessionRefund({
      depositPerSession: 10000,
      sessions: [
        { attended: true, reportSubmitted: true },
        { attended: true, reportSubmitted: true },
      ],
      requireReport: false,
      surveySubmitted: false,
      surveyRequired: true,
    })
    expect(result.totalRefund).toBe(0)
    expect(result.sessionResults.every((r) => !r.refundable)).toBe(true)
  })
})

describe('formatCurrency', () => {
  it('formats Korean Won correctly', () => {
    const formatted = formatCurrency(100000)
    expect(formatted).toContain('100,000')
  })

  it('formats 0 correctly', () => {
    const formatted = formatCurrency(0)
    expect(formatted).toContain('0')
  })
})

describe('getRefundStatusLabel', () => {
  it('returns 전액 반환 for 100%', () => {
    const result = getRefundStatusLabel(100)
    expect(result.label).toBe('전액 반환')
    expect(result.color).toBe('green')
  })

  it('returns 대부분 반환 for 80-99%', () => {
    expect(getRefundStatusLabel(80).label).toBe('대부분 반환')
    expect(getRefundStatusLabel(80).color).toBe('blue')
  })

  it('returns 일부 반환 for 60-79%', () => {
    expect(getRefundStatusLabel(60).label).toBe('일부 반환')
    expect(getRefundStatusLabel(60).color).toBe('yellow')
  })

  it('returns 최소 반환 for 1-59%', () => {
    expect(getRefundStatusLabel(50).label).toBe('최소 반환')
    expect(getRefundStatusLabel(50).color).toBe('orange')
  })

  it('returns 미반환 for 0%', () => {
    expect(getRefundStatusLabel(0).label).toBe('미반환')
    expect(getRefundStatusLabel(0).color).toBe('red')
  })
})
