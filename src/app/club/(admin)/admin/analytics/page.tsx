import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Users, FileText, Activity } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getOverviewStats, getDailyGrowth } from '@/lib/club/analytics-queries'
import type { Period } from '@/lib/club/analytics-queries'
import OverviewCards from '@/components/club/admin/analytics/OverviewCards'
import PeriodFilter from '@/components/club/admin/analytics/PeriodFilter'

const GrowthChart = dynamic(
  () => import('@/components/club/admin/analytics/GrowthChart'),
  { ssr: false, loading: () => <div className="h-80 bg-gray-50 rounded-lg animate-pulse" /> }
)

export const metadata = { title: '분석 대시보드 | 유니클럽 관리자' }

interface Props {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalyticsDashboardPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=' + encodeURIComponent('/club/admin/analytics'))
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect('/club')

  const params = await searchParams
  const period = (['7d', '30d', '90d', '1y'].includes(params.period || '')
    ? params.period
    : '30d') as Period

  const [overview, dailyGrowth] = await Promise.all([
    getOverviewStats(period),
    getDailyGrowth(period),
  ])

  const subPages = [
    { href: '/club/admin/analytics/users', icon: Users, title: '사용자 분석', desc: '사용자 성장 및 리텐션' },
    { href: '/club/admin/analytics/content', icon: FileText, title: '콘텐츠 분석', desc: '독후감, 명문장 통계' },
    { href: '/club/admin/analytics/engagement', icon: Activity, title: '참여도 분석', desc: '출석률, 프로그램 현황' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">분석 대시보드</h1>
        <PeriodFilter currentPeriod={period} />
      </div>

      <OverviewCards data={overview} />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">성장 추이</h2>
        <GrowthChart data={dailyGrowth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subPages.map((page) => {
          const Icon = page.icon
          return (
            <Link
              key={page.href}
              href={page.href}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-colors"
            >
              <Icon className="w-5 h-5 text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-900">{page.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{page.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
