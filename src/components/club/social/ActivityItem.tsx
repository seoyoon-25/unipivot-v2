import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Quote } from 'lucide-react'

interface ActivityItemProps {
  activity: {
    type: 'report' | 'quote'
    id: string
    user: { id: string; name: string | null; image: string | null }
    title: string
    content: string | null
    link: string | null
    createdAt: Date
  }
}

const typeConfig = {
  report: { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  quote: { icon: Quote, color: 'text-purple-500', bg: 'bg-purple-50' },
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const config = typeConfig[activity.type]
  const Icon = config.icon

  const inner = (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <Link href={`/club/profile/${activity.user.id}`} className="shrink-0">
          {activity.user.image ? (
            <Image
              src={activity.user.image}
              alt={activity.user.name || '프로필'}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-400">
              {activity.user.name?.[0] || '?'}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {activity.user.name || '(이름 없음)'}
            </span>
            <span className={`p-1 rounded ${config.bg}`}>
              <Icon className={`w-3 h-3 ${config.color}`} />
            </span>
          </div>
          <p className="text-sm text-gray-700">{activity.title}</p>
          {activity.content && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              &ldquo;{activity.content}&rdquo;
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">{timeAgo(activity.createdAt)}</p>
        </div>
      </div>
    </div>
  )

  if (activity.link) {
    return <Link href={activity.link}>{inner}</Link>
  }

  return inner
}
