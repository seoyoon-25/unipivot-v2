'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BookOpen, Search, User, Menu, X, Sparkles } from 'lucide-react'

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
    <>
      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 z-[51] h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <header
        className={`fixed top-0.5 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Logo */}
          <Link href="/uniclub" className="flex items-center gap-3 group">
            {/* Logo Mark */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/20"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
                }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              {/* Sparkle accent */}
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {/* Logo Text */}
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                UNICLUB
              </span>
              <span className="text-[9px] font-medium text-stone-400 tracking-widest uppercase -mt-0.5">
                Reading Community
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl ${
                  isActive(item.href)
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/club/bookclub/bookshelf"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100/60 transition-all duration-200"
              aria-label="검색"
            >
              <Search className="w-[18px] h-[18px]" />
            </Link>

            {/* Login / MyClub */}
            {session?.user ? (
              <Link
                href="/club"
                className="hidden md:flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                }}
              >
                <User className="w-4 h-4" />
                마이클럽
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center h-10 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                }}
              >
                로그인
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-stone-600 hover:bg-stone-100/60 transition-colors duration-200"
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-stone-100 px-4 pb-6 pt-3 shadow-xl">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center h-12 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100">
              {session?.user ? (
                <Link
                  href="/club"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl text-white text-sm font-semibold transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  <User className="w-4 h-4" />
                  마이클럽
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center h-12 rounded-xl text-white text-sm font-semibold transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  로그인
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
