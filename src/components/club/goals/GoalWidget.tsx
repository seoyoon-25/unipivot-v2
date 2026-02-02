import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

interface Props {
  yearlyTarget: number | null
  yearlyAchieved: number
  monthlyTarget: number | null
  monthlyAchieved: number
}

export default function GoalWidget({
  yearlyTarget,
  yearlyAchieved,
  monthlyTarget,
  monthlyAchieved,
}: Props) {
  const hasGoal = yearlyTarget !== null || monthlyTarget !== null

  if (!hasGoal) {
    return (
      <Link
        href="/club/my/goals/set"
        className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">독서 목표를 설정해보세요</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </Link>
    )
  }

  const displayTarget = monthlyTarget ?? yearlyTarget ?? 0
  const displayAchieved = monthlyTarget ? monthlyAchieved : yearlyAchieved
  const pct = displayTarget > 0 ? Math.min(Math.round((displayAchieved / displayTarget) * 100), 100) : 0
  const label = monthlyTarget ? '이번 달' : '올해'

  return (
    <Link
      href="/club/my/goals"
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900 text-sm">{label} 독서 목표</span>
        </div>
        <span className="text-sm text-gray-500">
          {displayAchieved}/{displayTarget}권
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  )
}
