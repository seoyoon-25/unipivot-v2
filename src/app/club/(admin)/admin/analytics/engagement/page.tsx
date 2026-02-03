import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getEngagementAnalytics } from '@/lib/club/analytics-queries'
import type { Period } from '@/lib/club/analytics-queries'
import PeriodFilter from '@/components/club/admin/analytics/PeriodFilter'

const RetentionChart = dynamic(
  () => import('@/components/club/admin/analytics/RetentionChart'),
  { ssr: false, loading: () => <div className="h-80 bg-gray-50 rounded-lg animate-pulse" /> }
)

export const metadata = { title: '참여도 분석 | 유니클럽 관리자' }

interface Props {
  searchParams: Promise<{ period?: string }>
}

export default async function EngagementAnalyticsPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user)
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/admin/analytics/engagement'))
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect('/club')

  const params = await searchParams
  const period = (['7d', '30d', '90d', '1y'].includes(params.period || '')
    ? params.period
    : '30d') as Period

  const data = await getEngagementAnalytics(period)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/club/admin/analytics"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">참여도 분석</h1>
        </div>
        <PeriodFilter currentPeriod={period} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <RetentionChart
          attendanceRate={data.attendanceRate}
          attendanceBreakdown={data.attendanceBreakdown}
          totalSessions={data.totalSessions}
          activePrograms={data.activePrograms}
        />
      </div>
    </div>
  )
}
