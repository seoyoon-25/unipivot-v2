'use client'

import { cn } from '@/lib/utils'
import { Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui'

type MenuItem = {
  label: string
  href?: string
  children?: { label: string; href: string; description?: string }[]
}

const menuItems: MenuItem[] = [
  {
    label: '프로그램',
    children: [
      { label: '독서모임', href: '/bookclub', description: '남Book북한걸음' },
      { label: '세미나', href: '/seminar', description: '정기 교육 세미나' },
      { label: 'K-Move', href: '/kmove', description: '한반도 이슈 탐방' },
    ],
  },
  {
    label: '소통마당',
    children: [
      { label: '제안하기', href: '/suggest', description: '새로운 아이디어' },
      { label: '공지사항', href: '/notice', description: '단체 소식' },
      { label: '한반도이슈', href: '/korea-issue', description: 'AI 피봇이와 함께' },
    ],
  },
  {
    label: '연대하기',
    children: [
      { label: '강연요청', href: '/request', description: '강연/협력 요청' },
      { label: '전문가 풀', href: '/experts', description: '분야별 전문가' },
      { label: '재능나눔', href: '/talent', description: '재능 기부' },
      { label: '후원하기', href: '/donate', description: '유니피벗 후원' },
    ],
  },
  {
    label: '소개',
    children: [
      { label: '단체 소개', href: '/p/about-us', description: '미션과 핵심 가치' },
      { label: '프로그램 안내', href: '/p/programs', description: '유니피벗 프로그램' },
      { label: '연혁', href: '/about', description: '유니피벗 히스토리' },
    ],
  },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span
              className={cn(
                'font-bold text-xl transition-colors',
                isScrolled ? 'text-gray-900' : 'text-white'
              )}
            >
              유니피벗
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="dropdown relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={cn(
                      'nav-link px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1 transition-colors',
                      isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white/90 hover:bg-white/10'
                    )}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div
                    className={cn(
                      'absolute top-full left-0 pt-2 w-48 transition-all duration-200',
                      openDropdown === item.label
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible translate-y-2'
                    )}
                  >
                    <div className="bg-white rounded-xl shadow-xl py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-gray-700 hover:bg-primary-light hover:text-primary transition-colors"
                        >
                          <span className="font-medium">{child.label}</span>
                          {child.description && (
                            <span className="block text-xs text-gray-400 mt-0.5">
                              {child.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={cn(
                    'nav-link px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/90 hover:bg-white/10'
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <div
                className="dropdown relative"
                onMouseEnter={() => setOpenDropdown('user')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-2">
                  <Avatar
                    src={session.user?.image}
                    name={session.user?.name || '사용자'}
                    size="sm"
                  />
                </button>
                <div
                  className={cn(
                    'absolute top-full right-0 pt-2 w-48 transition-all duration-200',
                    openDropdown === 'user'
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible translate-y-2'
                  )}
                >
                  <div className="bg-white rounded-xl shadow-xl py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/my"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-primary-light hover:text-primary"
                    >
                      <User className="w-4 h-4" />
                      마이페이지
                    </Link>
                    <Link
                      href="/my/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-primary-light hover:text-primary"
                    >
                      <Settings className="w-4 h-4" />
                      설정
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors shadow-lg shadow-primary/20"
              >
                로그인
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={cn('w-6 h-6', isScrolled ? 'text-gray-900' : 'text-white')} />
            ) : (
              <Menu className={cn('w-6 h-6', isScrolled ? 'text-gray-900' : 'text-white')} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-2xl shadow-xl mt-2 p-4 animate-slide-down">
            {menuItems.map((item) =>
              item.children ? (
                <div key={item.label} className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block py-2 text-gray-700 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="block py-2 text-gray-700 hover:text-primary font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {session ? (
                <div className="space-y-2">
                  <Link
                    href="/my"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block py-2 text-red-600"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full py-3 bg-primary text-white text-center rounded-lg font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
