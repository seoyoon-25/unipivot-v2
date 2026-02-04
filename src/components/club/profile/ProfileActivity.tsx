import Link from 'next/link'
import { CheckCircle, BookOpen, Quote } from 'lucide-react'

interface Activity {
  type: 'attendance' | 'report' | 'quote'
  id: string
  title: string
  link?: string
  createdAt: Date
}

interface Props {
  activities: Activity[]
}

const typeConfig = {
  attendance: { icon: CheckCircle, color: 'text-green-500' },
  report: { icon: BookOpen, color: 'text-blue-500' },
  quote: { icon: Quote, color: 'text-purple-500' },
}

export default function ProfileActivity({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">최근 활동</h2>
        <p className="text-zinc-500 text-sm text-center py-4">아직 활동 기록이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">최근 활동</h2>
      <div className="space-y-3">
        {activities.map((activity) => {
          const config = typeConfig[activity.type]
          const Icon = config.icon
          const content = (
            <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-50">
              <Icon className={`w-4 h-4 shrink-0 ${config.color}`} />
              <span className="text-sm text-zinc-900 flex-1 min-w-0 truncate">
                {activity.title}
              </span>
              <span className="text-xs text-zinc-400 shrink-0">
                {new Date(activity.createdAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )

          if (activity.link) {
            return (
              <Link key={activity.id} href={activity.link}>
                {content}
              </Link>
            )
          }
          return <div key={activity.id}>{content}</div>
        })}
      </div>
    </div>
  )
}
