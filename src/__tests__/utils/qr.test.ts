import {
  generateQRToken,
  parseQRToken,
  validateQRToken,
  getRemainingTime,
  generateAttendanceURL,
  formatExpiryTime,
  shouldRefreshToken,
} from '@/lib/utils/qr'

describe('generateQRToken', () => {
  it('generates a base64url-encoded token', () => {
    const token = generateQRToken('session-123')
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
  })

  it('generates different tokens for different sessions', () => {
    const token1 = generateQRToken('session-1', 1000)
    const token2 = generateQRToken('session-2', 1000)
    expect(token1).not.toBe(token2)
  })

  it('generates different tokens for different timestamps', () => {
    const token1 = generateQRToken('session-1', 1000)
    const token2 = generateQRToken('session-1', 2000)
    expect(token1).not.toBe(token2)
  })
})

describe('parseQRToken', () => {
  it('correctly parses a valid token', () => {
    const token = generateQRToken('session-abc', 1706900000000)
    const parsed = parseQRToken(token)
    expect(parsed).not.toBeNull()
    expect(parsed!.sessionId).toBe('session-abc')
    expect(parsed!.timestamp).toBe(1706900000000)
    expect(parsed!.hash).toBeTruthy()
  })

  it('returns null for invalid token', () => {
    expect(parseQRToken('invalid-token')).toBeNull()
    expect(parseQRToken('')).toBeNull()
  })

  it('returns null for malformed base64', () => {
    // Token with wrong number of parts
    const badToken = Buffer.from('only-two:parts').toString('base64url')
    expect(parseQRToken(badToken)).toBeNull()
  })
})

describe('validateQRToken', () => {
  it('validates a fresh token as valid', () => {
    const token = generateQRToken('session-test', Date.now())
    const result = validateQRToken(token)
    expect(result.isValid).toBe(true)
    expect(result.sessionId).toBe('session-test')
  })

  it('rejects an expired token', () => {
    const oldTimestamp = Date.now() - 20 * 60 * 1000 // 20 min ago
    const token = generateQRToken('session-test', oldTimestamp)
    const result = validateQRToken(token)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('만료')
  })

  it('rejects a tampered token', () => {
    const token = generateQRToken('session-test', Date.now())
    // Tamper by replacing characters
    const tampered = token.slice(0, -3) + 'xxx'
    const result = validateQRToken(tampered)
    expect(result.isValid).toBe(false)
  })

  it('rejects an invalid format', () => {
    const result = validateQRToken('not-a-real-token')
    expect(result.isValid).toBe(false)
    expect(result.sessionId).toBeNull()
  })
})

describe('getRemainingTime', () => {
  it('returns positive seconds for fresh token', () => {
    const token = generateQRToken('session-1', Date.now())
    expect(getRemainingTime(token)).toBeGreaterThan(0)
  })

  it('returns 0 for expired token', () => {
    const oldTs = Date.now() - 20 * 60 * 1000
    const token = generateQRToken('session-1', oldTs)
    expect(getRemainingTime(token)).toBe(0)
  })

  it('returns 0 for invalid token', () => {
    expect(getRemainingTime('invalid')).toBe(0)
  })
})

describe('generateAttendanceURL', () => {
  it('generates correct URL with encoded token', () => {
    const url = generateAttendanceURL('my-token', 'https://example.com')
    expect(url).toBe('https://example.com/attendance/check?token=my-token')
  })

  it('encodes special characters in token', () => {
    const url = generateAttendanceURL('token with spaces', 'https://example.com')
    expect(url).toContain('token%20with%20spaces')
  })
})

describe('formatExpiryTime', () => {
  it('returns formatted time for valid token', () => {
    const token = generateQRToken('session-1', Date.now())
    const formatted = formatExpiryTime(token)
    expect(formatted).toMatch(/\d+:\d{2}/)
  })

  it('returns 만료됨 for expired token', () => {
    const oldTs = Date.now() - 20 * 60 * 1000
    const token = generateQRToken('session-1', oldTs)
    expect(formatExpiryTime(token)).toBe('만료됨')
  })
})

describe('shouldRefreshToken', () => {
  it('returns false for fresh token', () => {
    const token = generateQRToken('session-1', Date.now())
    expect(shouldRefreshToken(token, 60)).toBe(false)
  })

  it('returns true when near expiry', () => {
    // Token created 14 min ago (expires in ~1 min)
    const ts = Date.now() - 14 * 60 * 1000
    const token = generateQRToken('session-1', ts)
    expect(shouldRefreshToken(token, 120)).toBe(true)
  })
})
