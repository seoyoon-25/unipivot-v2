import {
  determineAttendanceStatus,
  calculateLateMinutes,
  getAttendanceLabel,
  getAttendanceColor,
  canCheckIn,
  calculateAttendanceStats,
  getCheckInMessage,
  getRemainingCheckInTime,
} from '@/lib/utils/attendance'

describe('determineAttendanceStatus', () => {
  const sessionStart = new Date('2026-02-03T14:00:00')

  it('returns PRESENT when check-in is on time (within 10 min)', () => {
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T14:00:00'))).toBe('PRESENT')
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T14:05:00'))).toBe('PRESENT')
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T14:10:00'))).toBe('PRESENT')
  })

  it('returns PRESENT when check-in is early', () => {
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T13:50:00'))).toBe('PRESENT')
  })

  it('returns LATE when check-in is 11-15 min after start', () => {
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T14:11:00'))).toBe('LATE')
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T14:15:00'))).toBe('LATE')
  })

  it('returns ABSENT when check-in is more than 15 min late', () => {
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T14:16:00'))).toBe('ABSENT')
    expect(determineAttendanceStatus(sessionStart, new Date('2026-02-03T15:00:00'))).toBe('ABSENT')
  })
})

describe('calculateLateMinutes', () => {
  it('returns positive minutes when late', () => {
    const start = new Date('2026-02-03T14:00:00')
    const checkIn = new Date('2026-02-03T14:12:00')
    expect(calculateLateMinutes(start, checkIn)).toBe(12)
  })

  it('returns negative minutes when early', () => {
    const start = new Date('2026-02-03T14:00:00')
    const checkIn = new Date('2026-02-03T13:55:00')
    expect(calculateLateMinutes(start, checkIn)).toBe(-5)
  })

  it('returns 0 when exactly on time', () => {
    const start = new Date('2026-02-03T14:00:00')
    expect(calculateLateMinutes(start, start)).toBe(0)
  })
})

describe('getAttendanceLabel', () => {
  it('returns correct labels for each status', () => {
    expect(getAttendanceLabel('PRESENT')).toBe('출석')
    expect(getAttendanceLabel('LATE')).toBe('지각')
    expect(getAttendanceLabel('ABSENT')).toBe('결석')
    expect(getAttendanceLabel('EXCUSED')).toBe('공결')
  })
})

describe('getAttendanceColor', () => {
  it('returns correct color classes for each status', () => {
    expect(getAttendanceColor('PRESENT')).toContain('green')
    expect(getAttendanceColor('LATE')).toContain('yellow')
    expect(getAttendanceColor('ABSENT')).toContain('red')
    expect(getAttendanceColor('EXCUSED')).toContain('blue')
  })
})

describe('canCheckIn', () => {
  const sessionStart = new Date('2026-02-03T14:00:00')

  it('allows check-in 30 min before session start', () => {
    const current = new Date('2026-02-03T13:30:00')
    expect(canCheckIn(sessionStart, null, current)).toBe(true)
  })

  it('disallows check-in more than 30 min before start', () => {
    const current = new Date('2026-02-03T13:29:00')
    expect(canCheckIn(sessionStart, null, current)).toBe(false)
  })

  it('allows check-in during session (before end)', () => {
    const end = new Date('2026-02-03T16:00:00')
    const current = new Date('2026-02-03T15:00:00')
    expect(canCheckIn(sessionStart, end, current)).toBe(true)
  })

  it('disallows check-in after session end', () => {
    const end = new Date('2026-02-03T16:00:00')
    const current = new Date('2026-02-03T16:01:00')
    expect(canCheckIn(sessionStart, end, current)).toBe(false)
  })

  it('defaults to 2 hours after start when no end time', () => {
    const current = new Date('2026-02-03T16:00:00')
    expect(canCheckIn(sessionStart, null, current)).toBe(true)

    const tooLate = new Date('2026-02-03T16:01:00')
    expect(canCheckIn(sessionStart, null, tooLate)).toBe(false)
  })
})

describe('calculateAttendanceStats', () => {
  it('calculates correct stats for mixed attendance', () => {
    const attendances = [
      { status: 'PRESENT' as const },
      { status: 'PRESENT' as const },
      { status: 'LATE' as const },
      { status: 'ABSENT' as const },
      { status: 'EXCUSED' as const },
    ]

    const stats = calculateAttendanceStats(attendances)
    expect(stats.present).toBe(2)
    expect(stats.late).toBe(1)
    expect(stats.absent).toBe(1)
    expect(stats.excused).toBe(1)
    expect(stats.total).toBe(5)
    expect(stats.attendanceRate).toBe(80) // (2+1+1)/5 = 80%
  })

  it('returns 0% for empty array', () => {
    const stats = calculateAttendanceStats([])
    expect(stats.total).toBe(0)
    expect(stats.attendanceRate).toBe(0)
  })

  it('returns 100% for all present', () => {
    const attendances = [
      { status: 'PRESENT' as const },
      { status: 'PRESENT' as const },
    ]
    expect(calculateAttendanceStats(attendances).attendanceRate).toBe(100)
  })
})

describe('getCheckInMessage', () => {
  it('returns success message for PRESENT', () => {
    expect(getCheckInMessage('PRESENT')).toContain('출석이 완료')
  })

  it('returns late message with minutes', () => {
    expect(getCheckInMessage('LATE', 12)).toContain('12분 지각')
  })

  it('returns absent message for ABSENT', () => {
    expect(getCheckInMessage('ABSENT')).toContain('결석')
  })
})

describe('getRemainingCheckInTime', () => {
  it('returns remaining seconds before session end', () => {
    const start = new Date('2026-02-03T14:00:00')
    const end = new Date('2026-02-03T16:00:00')
    const now = new Date('2026-02-03T15:00:00')
    expect(getRemainingCheckInTime(start, end, now)).toBe(3600) // 1 hour
  })

  it('returns 0 when past session end', () => {
    const start = new Date('2026-02-03T14:00:00')
    const end = new Date('2026-02-03T16:00:00')
    const now = new Date('2026-02-03T17:00:00')
    expect(getRemainingCheckInTime(start, end, now)).toBe(0)
  })
})
