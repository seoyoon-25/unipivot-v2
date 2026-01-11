import { Providers } from '@/components/Providers'
import Link from 'next/link'
import { User, BookOpen, FileText, Coins, Settings, Home, LogOut } from 'lucide-react'

const sidebarItems = [
  { label: '대시보드', href: '/my', icon: Home },
  { label: '프로필', href: '/my/profile', icon: User },
  { label: '참여 프로그램', href: '/my/programs', icon: BookOpen },
  { label: '독서 기록', href: '/my/reports', icon: FileText },
  { label: '포인트', href: '/my/points', icon: Coins },
  { label: '설정', href: '/my/settings', icon: Settings },
]

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col">
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="font-bold text-xl text-gray-900">마이페이지</span>
            </Link>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-primary-light hover:text-primary transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5" />
              홈으로
            </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40">
          <div className="flex items-center justify-between p-4">
            <Link href="/my" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <span className="font-bold text-gray-900">마이페이지</span>
            </Link>
            <Link href="/" className="text-gray-600">
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:p-8 p-4 pt-20 md:pt-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  )
}
