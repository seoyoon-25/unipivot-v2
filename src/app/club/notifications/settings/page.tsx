import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getNotificationSettings } from '@/lib/club/notification-queries'
import NotificationSettingsForm from '@/components/club/notifications/NotificationSettingsForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '알림 설정 | 유니클럽',
}

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/notifications/settings'))
  }

  const settings = await getNotificationSettings(user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/club/notifications"
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">알림 설정</h1>
      </div>
      <NotificationSettingsForm
        initialSettings={{
          sessionReminder: settings.sessionReminder,
          newSession: settings.newSession,
          reportComment: settings.reportComment,
          announcement: settings.announcement,
          reminderHoursBefore: settings.reminderHoursBefore,
          quietHoursStart: settings.quietHoursStart,
          quietHoursEnd: settings.quietHoursEnd,
        }}
      />
    </div>
  )
}
