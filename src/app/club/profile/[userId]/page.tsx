import { notFound } from 'next/navigation'
import { Lock } from 'lucide-react'
import { getUserProfile } from '@/lib/club/profile-queries'
import ProfileHeader from '@/components/club/profile/ProfileHeader'
import ProfileStats from '@/components/club/profile/ProfileStats'

export const metadata = { title: '회원 프로필 | 유니클럽' }

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProfileHeader
          profile={{ ...result.user, email: '' }}
          showEmail={false}
        />
      </div>

      {result.stats && (
        <ProfileStats
          stats={{ ...result.stats, attendanceRate: 0 }}
        />
      )}
    </div>
  )
}
