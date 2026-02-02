import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getMyProfile, getRecentActivity } from '@/lib/club/profile-queries'
import ProfileHeader from '@/components/club/profile/ProfileHeader'
import ProfileStats from '@/components/club/profile/ProfileStats'
import ProfileActivity from '@/components/club/profile/ProfileActivity'

export const metadata = { title: '내 프로필 | 유니클럽' }

export default async function MyProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/profile'))
  }

  const [profile, activities] = await Promise.all([
    getMyProfile(user.id),
    getRecentActivity(user.id),
  ])

  if (!profile) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <ProfileHeader profile={profile} />
          <Link
            href="/club/profile/edit"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 shrink-0"
          >
            <Pencil className="w-4 h-4" />
            수정
          </Link>
        </div>
      </div>

      <ProfileStats stats={profile.stats} />

      <ProfileActivity activities={activities} />
    </div>
  )
}
