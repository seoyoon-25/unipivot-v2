import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { discoverUsers } from '@/lib/club/social-queries'
import UserCard from '@/components/club/social/UserCard'

export const metadata = { title: '독서 친구 찾기 | 유니클럽' }

export default async function DiscoverPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const recommendations = await discoverUsers(user.id)

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
        <h1 className="text-2xl font-bold text-gray-900">독서 친구 찾기</h1>
        <p className="text-sm text-gray-500 mt-1">
          같은 프로그램 참가자와 활발한 독서가를 만나보세요
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          추천할 사용자가 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <UserCard
              key={rec.id}
              user={rec}
              isFollowing={false}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
