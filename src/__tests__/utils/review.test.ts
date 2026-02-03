import {
  getReviewDeadline,
  isReviewDeadlinePassed,
  getTimeUntilDeadline,
  getDeadlineUrgency,
  getUrgencyColorClass,
  validateReview,
  calculateReviewStats,
  calculateReviewPoints,
  formatCharCount,
  REVIEW_POINTS,
} from '@/lib/utils/review'

describe('getReviewDeadline', () => {
  it('returns the day before session at 23:59:59', () => {
    const sessionDate = new Date('2026-02-10T14:00:00')
    const deadline = getReviewDeadline(sessionDate)
    expect(deadline.getDate()).toBe(9)
    expect(deadline.getHours()).toBe(23)
    expect(deadline.getMinutes()).toBe(59)
    expect(deadline.getSeconds()).toBe(59)
  })
})

describe('isReviewDeadlinePassed', () => {
  const sessionDate = new Date('2026-02-10T14:00:00')

  it('returns false when before deadline', () => {
    const current = new Date('2026-02-09T20:00:00')
    expect(isReviewDeadlinePassed(sessionDate, current)).toBe(false)
  })

  it('returns true when after deadline', () => {
    const current = new Date('2026-02-10T00:00:01')
    expect(isReviewDeadlinePassed(sessionDate, current)).toBe(true)
  })
})

describe('getTimeUntilDeadline', () => {
  it('returns positive value before deadline', () => {
    const session = new Date('2026-02-10T14:00:00')
    const now = new Date('2026-02-08T14:00:00')
    expect(getTimeUntilDeadline(session, now)).toBeGreaterThan(0)
  })

  it('returns negative value after deadline', () => {
    const session = new Date('2026-02-10T14:00:00')
    const now = new Date('2026-02-11T14:00:00')
    expect(getTimeUntilDeadline(session, now)).toBeLessThan(0)
  })
})

describe('getDeadlineUrgency', () => {
  it('returns expired when past deadline', () => {
    const pastSession = new Date(Date.now() - 48 * 60 * 60 * 1000)
    expect(getDeadlineUrgency(pastSession)).toBe('expired')
  })

  it('returns safe when more than 24 hours remain', () => {
    // Session 3 days from now → deadline 2 days from now
    const futureSession = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    expect(getDeadlineUrgency(futureSession)).toBe('safe')
  })
})

describe('getUrgencyColorClass', () => {
  it('returns green for safe', () => {
    expect(getUrgencyColorClass('safe')).toContain('green')
  })

  it('returns yellow for warning', () => {
    expect(getUrgencyColorClass('warning')).toContain('yellow')
  })

  it('returns red for urgent', () => {
    expect(getUrgencyColorClass('urgent')).toContain('red')
  })

  it('returns gray for expired', () => {
    expect(getUrgencyColorClass('expired')).toContain('gray')
  })
})

describe('validateReview', () => {
  it('passes for valid title and content', () => {
    const result = validateReview('좋은 책', 'a'.repeat(100))
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('fails for empty title', () => {
    const result = validateReview('', 'a'.repeat(100))
    expect(result.isValid).toBe(false)
    expect(result.errors.title).toBeDefined()
  })

  it('fails for empty content', () => {
    const result = validateReview('제목', '')
    expect(result.isValid).toBe(false)
    expect(result.errors.content).toBeDefined()
  })

  it('fails for too short content', () => {
    const result = validateReview('제목', 'short')
    expect(result.isValid).toBe(false)
    expect(result.errors.content).toContain('100자')
  })

  it('fails for title exceeding max length', () => {
    const result = validateReview('a'.repeat(101), 'a'.repeat(100))
    expect(result.isValid).toBe(false)
    expect(result.errors.title).toContain('100자')
  })

  it('fails for content exceeding max length', () => {
    const result = validateReview('제목', 'a'.repeat(10001))
    expect(result.isValid).toBe(false)
    expect(result.errors.content).toContain('10000자')
  })
})

describe('calculateReviewStats', () => {
  it('calculates correct stats', () => {
    const reviews = [
      { submittedAt: new Date('2026-02-08T20:00:00'), sessionDate: new Date('2026-02-10T14:00:00') }, // on time
      { submittedAt: new Date('2026-02-10T10:00:00'), sessionDate: new Date('2026-02-10T14:00:00') }, // late
    ]

    const stats = calculateReviewStats(reviews, 5)
    expect(stats.submitted).toBe(2)
    expect(stats.total).toBe(5)
    expect(stats.rate).toBe(40)
    expect(stats.onTime).toBe(1)
    expect(stats.late).toBe(1)
  })

  it('returns 0 rate for 0 total sessions', () => {
    const stats = calculateReviewStats([], 0)
    expect(stats.rate).toBe(0)
  })
})

describe('calculateReviewPoints', () => {
  it('returns base points regardless of timing', () => {
    expect(calculateReviewPoints(true)).toBe(REVIEW_POINTS)
    expect(calculateReviewPoints(false)).toBe(REVIEW_POINTS)
  })
})

describe('formatCharCount', () => {
  it('formats correctly', () => {
    expect(formatCharCount(500, 10000)).toBe('500 / 10,000자')
  })
})
