import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import {
  getStatsOverview,
  getMonthlyAttendance,
  getMonthlyReading,
  getGenreDistribution,
} from '@/lib/club/stats-queries'
import StatsOverview from '@/components/club/stats/StatsOverview'
import AttendanceChart from '@/components/club/stats/AttendanceChart'
import ReadingChart from '@/components/club/stats/ReadingChart'
import GenreChart from '@/components/club/stats/GenreChart'
import StatsPeriodFilter from '@/components/club/stats/StatsPeriodFilter'

export const metadata = { title: '나의 통계 | 유니클럽' }

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function MyStatsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/my/stats'))
  }

  const { period: rawPeriod } = await searchParams
  const period = (['3m', '6m', '1y', 'all'].includes(rawPeriod || '')
    ? rawPeriod
    : '6m') as '3m' | '6m' | '1y' | 'all'

  const [overview, monthlyAttendance, monthlyReading, genreData] = await Promise.all([
    getStatsOverview(user.id, period),
    getMonthlyAttendance(user.id, period),
    getMonthlyReading(user.id, period),
    getGenreDistribution(user.id, period),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">나의 통계</h1>
        <StatsPeriodFilter currentPeriod={period} />
      </div>

      <StatsOverview data={overview} />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">월별 출석 현황</h2>
        <AttendanceChart data={monthlyAttendance} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">독서량 추이</h2>
        <ReadingChart data={monthlyReading} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">장르별 독서 분포</h2>
        <GenreChart data={genreData} />
      </div>
    </div>
  )
}
