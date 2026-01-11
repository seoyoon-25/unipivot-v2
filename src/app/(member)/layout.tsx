import { Providers } from '@/components/Providers'
import Link from 'next/link'
import { User, BookOpen, FileText, Coins, Settings, Home, LayoutDashboard } from 'lucide-react'

const sidebarItems = [
  { label: '대시보드', href: '/my', icon: LayoutDashboard },
  { label: '프로필', href: '/my/profile', icon: User },
  { label: '참여 프로그램', href: '/my/programs', icon: BookOpen },
  { label: '독서 기록', href: '/my/reports', icon: FileText },
  { label: '포인트', href: '/my/points', icon: Coins },
  { label: '설정', href: '/my/settings', icon: Settings },
]

const mobileNavItems = [
  { label: '홈', href: '/my', icon: LayoutDashboard },
  { label: '프로그램', href: '/my/programs', icon: BookOpen },
  { label: '독서', href: '/my/reports', icon: FileText },
  { label: '포인트', href: '/my/points', icon: Coins },
  { label: '프로필', href: '/my/profile', icon: User },
]

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col fixed h-full">
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="font-bold text-xl text-gray-900">마이페이지</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
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
            <Link href="/" className="p-2 text-gray-600 hover:text-primary">
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
          <div className="flex justify-around items-center py-2">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-primary transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 md:p-8 p-4 pt-20 pb-24 md:pb-8 md:pt-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  )
}
