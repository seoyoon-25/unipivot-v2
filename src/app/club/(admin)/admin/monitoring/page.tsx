import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import { collectMetrics } from '@/lib/metrics'
import MonitoringDashboard from '@/components/club/admin/monitoring/MonitoringDashboard'

export const metadata = { title: '시스템 모니터링 | 유니클럽 관리자' }
export const dynamic = 'force-dynamic'

async function getHealthData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' })
    if (res.ok) return res.json()
    return null
  } catch {
    return null
  }
}

export default async function MonitoringPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=' + encodeURIComponent('/club/admin/monitoring'))
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect('/club')

  const [health, metrics] = await Promise.all([
    getHealthData(),
    collectMetrics().catch(() => null),
  ])

  return <MonitoringDashboard initialHealth={health} initialMetrics={metrics} />
}
