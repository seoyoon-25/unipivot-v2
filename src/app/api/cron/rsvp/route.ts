import { NextRequest, NextResponse } from 'next/server'
import { autoSendRSVPRequests, autoSendRSVPReminders } from '@/lib/actions/rsvp'

// Cron 시크릿 검증
function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('CRON_SECRET is not set')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

/**
 * POST /api/cron/rsvp
 *
 * RSVP 자동 발송 및 리마인더 처리
 *
 * Body options:
 * - action: 'send' | 'remind' | 'all' (default: 'all')
 * - daysBeforeSession: number (default: 3) - RSVP 발송 기준 일수
 * - hoursBeforeDeadline: number (default: 24) - 리마인더 발송 기준 시간
 */
export async function POST(request: NextRequest) {
  // 인증 확인
  if (!validateCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const {
      action = 'all',
      daysBeforeSession = 3,
      hoursBeforeDeadline = 24,
    } = body

    const results: Record<string, any> = {}

    // RSVP 자동 발송
    if (action === 'send' || action === 'all') {
      const sendResult = await autoSendRSVPRequests(daysBeforeSession)
      results.send = sendResult
    }

    // 리마인더 발송
    if (action === 'remind' || action === 'all') {
      const reminderResult = await autoSendRSVPReminders(hoursBeforeDeadline)
      results.remind = reminderResult
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      action,
      results,
    })
  } catch (error) {
    console.error('RSVP Cron Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/rsvp
 *
 * Cron 상태 확인용 (헬스체크)
 */
export async function GET(request: NextRequest) {
  // 인증 확인
  if (!validateCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    status: 'ok',
    service: 'RSVP Cron',
    timestamp: new Date().toISOString(),
    endpoints: {
      send: 'POST with action=send - 자동 RSVP 발송',
      remind: 'POST with action=remind - 리마인더 발송',
      all: 'POST with action=all - 모든 작업 실행',
    },
  })
}
