import { NextRequest, NextResponse } from 'next/server'
import { checkAndTriggerSurveys } from '@/lib/utils/survey-automation'
import {
  sendSurveyReminders,
  closeExpiredSurveys,
  sendBookReportReminders,
} from '@/lib/utils/survey-reminder'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Verify cron request
 */
function verifyCronRequest(request: NextRequest): boolean {
  // In production, verify the cron secret
  if (process.env.NODE_ENV === 'production' && CRON_SECRET) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return false
    }
  }
  return true
}

/**
 * POST /api/cron/surveys
 *
 * Cron job endpoint for survey automation
 *
 * Actions:
 * - auto-create: Auto-create surveys for ended sessions/programs
 * - reminders: Send reminder notifications
 * - close-expired: Close expired surveys
 * - book-report-reminders: Send book report deadline reminders
 * - all: Run all actions
 */
export async function POST(request: NextRequest) {
  // Verify request
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const action = body.action || 'all'

    const results: Record<string, unknown> = {
      action,
      timestamp: new Date().toISOString(),
    }

    switch (action) {
      case 'auto-create':
        results.autoCreate = await checkAndTriggerSurveys()
        break

      case 'reminders':
        results.reminders = await sendSurveyReminders()
        break

      case 'close-expired':
        results.closeExpired = await closeExpiredSurveys()
        break

      case 'book-report-reminders':
        results.bookReportReminders = await sendBookReportReminders()
        break

      case 'all':
        results.autoCreate = await checkAndTriggerSurveys()
        results.reminders = await sendSurveyReminders()
        results.closeExpired = await closeExpiredSurveys()
        results.bookReportReminders = await sendBookReportReminders()
        break

      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            validActions: [
              'auto-create',
              'reminders',
              'close-expired',
              'book-report-reminders',
              'all',
            ],
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
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
 * GET /api/cron/surveys
 *
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: {
        actions: [
          'auto-create',
          'reminders',
          'close-expired',
          'book-report-reminders',
          'all',
        ],
      },
    },
  })
}
