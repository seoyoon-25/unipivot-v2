import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getCurrentGoals, getUserGoalBadges } from '@/lib/club/goal-queries'
import GoalProgressCard from '@/components/club/goals/GoalProgressCard'
import GoalBadge from '@/components/club/goals/GoalBadge'

export const metadata = { title: '나의 독서 목표 | 유니클럽' }

export default async function GoalsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const [{ yearlyGoal, monthlyGoal }, badges] = await Promise.all([
    getCurrentGoals(user.id),
    getUserGoalBadges(user.id),
  ])

  const now = new Date()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">나의 독서 목표</h1>
        <Link
          href="/club/my/goals/set"
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          <Settings className="w-4 h-4" />
          설정
        </Link>
      </div>

      {yearlyGoal ? (
        <GoalProgressCard
          title={`${now.getFullYear()}년 목표`}
          target={yearlyGoal.targetBooks}
          achieved={yearlyGoal.achievedBooks}
          isCompleted={yearlyGoal.isCompleted}
          type="yearly"
        />
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-500 mb-4">연간 목표가 설정되지 않았습니다.</p>
          <Link href="/club/my/goals/set" className="text-blue-600 hover:underline text-sm">
            목표 설정하기
          </Link>
        </div>
      )}

      {monthlyGoal ? (
        <GoalProgressCard
          title={`${now.getMonth() + 1}월 목표`}
          target={monthlyGoal.targetBooks}
          achieved={monthlyGoal.achievedBooks}
          isCompleted={monthlyGoal.isCompleted}
          type="monthly"
        />
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-500 mb-4">월간 목표가 설정되지 않았습니다.</p>
          <Link href="/club/my/goals/set" className="text-blue-600 hover:underline text-sm">
            목표 설정하기
          </Link>
        </div>
      )}

      {badges.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">획득 배지</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((ub) => (
              <GoalBadge key={ub.id} badge={ub.badge} earnedAt={ub.earnedAt.toISOString()} />
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link href="/club/my/goals/history" className="text-sm text-gray-500 hover:text-gray-700">
          과거 목표 기록 보기
        </Link>
      </div>
    </div>
  )
}
