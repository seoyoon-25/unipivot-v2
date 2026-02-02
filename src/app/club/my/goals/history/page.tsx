import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Target } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getGoalHistory } from '@/lib/club/goal-queries'

export const metadata = { title: '목표 기록 | 유니클럽' }

export default async function GoalHistoryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const goals = await getGoalHistory(user.id)

  // Group by year
  const grouped = goals.reduce<Record<number, typeof goals>>((acc, goal) => {
    if (!acc[goal.year]) acc[goal.year] = []
    acc[goal.year].push(goal)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/club/my/goals"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        목표 현황으로
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">과거 목표 기록</h1>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          아직 목표 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, yearGoals]) => (
              <div key={year}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{year}년</h2>
                <div className="space-y-3">
                  {yearGoals.map((goal) => {
                    const pct = goal.targetBooks > 0
                      ? Math.min(Math.round((goal.achievedBooks / goal.targetBooks) * 100), 100)
                      : 0

                    return (
                      <div
                        key={goal.id}
                        className={`rounded-lg border p-4 ${
                          goal.isCompleted
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {goal.month ? (
                              <Target className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className="font-medium text-gray-900">
                              {goal.month ? `${goal.month}월` : '연간'} 목표
                            </span>
                          </div>
                          {goal.isCompleted && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              달성
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {goal.targetBooks}권 중 {goal.achievedBooks}권 ({pct}%)
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              goal.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
