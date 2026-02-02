import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Bell, Database, Trash2, ChevronRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'

export const metadata = { title: '설정 | 유니클럽' }

const menuItems = [
  {
    href: '/club/settings/account',
    icon: User,
    title: '계정',
    description: '이메일, 비밀번호 변경',
  },
  {
    href: '/club/notifications/settings',
    icon: Bell,
    title: '알림',
    description: '알림 수신 설정',
  },
  {
    href: '/club/settings/data',
    icon: Database,
    title: '데이터',
    description: '내 데이터 내보내기',
  },
  {
    href: '/club/settings/delete-account',
    icon: Trash2,
    title: '계정 탈퇴',
    description: '계정 및 데이터 삭제',
    danger: true,
  },
]

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=' + encodeURIComponent('/club/settings'))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">설정</h1>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                item.danger ? 'text-red-600' : ''
              }`}
            >
              <div
                className={`p-2 rounded-lg ${item.danger ? 'bg-red-100' : 'bg-gray-100'}`}
              >
                <Icon
                  className={`w-5 h-5 ${item.danger ? 'text-red-600' : 'text-gray-600'}`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${item.danger ? 'text-red-600' : 'text-gray-900'}`}
                >
                  {item.title}
                </p>
                <p
                  className={`text-sm ${item.danger ? 'text-red-400' : 'text-gray-500'}`}
                >
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
