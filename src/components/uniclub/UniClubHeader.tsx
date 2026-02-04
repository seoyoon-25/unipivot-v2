'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BookOpen, Search, User, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: '도서', href: '/club/bookclub/bookshelf' },
  { label: '북클럽', href: '/club/bookclub' },
  { label: '이벤트', href: '/programs' },
  { label: '커뮤니티', href: '/club/community' },
]

export default function UniClubHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-zinc-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
          : 'bg-white/0'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/uniclub"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-200">
            <BookOpen className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900">
            UNICLUB
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isActive(item.href)
                  ? 'text-blue-600'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
              }`}
            >
              {item.label}
              {/* Active underline indicator */}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-blue-600" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <Link
            href="/club/bookclub/bookshelf"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="검색"
          >
            <Search className="w-[18px] h-[18px]" />
          </Link>

          {/* Login / MyClub - Ghost style */}
          {session?.user ? (
            <Link
              href="/club"
              className="hidden md:flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <User className="w-4 h-4" />
              마이클럽
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center h-10 px-4 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              로그인
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-zinc-600 hover:bg-zinc-100/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-white/95 backdrop-blur-xl border-t border-zinc-100 px-4 pb-4 pt-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center h-12 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active
                    ? 'text-blue-600 bg-blue-50/60'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="mt-2 pt-3 border-t border-zinc-100">
            {session?.user ? (
              <Link
                href="/club"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 h-12 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                마이클럽
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center h-12 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                로그인
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
