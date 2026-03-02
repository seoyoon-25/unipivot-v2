'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, BookOpen, MessagesSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/club', icon: Home, label: '홈' },
  { href: '/club/bookclub', icon: BookOpen, label: '진행도서' },
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-stone-100/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
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
                'relative flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-2xl transition-all duration-200',
                isActive
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-600 active:scale-95'
              )}
            >
              {/* Active background */}
              {isActive && (
                <span className="absolute inset-1 rounded-xl bg-indigo-50" />
              )}

              {/* Active dot indicator */}
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-indigo-500" />
              )}

              {/* Icon - larger size for better touch */}
              <Icon className={cn(
                'relative w-6 h-6 transition-transform duration-200',
                isActive && 'scale-105'
              )} />

              {/* Label */}
              <span className={cn(
                'relative text-[11px]',
                isActive ? 'font-semibold' : 'font-medium'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
