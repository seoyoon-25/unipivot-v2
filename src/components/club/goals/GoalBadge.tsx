import { Trophy, Target } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
}

interface Props {
  badge: BadgeData
  earnedAt: string
}

export default function GoalBadge({ badge, earnedAt }: Props) {
  const Icon = badge.category === 'GOAL_YEARLY' ? Trophy : Target

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-yellow-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900 text-sm">{badge.name}</p>
        <p className="text-xs text-gray-500">
          {format(new Date(earnedAt), 'yyyy.M.d', { locale: ko })} 획득
        </p>
      </div>
    </div>
  )
}
