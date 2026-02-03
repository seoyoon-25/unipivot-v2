import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getFollowingList, getFollowCounts } from '@/lib/club/social-queries'
import UserCard from '@/components/club/social/UserCard'

export const metadata = { title: '팔로잉 | 유니클럽' }

export default async function FollowingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const [followingUsers, counts] = await Promise.all([
    getFollowingList(user.id),
    getFollowCounts(user.id),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href="/club/social/feed"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          피드
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/club/social/followers"
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            팔로워 {counts.followers}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            팔로잉 ({counts.following})
          </h1>
        </div>
      </div>

      {followingUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-4">아직 팔로잉하는 사람이 없습니다.</p>
          <Link
            href="/club/social/discover"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            독서 친구 찾기
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {followingUsers.map((f) => (
            <UserCard
              key={f.id}
              user={f}
              isFollowing={true}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
