import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import NotificationList from '@/components/club/notifications/NotificationList'
import Link from 'next/link'
import { Settings } from 'lucide-react'

export const metadata = {
  title: '알림 | 유니클럽',
}

export default async function NotificationsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/notifications'))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">알림</h1>
        <Link
          href="/club/notifications/settings"
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          title="알림 설정"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
      <NotificationList />
    </div>
  )
}
