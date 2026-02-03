import { NextRequest, NextResponse } from 'next/server'

/**
 * 인메모리 기반 Rate Limiter
 *
 * ⚠️ 한계:
 * - PM2 클러스터 모드: 각 워커가 독립된 Map을 가지므로 실제 제한이
 *   워커 수만큼 느슨해짐 (예: 4 워커 → 실질 240회/분)
 * - 서버리스(Vercel): 각 함수 인스턴스가 별도 메모리를 사용하므로
 *   rate limit이 사실상 적용되지 않음
 *
 * 프로덕션 개선 권장:
 * - Redis 기반: @upstash/ratelimit + @upstash/redis
 * - Vercel: Edge Middleware + KV Store
 * - Nginx: limit_req_zone (리버스 프록시 레벨)
 */

interface RateLimitConfig {
  interval: number // ms
  limit: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5분

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  const keysToDelete: string[] = []
  rateLimitMap.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => rateLimitMap.delete(key))
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.ip ||
    'unknown'
  )
}

export function rateLimit(config: RateLimitConfig) {
  return function check(request: NextRequest): NextResponse | null {
    cleanup()

    const ip = getClientIp(request)
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    const record = rateLimitMap.get(key)

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + config.interval })
      return null
    }

    if (record.count >= config.limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
          },
        }
      )
    }

    record.count++
    return null
  }
}

// API 기본 제한: 분당 60회
export const apiRateLimit = rateLimit({
  interval: 60 * 1000,
  limit: 60,
})

// 인증 제한: 15분당 10회
export const authRateLimit = rateLimit({
  interval: 15 * 60 * 1000,
  limit: 10,
})

// 검색 제한: 분당 30회
export const searchRateLimit = rateLimit({
  interval: 60 * 1000,
  limit: 30,
})
