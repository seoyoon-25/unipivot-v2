'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, BookOpen, MessagesSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/club', icon: Home, label: '홈' },
  { href: '/club/bookclub', icon: BookOpen, label: '책장' },
  { href: '/club/community', icon: MessagesSquare, label: '커뮤니티' },
  { href: '/club/notifications', icon: Bell, label: '알림' },
  { href: '/club/profile', icon: User, label: '프로필' },
]

export default function ClubBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="하단 네비게이션"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/club' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-blue-600')} />
              <span className={cn(isActive && 'font-medium')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
