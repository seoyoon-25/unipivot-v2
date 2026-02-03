import { NextRequest, NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/cron/auth'
import { sendSlackAlert } from '@/lib/notifications/slack'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 주요 테이블 레코드 수 확인 (무결성 체크)
    const [userCount, memberCount, programCount, reportCount] = await Promise.all([
      prisma.user.count(),
      prisma.member.count(),
      prisma.program.count(),
      prisma.bookReport.count(),
    ])

    const summary = `Users: ${userCount}, Members: ${memberCount}, Programs: ${programCount}, Reports: ${reportCount}`

    await sendSlackAlert({
      title: 'Database Backup - Daily Check',
      text: `Daily integrity check completed.\n${summary}\nTimestamp: ${new Date().toISOString()}`,
      level: 'info',
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: { userCount, memberCount, programCount, reportCount },
    })
  } catch (error) {
    await sendSlackAlert({
      title: 'Database Backup Check Failed',
      text: `Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      level: 'error',
    })

    return NextResponse.json({ error: 'Backup check failed' }, { status: 500 })
  }
}
