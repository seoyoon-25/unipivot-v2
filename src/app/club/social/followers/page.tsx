import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getFollowers, getFollowCounts, getFollowingSet } from '@/lib/club/social-queries'
import UserCard from '@/components/club/social/UserCard'

export const metadata = { title: '팔로워 | 유니클럽' }

export default async function FollowersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const [followers, counts] = await Promise.all([
    getFollowers(user.id),
    getFollowCounts(user.id),
  ])

  // 내가 팔로우하고 있는지 일괄 확인
  const followingSet = await getFollowingSet(
    user.id,
    followers.map((f) => f.id)
  )

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
          <h1 className="text-2xl font-bold text-gray-900">
            팔로워 ({counts.followers})
          </h1>
          <Link
            href="/club/social/following"
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            팔로잉 {counts.following}
          </Link>
        </div>
      </div>

      {followers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          아직 팔로워가 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {followers.map((f) => (
            <UserCard
              key={f.id}
              user={f}
              isFollowing={followingSet.has(f.id)}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
