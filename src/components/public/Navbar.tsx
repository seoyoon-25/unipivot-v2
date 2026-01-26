'use client'

import { cn } from '@/lib/utils'
import { Menu, User, LogOut, Settings, X, ChevronDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
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
import NotificationDropdown from '@/components/NotificationDropdown'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { data: session } = useSession()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                  isScrolled
                    ? 'bg-gradient-to-br from-primary to-primary-dark'
                    : 'bg-white/20 backdrop-blur-sm'
                )}
              >
                <span className="text-white font-bold text-lg">U</span>
              </motion.div>
              <span className={cn(
                'font-bold text-xl transition-colors duration-300',
                isScrolled ? 'text-dark' : 'text-white'
              )}>
                유니피벗
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1 hover-underline',
                        isScrolled
                          ? 'text-gray-700 hover:text-dark'
                          : 'text-white/90 hover:text-white'
                      )}
                    >
                      {item.label}
                      <ChevronDown className={cn(
                        'w-4 h-4 transition-transform duration-300',
                        activeDropdown === item.label && 'rotate-180'
                      )} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute top-full left-0 pt-2"
                          onMouseEnter={() => handleMouseEnter(item.label)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-3 min-w-[240px] overflow-hidden">
                            {item.children.map((child, idx) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                target={child.external ? '_blank' : undefined}
                                rel={child.external ? 'noopener noreferrer' : undefined}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group/item"
                              >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/20 transition-colors">
                                  <span className="text-primary text-xs font-bold">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900 flex items-center gap-1 group-hover/item:text-primary transition-colors">
                                    {child.label}
                                    {child.external && <ExternalLink className="w-3 h-3" />}
                                  </span>
                                  {child.description && (
                                    <span className="text-xs text-gray-500 mt-0.5 block">
                                      {child.description}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    key={item.label}
                    href={item.href!}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1 hover-underline',
                      isScrolled
                        ? 'text-gray-700 hover:text-dark'
                        : 'text-white/90 hover:text-white'
                    )}
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
                  <div className={cn(
                    'rounded-full transition-colors',
                    !isScrolled && 'bg-white/10'
                  )}>
                    <NotificationDropdown />
                  </div>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 focus:outline-none"
                      >
                        <Avatar
                          src={session.user?.image}
                          name={session.user?.name || '사용자'}
                          size="sm"
                        />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{session.user?.name}</span>
                          <span className="text-xs text-gray-500 font-normal">{session.user?.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          마이페이지
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my/settings" className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          설정
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/login"
                    className={cn(
                      'px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300',
                      isScrolled
                        ? 'bg-dark text-white hover:bg-dark-secondary'
                        : 'bg-white text-dark hover:bg-gray-100'
                    )}
                  >
                    로그인
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                isScrolled
                  ? 'text-dark hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              )}
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    <span className="text-white font-bold text-lg">U</span>
                  </div>
                  <span className="font-bold text-xl text-dark">유니피벗</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="mb-2"
                  >
                    {item.children ? (
                      <MobileDropdown
                        item={item}
                        onClose={() => setMobileMenuOpen(false)}
                      />
                    ) : (
                      <a
                        href={item.href!}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-4 px-4 text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        {item.label}
                        {item.external && <ExternalLink className="w-4 h-4 text-gray-400" />}
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Auth Section */}
              <div className="p-6 mt-auto border-t border-gray-100">
                {session ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Avatar
                        src={session.user?.image}
                        name={session.user?.name || '사용자'}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/my"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        마이페이지
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
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
                    className="flex items-center justify-center gap-2 w-full py-4 bg-dark text-white rounded-xl font-medium hover:bg-dark-secondary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    로그인
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Mobile Dropdown Component
function MobileDropdown({
  item,
  onClose,
}: {
  item: MenuItem
  onClose: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 px-4 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
      >
        {item.label}
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-gray-50"
          >
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                target={child.external ? '_blank' : undefined}
                rel={child.external ? 'noopener noreferrer' : undefined}
                onClick={onClose}
                className="flex items-start gap-3 py-3 px-6 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-gray-700 font-medium flex items-center gap-1">
                    {child.label}
                    {child.external && <ExternalLink className="w-3 h-3 text-gray-400" />}
                  </span>
                  {child.description && (
                    <span className="text-xs text-gray-500 mt-0.5 block">
                      {child.description}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
