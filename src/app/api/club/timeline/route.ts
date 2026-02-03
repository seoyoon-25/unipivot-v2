import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTimeline, type TimelineItemType } from '@/lib/club/timeline-queries'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'all') as TimelineItemType | 'all'
  const cursor = searchParams.get('cursor') || undefined
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20') || 20, 1), 100)

  const result = await getTimeline(session.user.id, { type, cursor, limit })

  return NextResponse.json(result)
}
