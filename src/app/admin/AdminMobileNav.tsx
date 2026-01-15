'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, Wallet, Palette } from 'lucide-react'

const mobileNavItems = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
  { label: '회원', href: '/admin/members', icon: Users },
  { label: '프로그램', href: '/admin/programs', icon: BookOpen },
  { label: '재무', href: '/admin/finance', icon: Wallet },
  { label: '디자인', href: '/admin/design', icon: Palette },
]

export default function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40">
      <div className="flex justify-around items-center py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
