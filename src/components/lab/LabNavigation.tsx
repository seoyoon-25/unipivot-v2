'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Users, ClipboardList, FileSearch, TrendingUp, LayoutDashboard, Menu, X, User, LogOut, ChevronDown, Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { LabBadgeList } from './LabBadge'

const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'bestcome.org'

const navItems = [
  { href: '/lab', label: '홈', icon: LayoutDashboard, exact: true },
  { href: '/lab/experts', label: '전문가/강사', icon: Users },
  { href: '/lab/surveys', label: '설문/인터뷰', icon: ClipboardList },
  { href: '/lab/research', label: '연구참여', icon: FileSearch },
  { href: '/lab/trends', label: '연구동향', icon: TrendingUp },
]

interface LabProfileData {
  profileComplete: boolean
  badges?: {
    expert?: { earned: boolean }
    instructor?: { earned: boolean; matchCount: number }
    participant?: { earned: boolean; surveyCount: number; interviewCount: number }
  }
}

export function LabNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [labProfile, setLabProfile] = useState<LabProfileData | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  // Fetch lab profile for badges
  useEffect(() => {
    if (session?.user) {
      fetch('/api/lab/profile')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setLabProfile(data)
          }
        })
        .catch(() => {})
    }
  }, [session])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/lab" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">유니피벗 리서치랩</p>
              <p className="text-xs text-gray-500">Research Lab</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href={`https://${MAIN_DOMAIN}`}
              className="hidden md:inline-flex text-sm text-gray-500 hover:text-gray-700"
            >
              메인 사이트
            </a>

            {/* User Menu */}
            {session?.user ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {session.user.name || '사용자'}
                  </span>
                  {labProfile?.badges && (
                    <LabBadgeList badges={labProfile.badges} size="sm" />
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                      {labProfile?.badges && (
                        <div className="mt-2">
                          <LabBadgeList badges={labProfile.badges} size="sm" showLabels />
                        </div>
                      )}
                    </div>
                    <Link
                      href="/lab/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      프로필 설정
                      {!labProfile?.profileComplete && (
                        <span className="ml-auto text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                          미완성
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/lab/experts/register"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Users className="w-4 h-4" />
                      전문가 등록
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => signOut({ callbackUrl: `https://${MAIN_DOMAIN}` })}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`https://${MAIN_DOMAIN}/login?callbackUrl=https://${LAB_DOMAIN}${pathname}`}
                className="hidden md:inline-flex px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
              >
                로그인
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <div className="space-y-1">
              {/* User Info (Mobile) */}
              {session?.user && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    {labProfile?.badges && (
                      <LabBadgeList badges={labProfile.badges} size="sm" />
                    )}
                  </div>
                  <hr className="my-2 border-gray-100" />
                </>
              )}

              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
              <hr className="my-3 border-gray-100" />

              {session?.user ? (
                <>
                  <Link
                    href="/lab/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    <Settings className="w-5 h-5" />
                    프로필 설정
                    {!labProfile?.profileComplete && (
                      <span className="ml-auto text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                        미완성
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/lab/experts/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium"
                  >
                    전문가 등록
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: `https://${MAIN_DOMAIN}` })}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href={`https://${MAIN_DOMAIN}/login?callbackUrl=https://${LAB_DOMAIN}${pathname}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium"
                >
                  로그인
                </Link>
              )}
              <a
                href={`https://${MAIN_DOMAIN}`}
                className="flex items-center justify-center px-4 py-3 text-gray-500 text-sm"
              >
                메인 사이트로 이동
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
