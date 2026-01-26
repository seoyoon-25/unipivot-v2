'use client'

import { cn } from '@/lib/utils'
import { Menu, User, LogOut, Settings, Info, BookOpen, MessageSquare, Heart, FlaskConical, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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

// 카테고리별 아이콘 매핑
const ICON_MAP: Record<string, React.ReactNode> = {
  '소개': <Info className="w-4 h-4" />,
  '프로그램': <BookOpen className="w-4 h-4" />,
  '소통마당': <MessageSquare className="w-4 h-4" />,
  '함께하기': <Heart className="w-4 h-4" />,
  '리서치랩': <FlaskConical className="w-4 h-4" />,
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black border-b border-white/10',
        isScrolled && 'shadow-lg shadow-black/20'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Orange UniPivot */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-2xl text-[#FF6B35] transition-opacity group-hover:opacity-80">
              UniPivot
            </span>
          </Link>

          {/* Desktop Menu - Krafton style with underline animation */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <button className="nav-link-animated text-white hover:text-[#FF6B35] font-medium transition-colors py-2">
                      {item.label}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-[#1A1A1A] border-white/10">
                    <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider">
                      {item.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild className="focus:bg-[#FF6B35]/10 focus:text-white">
                        <Link
                          href={child.href}
                          target={child.external ? '_blank' : undefined}
                          rel={child.external ? 'noopener noreferrer' : undefined}
                          className="flex flex-col items-start gap-0.5 text-gray-300 hover:text-white"
                        >
                          <span className="font-medium flex items-center gap-1">
                            {child.label}
                            {child.external && <ExternalLink className="w-3 h-3" />}
                          </span>
                          {child.description && (
                            <span className="text-xs text-gray-500">{child.description}</span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a
                  key={item.label}
                  href={item.href!}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="nav-link-animated text-white hover:text-[#FF6B35] font-medium transition-colors py-2 flex items-center gap-1"
                >
                  {item.label}
                  {item.external && <ExternalLink className="w-3 h-3" />}
                </a>
              )
            )}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <>
                {/* Notification */}
                <div className="rounded-full">
                  <NotificationDropdown />
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 focus:outline-none">
                      <Avatar
                        src={session.user?.image}
                        name={session.user?.name || '사용자'}
                        size="sm"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border-white/10">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{session.user?.name}</span>
                        <span className="text-xs text-gray-400 font-normal">{session.user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="text-gray-300 focus:bg-[#FF6B35]/10 focus:text-white">
                      <Link href="/my" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        마이페이지
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-gray-300 focus:bg-[#FF6B35]/10 focus:text-white">
                      <Link href="/my/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        설정
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-all"
              >
                로그인
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 text-white hover:text-[#FF6B35] transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-[#1A1A1A] border-l border-white/10">
              <SheetHeader className="p-4 border-b border-white/10">
                <SheetTitle className="flex items-center gap-2 text-[#FF6B35]">
                  UniPivot
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto">
                <Accordion type="multiple" className="w-full">
                  {menuItems.map((item, index) =>
                    item.children ? (
                      <AccordionItem key={item.label} value={`item-${index}`} className="border-b border-white/10">
                        <AccordionTrigger className="px-4 py-3 hover:bg-white/5 text-white">
                          <span className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                              {ICON_MAP[item.label]}
                            </span>
                            <span className="font-medium">{item.label}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                          <div className="bg-black/30">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                target={child.external ? '_blank' : undefined}
                                rel={child.external ? 'noopener noreferrer' : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 pl-16 text-gray-300 hover:text-[#FF6B35] hover:bg-white/5 transition-colors border-t border-white/5 first:border-t-0"
                              >
                                <div className="flex-1">
                                  <span className="font-medium flex items-center gap-1">
                                    {child.label}
                                    {child.external && <ExternalLink className="w-3 h-3" />}
                                  </span>
                                  {child.description && (
                                    <span className="block text-xs text-gray-500 mt-0.5">{child.description}</span>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <div key={item.label} className="border-b border-white/10">
                        <a
                          href={item.href!}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FF6B35] hover:bg-white/5 transition-colors"
                        >
                          <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                            {ICON_MAP[item.label]}
                          </span>
                          <span className="font-medium flex-1">{item.label}</span>
                          {item.external && <ExternalLink className="w-4 h-4 text-gray-400" />}
                        </a>
                      </div>
                    )
                  )}
                </Accordion>
              </div>

              {/* Mobile Auth Section */}
              <div className="p-4 border-t border-white/10 mt-auto">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar
                        src={session.user?.image}
                        name={session.user?.name || '사용자'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/my"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        마이페이지
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    로그인
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
