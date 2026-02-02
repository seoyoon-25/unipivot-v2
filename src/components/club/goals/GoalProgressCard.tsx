import { BookOpen, Trophy, Calendar } from 'lucide-react'

interface Props {
  title: string
  target: number
  achieved: number
  isCompleted: boolean
  type: 'yearly' | 'monthly'
}

export default function GoalProgressCard({ title, target, achieved, isCompleted, type }: Props) {
  const percentage = target > 0 ? Math.min(Math.round((achieved / target) * 100), 100) : 0

  const now = new Date()
  let remainingDays: number

  if (type === 'yearly') {
    const yearEnd = new Date(now.getFullYear(), 11, 31)
    remainingDays = Math.ceil((yearEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  } else {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    remainingDays = Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div
      className={`rounded-xl border p-6 ${
        isCompleted
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {isCompleted && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <Trophy className="w-4 h-4" />
            달성!
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <BookOpen className={`w-6 h-6 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
        <span className="text-2xl font-bold text-gray-900">
          {target}권 중 {achieved}권 완료
        </span>
      </div>

      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <span className="text-gray-500">{percentage}%</span>
          <span className="text-gray-500">
            {target - achieved > 0 ? `${target - achieved}권 남음` : '목표 달성'}
          </span>
        </div>
      </div>

      {!isCompleted && remainingDays > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          남은 기간: {remainingDays}일
        </div>
      )}
    </div>
  )
}
