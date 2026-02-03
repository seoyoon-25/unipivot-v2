import { NextRequest } from 'next/server'

/**
 * Verify cron request authenticity.
 * Requires CRON_SECRET env var to be set.
 * In Vercel environments, also accepts x-vercel-cron header
 * (only when VERCEL env is confirmed).
 */
export function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Bearer token 검증 (CRON_SECRET 설정 시)
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // Vercel 환경에서만 x-vercel-cron 헤더 허용
  // 비-Vercel 환경(PM2 등)에서는 헤더 스푸핑 가능하므로 차단
  if (process.env.VERCEL === '1') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (isVercelCron) return true
  }

  // CRON_SECRET 미설정 + 비-Vercel 환경이면 거부
  return false
}
