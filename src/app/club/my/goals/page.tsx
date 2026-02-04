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
        <h1 className="text-2xl font-bold text-zinc-900">나의 독서 목표</h1>
        <Link
          href="/club/my/goals/set"
          className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-sm"
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
        <div className="bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm p-6 text-center">
          <p className="text-zinc-500 mb-4">연간 목표가 설정되지 않았습니다.</p>
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
        <div className="bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm p-6 text-center">
          <p className="text-zinc-500 mb-4">월간 목표가 설정되지 않았습니다.</p>
          <Link href="/club/my/goals/set" className="text-blue-600 hover:underline text-sm">
            목표 설정하기
          </Link>
        </div>
      )}

      {badges.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">획득 배지</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((ub) => (
              <GoalBadge key={ub.id} badge={ub.badge} earnedAt={ub.earnedAt.toISOString()} />
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link href="/club/my/goals/history" className="text-sm text-zinc-500 hover:text-zinc-700">
          과거 목표 기록 보기
        </Link>
      </div>
    </div>
  )
}
