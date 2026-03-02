'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Library, Search, User, Menu, X, ChevronRight, Home, BookOpen, Users, Calendar, Gift } from 'lucide-react'

const NAV_ITEMS = [
  { label: '홈', href: '/uniclub', icon: Home },
  { label: '도서', href: '/club/bookclub/bookshelf', icon: BookOpen },
  { label: '북클럽', href: '/club/bookclub', icon: Users },
  { label: '일정', href: '/club/bookclub', icon: Calendar },
  { label: '이벤트', href: '/programs', icon: Gift },
]

export default function UniClubHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#faf8f5]/90 backdrop-blur-xl shadow-lg shadow-stone-200/20 border-b border-stone-200/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 md:h-20 px-4 lg:px-8">
          {/* Logo */}
          <Link href="/uniclub" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                scrolled
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25'
                  : 'bg-white/20 backdrop-blur-sm border border-white/30'
              }`}
            >
              <Library className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
                  scrolled ? 'text-stone-800' : 'text-white'
                }`}
              >
                유니클럽
              </span>
              <span
                className={`text-[9px] font-medium tracking-widest uppercase -mt-0.5 transition-colors duration-300 ${
                  scrolled ? 'text-stone-400' : 'text-white/70'
                }`}
              >
                Literary Community
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? scrolled
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-white bg-white/20'
                    : scrolled
                      ? 'text-stone-600 hover:text-teal-600 hover:bg-stone-100'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/club/bookclub/bookshelf"
              className={`hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                scrolled
                  ? 'text-stone-600 hover:text-teal-600 hover:bg-stone-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-label="검색"
            >
              <Search className="w-[18px] h-[18px]" />
            </Link>

            {/* Login / MyClub */}
            {session?.user ? (
              <Link
                href="/club"
                className={`hidden md:flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  scrolled
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40'
                    : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                }`}
              >
                <User className="w-4 h-4" />
                마이클럽
              </Link>
            ) : (
              <Link
                href="/login"
                className={`hidden md:flex items-center h-10 px-5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  scrolled
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40'
                    : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                }`}
              >
                로그인
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200 ${
                scrolled
                  ? 'text-stone-700 hover:bg-stone-100'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-0 right-0 w-[85%] max-w-sm h-full bg-[#faf8f5] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-stone-200">
              <span className="text-lg font-bold text-stone-800">메뉴</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="px-4 py-6 space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive(item.href)
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                )
              })}
            </nav>

            {/* Bottom CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-stone-200 bg-white">
              {session?.user ? (
                <Link
                  href="/club"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg shadow-teal-500/25"
                >
                  <User className="w-4 h-4" />
                  마이클럽
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg shadow-teal-500/25"
                >
                  로그인
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
