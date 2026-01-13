'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, ClipboardList, FileSearch, TrendingUp, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'

const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'bestcome.org'

const navItems = [
  { href: '/lab', label: '홈', icon: LayoutDashboard, exact: true },
  { href: '/lab/experts', label: '전문가/강사', icon: Users },
  { href: '/lab/surveys', label: '설문조사', icon: ClipboardList },
  { href: '/lab/research', label: '연구참여', icon: FileSearch },
  { href: '/lab/trends', label: '연구동향', icon: TrendingUp },
]

export function LabNavigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

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
            <Link
              href="/lab/experts/register"
              className="hidden md:inline-flex px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
            >
              전문가 등록
            </Link>

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
              <Link
                href="/lab/experts/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium"
              >
                전문가 등록
              </Link>
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
