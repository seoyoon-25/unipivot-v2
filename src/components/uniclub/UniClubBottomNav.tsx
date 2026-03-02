'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Users, Gift, User } from 'lucide-react'

const TABS = [
  { label: '홈', href: '/uniclub', icon: Home, exact: true },
  { label: '도서', href: '/club/bookclub/bookshelf', icon: BookOpen },
  { label: '북클럽', href: '/club/bookclub', icon: Users },
  { label: '이벤트', href: '/programs', icon: Gift },
  { label: 'MY', href: '/club/my', icon: User },
]

export default function UniClubBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Warm glass background */}
      <div className="absolute inset-0 bg-[#faf8f5]/90 backdrop-blur-xl border-t border-stone-200/60" />

      {/* Teal accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

      <div className="relative flex items-center justify-around h-[72px] pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = isActive(tab.href, tab.exact)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1.5 w-full h-full min-h-[56px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 ${
                active ? 'text-teal-600' : 'text-stone-400 active:text-stone-600'
              }`}
            >
              <div className="relative">
                {/* Active background glow */}
                {active && (
                  <div className="absolute -inset-3 rounded-2xl bg-teal-100/60 blur-sm" />
                )}
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30'
                      : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      active ? 'text-white scale-110' : ''
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
              </div>
              <span
                className={`text-[10px] leading-none font-medium transition-all duration-200 ${
                  active ? 'font-semibold text-teal-700' : ''
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
