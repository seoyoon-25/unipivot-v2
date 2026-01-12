import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, BookOpen, Briefcase, Wallet,
  FileText, Bot, Palette, Settings, Home,
  ChevronDown
} from 'lucide-react'
import AdminMobileNav from './AdminMobileNav'

const sidebarItems = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
  {
    label: '회원 관리',
    href: '/admin/members',
    icon: Users,
  },
  {
    label: '프로그램',
    href: '/admin/programs',
    icon: BookOpen,
  },
  {
    label: '사업 관리',
    icon: Briefcase,
    children: [
      { label: '프로젝트', href: '/admin/business/projects' },
      { label: '협력기관', href: '/admin/business/partners' },
      { label: '일정', href: '/admin/business/calendar' },
      { label: '문서', href: '/admin/business/documents' },
    ],
  },
  {
    label: '재무',
    icon: Wallet,
    children: [
      { label: '회계 현황', href: '/admin/finance' },
      { label: '거래 내역', href: '/admin/finance/transactions' },
      { label: '계정과목', href: '/admin/finance/accounts' },
      { label: '기금 관리', href: '/admin/finance/funds' },
      { label: '입금 관리', href: '/admin/finance/deposits' },
      { label: '후원 관리', href: '/admin/finance/donations' },
      { label: '보고서', href: '/admin/finance/reports' },
    ],
  },
  {
    label: '콘텐츠',
    icon: FileText,
    children: [
      { label: '공지사항', href: '/admin/contents/notices' },
      { label: '블로그', href: '/admin/contents/blog' },
    ],
  },
  {
    label: 'AI 챗봇',
    icon: Bot,
    children: [
      { label: '챗봇 관리', href: '/admin/ai/chatbot' },
      { label: '지식 베이스', href: '/admin/ai/knowledge' },
    ],
  },
  {
    label: '디자인',
    icon: Palette,
    children: [
      { label: '페이지 관리', href: '/admin/design/pages' },
      { label: '메뉴 관리', href: '/admin/design/menus' },
      { label: '테마', href: '/admin/design/theme' },
      { label: '배너', href: '/admin/design/banners' },
    ],
  },
  {
    label: '설정',
    icon: Settings,
    children: [
      { label: '관리자', href: '/admin/settings/admins' },
      { label: '백업', href: '/admin/settings/backup' },
    ],
  },
]


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-gray-900 flex-col fixed h-full z-50">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <div>
              <span className="font-bold text-white">UniPivot</span>
              <span className="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <details className="group">
                    <summary className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer list-none">
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg transition-colors"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={item.href!}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            사이트로 이동
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar - Desktop */}
        <header className="hidden lg:block bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-end px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user?.name}</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                {session.user?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden bg-gray-900 text-white sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-bold">Admin</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 text-gray-400 hover:text-white">
                <Home className="w-5 h-5" />
              </Link>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                {session.user?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <AdminMobileNav />

        {/* Page Content */}
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
