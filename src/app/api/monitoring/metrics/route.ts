import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/check-role'
import { collectMetrics } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
  }

  try {
    const metrics = await collectMetrics()
    return NextResponse.json(metrics)
  } catch {
    return NextResponse.json({ error: '메트릭 수집 실패' }, { status: 500 })
  }
}
