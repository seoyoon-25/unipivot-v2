import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getMyProfile } from '@/lib/club/profile-queries'
import ProfileEditForm from '@/components/club/profile/ProfileEditForm'

export const metadata = { title: '프로필 수정 | 유니클럽' }

export default async function EditProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/profile/edit'))
  }

  const profile = await getMyProfile(user.id)
  if (!profile) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/club/profile"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        프로필로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">프로필 수정</h1>

      <ProfileEditForm profile={profile} />
    </div>
  )
}
