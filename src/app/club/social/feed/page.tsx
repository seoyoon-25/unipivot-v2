import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getActivityFeed } from '@/lib/club/social-queries'
import ActivityItem from '@/components/club/social/ActivityItem'

export const metadata = { title: '활동 피드 | 유니클럽' }

export default async function FeedPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const activities = await getActivityFeed(user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">활동 피드</h1>
          <p className="text-sm text-zinc-500 mt-1">팔로잉한 사람들의 최근 활동</p>
        </div>
        <Link
          href="/club/social/discover"
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Users className="w-4 h-4" />
          친구 찾기
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">👀</div>
          <p className="text-zinc-500 mb-2">아직 피드가 비어있습니다.</p>
          <p className="text-sm text-zinc-400 mb-4">
            다른 회원을 팔로우하면 활동을 볼 수 있어요.
          </p>
          <Link
            href="/club/social/discover"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Users className="w-4 h-4" />
            독서 친구 찾기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}
