'use client'

import { cn } from '@/lib/utils'
import { Menu, X, ChevronDown, User, LogOut, Settings, Bell, Info, BookOpen, MessageSquare, Heart, FlaskConical, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui/button'
import NotificationDropdown from '@/components/NotificationDropdown'

type SubMenuItem = {
  label: string
  href: string
  description?: string
  external?: boolean
}

type MenuItem = {
  label: string
  href?: string
  children?: SubMenuItem[]
  external?: boolean
}

const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'

// 기본 메뉴 (서버에서 메뉴를 못 가져온 경우 폴백으로 사용)
const defaultMenuItems: MenuItem[] = [
  {
    label: '소개',
    children: [
      { label: '유니피벗 소개', href: '/about', description: '미션과 핵심 가치' },
      { label: '연혁', href: '/history', description: '유니피벗 히스토리' },
    ],
  },
  {
    label: '프로그램',
    children: [
      { label: '전체 프로그램', href: '/programs', description: '모든 프로그램 보기' },
      { label: '독서모임', href: '/programs?type=BOOKCLUB', description: '남Book북한걸음' },
      { label: '강연 및 세미나', href: '/programs?type=SEMINAR', description: '정기 교육 세미나' },
      { label: 'K-Move', href: '/programs?type=KMOVE', description: '현장 탐방' },
      { label: '토론회', href: '/programs?type=DEBATE', description: '주제별 토론회' },
    ],
  },
  {
    label: '소통마당',
    children: [
      { label: '공지사항', href: '/notice', description: '단체 소식' },
      { label: '활동 블로그', href: '/blog', description: '모임 기록, 후기' },
      { label: '읽고 싶은 책', href: '/books', description: '함께 읽고 싶은 책 공유' },
      { label: '한반도이슈', href: '/korea-issue', description: 'AI 피봇이와 함께' },
    ],
  },
  {
    label: '함께하기',
    children: [
      { label: '후원하기', href: '/donate', description: '유니피벗 후원' },
      { label: '프로그램 제안', href: '/suggest', description: '새로운 아이디어' },
      { label: '협조 요청', href: '/cooperation', description: '자문/강사/설문 요청' },
      { label: '재능나눔', href: '/talent', description: '재능 기부' },
    ],
  },
  {
    label: '리서치랩',
    href: `https://${LAB_DOMAIN}`,
    external: true,
  },
]

interface NavbarProps {
  menuItems?: MenuItem[]
}

export function Navbar({ menuItems = defaultMenuItems }: NavbarProps) {
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
          ? 'bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg'
          : 'bg-gradient-to-r from-orange-600 to-orange-500'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={(e) => {
              // 추가 안전장치: 혹시나 하는 에러 방지
              try {
                // Link 컴포넌트가 정상적으로 처리하도록 함
                return true
              } catch (error) {
                console.error('Logo click error:', error)
                // 에러 발생시 수동으로 홈페이지로 이동
                e.preventDefault()
                window.location.href = '/'
              }
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="font-bold text-xl text-white">
              유니피벗
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => {
              // 카테고리별 아이콘 매핑
              const iconMap: Record<string, React.ReactNode> = {
                '소개': <Info className="w-4 h-4" />,
                '프로그램': <BookOpen className="w-4 h-4" />,
                '소통마당': <MessageSquare className="w-4 h-4" />,
                '함께하기': <Heart className="w-4 h-4" />,
                '리서치랩': <FlaskConical className="w-4 h-4" />,
              }
              const icon = iconMap[item.label]

              return item.children ? (
                <div
                  key={item.label}
                  className="dropdown relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Button
                    variant="white"
                    size="default"
                    className="gap-1"
                  >
                    {item.label}
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      openDropdown === item.label && "rotate-180"
                    )} />
                  </Button>
                  <div
                    className={cn(
                      'absolute top-full left-0 pt-3 w-64 transition-all duration-200',
                      openDropdown === item.label
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible translate-y-2'
                    )}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden">
                      {/* 드롭다운 헤더 */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white">
                        {icon}
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      {/* 메뉴 아이템 */}
                      <div className="py-2">
                        {item.children.map((child, idx) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            target={child.external ? '_blank' : undefined}
                            rel={child.external ? 'noopener noreferrer' : undefined}
                            className="group flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors">
                              <span className="text-sm font-bold">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <span className="font-medium flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                                {child.label}
                                {child.external && (
                                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                )}
                              </span>
                              {child.description && (
                                <span className="block text-xs text-gray-400 mt-0.5">
                                  {child.description}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href!}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center justify-center h-10 px-6 py-3 text-sm font-semibold text-white bg-white/10 border border-white/20 rounded-xl transition-all duration-200 hover:bg-white/20 gap-1"
                >
                  {icon}
                  {item.label}
                  {item.external && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </a>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <>
                {/* Notification Dropdown */}
                <div className={cn(
                  'rounded-full',
                  isScrolled ? '' : 'bg-white/10'
                )}>
                  <NotificationDropdown />
                </div>

                {/* User Dropdown */}
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
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <User className="w-4 h-4" />
                      마이페이지
                    </Link>
                    <Link
                      href="/my/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
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
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-10 px-6 py-3 text-sm font-semibold bg-white hover:bg-orange-50 text-orange-600 rounded-xl shadow-lg transition-all duration-200"
              >
                로그인
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="white"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-2xl shadow-xl mt-2 p-3 animate-slide-down max-h-[80vh] overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => {
                // 카테고리별 아이콘 매핑
                const iconMap: Record<string, React.ReactNode> = {
                  '소개': <Info className="w-5 h-5" />,
                  '프로그램': <BookOpen className="w-5 h-5" />,
                  '소통마당': <MessageSquare className="w-5 h-5" />,
                  '함께하기': <Heart className="w-5 h-5" />,
                  '리서치랩': <FlaskConical className="w-5 h-5" />,
                }
                const icon = iconMap[item.label] || <ChevronRight className="w-5 h-5" />

                return item.children ? (
                  <div key={item.label} className="bg-gray-50 rounded-xl overflow-hidden">
                    {/* 카테고리 헤더 */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-400">
                      <span className="text-white">{icon}</span>
                      <span className="font-semibold text-white">{item.label}</span>
                    </div>
                    {/* 서브 메뉴 */}
                    <div className="divide-y divide-gray-100">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          target={child.external ? '_blank' : undefined}
                          rel={child.external ? 'noopener noreferrer' : undefined}
                          className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-orange-50 active:bg-orange-100 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div>
                            <span className="font-medium flex items-center gap-1">
                              {child.label}
                              {child.external && (
                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </span>
                            {child.description && (
                              <span className="block text-xs text-gray-400 mt-0.5">{child.description}</span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a
                    key={item.label}
                    href={item.href!}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl text-white font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.external && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </a>
                )
              })}
            </div>

            {/* 로그인/사용자 섹션 */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              {session ? (
                <div className="space-y-1">
                  <Link
                    href="/my"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">마이페이지</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">로그아웃</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20"
                >
                  <User className="w-5 h-5" />
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
