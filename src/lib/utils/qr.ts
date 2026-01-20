import crypto from 'crypto'

/**
 * QR 토큰 생성 유틸리티
 */

const QR_TOKEN_EXPIRY_MINUTES = 15 // QR 토큰 유효 시간 (분)
const QR_SECRET = process.env.QR_SECRET || 'unipivot-qr-secret-key'

/**
 * QR 토큰 생성
 * @param sessionId 세션 ID
 * @param timestamp 생성 시간 (옵션)
 * @returns 생성된 QR 토큰
 */
export function generateQRToken(sessionId: string, timestamp?: number): string {
  const ts = timestamp || Date.now()
  const data = `${sessionId}:${ts}`
  const hash = crypto
    .createHmac('sha256', QR_SECRET)
    .update(data)
    .digest('hex')
    .substring(0, 12)

  // Format: sessionId:timestamp:hash
  return Buffer.from(`${data}:${hash}`).toString('base64url')
}

/**
 * QR 토큰 파싱
 * @param token QR 토큰
 * @returns 파싱된 데이터 또는 null
 */
export function parseQRToken(token: string): {
  sessionId: string
  timestamp: number
  hash: string
} | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')

    if (parts.length !== 3) {
      return null
    }

    const [sessionId, timestampStr, hash] = parts
    const timestamp = parseInt(timestampStr, 10)

    if (isNaN(timestamp)) {
      return null
    }

    return { sessionId, timestamp, hash }
  } catch {
    return null
  }
}

/**
 * QR 토큰 유효성 검증
 * @param token QR 토큰
 * @returns 유효성 검증 결과
 */
export function validateQRToken(token: string): {
  isValid: boolean
  sessionId: string | null
  error?: string
} {
  const parsed = parseQRToken(token)

  if (!parsed) {
    return {
      isValid: false,
      sessionId: null,
      error: '유효하지 않은 QR 코드입니다',
    }
  }

  const { sessionId, timestamp, hash } = parsed

  // Verify hash
  const expectedToken = generateQRToken(sessionId, timestamp)
  const expectedParsed = parseQRToken(expectedToken)

  if (!expectedParsed || expectedParsed.hash !== hash) {
    return {
      isValid: false,
      sessionId: null,
      error: '위조된 QR 코드입니다',
    }
  }

  // Check expiry
  const now = Date.now()
  const expiryMs = QR_TOKEN_EXPIRY_MINUTES * 60 * 1000

  if (now - timestamp > expiryMs) {
    return {
      isValid: false,
      sessionId,
      error: 'QR 코드가 만료되었습니다. 새로운 QR 코드를 요청하세요.',
    }
  }

  return {
    isValid: true,
    sessionId,
  }
}

/**
 * QR 토큰 남은 유효 시간 계산
 * @param token QR 토큰
 * @returns 남은 시간 (초) 또는 0
 */
export function getRemainingTime(token: string): number {
  const parsed = parseQRToken(token)

  if (!parsed) {
    return 0
  }

  const expiryMs = QR_TOKEN_EXPIRY_MINUTES * 60 * 1000
  const expiryTime = parsed.timestamp + expiryMs
  const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))

  return remaining
}

/**
 * QR 코드 URL 생성 (출석 체크 페이지)
 * @param token QR 토큰
 * @param baseUrl 기본 URL
 * @returns 출석 체크 URL
 */
export function generateAttendanceURL(token: string, baseUrl: string): string {
  return `${baseUrl}/attendance/check?token=${encodeURIComponent(token)}`
}

/**
 * QR 토큰 만료 시간 포맷
 * @param token QR 토큰
 * @returns 포맷된 만료 시간 문자열
 */
export function formatExpiryTime(token: string): string {
  const remaining = getRemainingTime(token)

  if (remaining <= 0) {
    return '만료됨'
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * QR 토큰 갱신 필요 여부 확인
 * @param token QR 토큰
 * @param thresholdSeconds 갱신 임계값 (초)
 * @returns 갱신 필요 여부
 */
export function shouldRefreshToken(token: string, thresholdSeconds = 60): boolean {
  const remaining = getRemainingTime(token)
  return remaining > 0 && remaining <= thresholdSeconds
}
