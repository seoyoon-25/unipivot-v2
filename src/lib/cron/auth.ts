import { NextRequest } from 'next/server'

/**
 * Verify cron request authenticity.
 * Accepts either:
 * - Bearer token matching CRON_SECRET env var
 * - Vercel's built-in x-vercel-cron header
 */
export function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // Vercel Cron sends this header automatically
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'

  return isVercelCron
}
