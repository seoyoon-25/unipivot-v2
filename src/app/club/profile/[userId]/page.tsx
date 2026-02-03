import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getUserProfile } from '@/lib/club/profile-queries'
import { isFollowing, getFollowCounts } from '@/lib/club/social-queries'
import ProfileHeader from '@/components/club/profile/ProfileHeader'
import ProfileStats from '@/components/club/profile/ProfileStats'
import FollowButton from '@/components/club/social/FollowButton'

export const metadata = { title: '회원 프로필 | 유니클럽' }

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/api/auth/signin')

  const result = await getUserProfile(userId)

  if (!result) {
    notFound()
  }

  if (!result.isPublic) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">비공개 프로필</h2>
        <p className="text-gray-500">이 회원의 프로필은 비공개입니다.</p>
      </div>
    )
  }

  const isMe = currentUser.id === userId

  const [following, counts] = await Promise.all([
    isMe ? Promise.resolve(false) : isFollowing(currentUser.id, userId),
    getFollowCounts(userId),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <ProfileHeader
            profile={{ ...result.user, email: '' }}
            showEmail={false}
          />
          {!isMe && (
            <FollowButton userId={userId} initialFollowing={following} />
          )}
        </div>

        {/* 팔로워/팔로잉 수 */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/club/social/followers`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            팔로워 <span className="font-semibold text-gray-900">{counts.followers}</span>
          </Link>
          <Link
            href={`/club/social/following`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            팔로잉 <span className="font-semibold text-gray-900">{counts.following}</span>
          </Link>
        </div>
      </div>

      {result.stats && (
        <ProfileStats
          stats={{ ...result.stats, attendanceRate: 0 }}
        />
      )}
    </div>
  )
}
