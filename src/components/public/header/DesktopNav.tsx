'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { useRef, useCallback, useEffect, useState } from 'react'
import type { MenuItem } from './types'
import { DEFAULT_LOGO, ANIMATION } from './styles'
import { MegaMenu } from './MegaMenu'
import { AuthButtons } from './AuthButtons'

interface DesktopNavProps {
  menuItems: MenuItem[]
  logoUrl?: string
  isScrolled: boolean
}

export function DesktopNav({ menuItems, logoUrl, isScrolled }: DesktopNavProps) {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleMenuEnter = useCallback((label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setHoveredMenu(label)
    setIsDropdownOpen(true)
  }, [])

  const handleMenuLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null)
      setIsDropdownOpen(false)
    }, ANIMATION.dropdownDelay)
  }, [])

  const handleColumnEnter = useCallback((label: string) => {
    setHoveredMenu(label)
  }, [])

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white hidden lg:block',
        isScrolled && 'shadow-lg shadow-gray-200/50',
        !isDropdownOpen && 'border-b border-gray-200'
      )}
    >
      {/* 메뉴바 + 드롭다운 전체 Wrapper */}
      <div onMouseLeave={handleMenuLeave}>
        {/* 상단 메뉴바 */}
        <div className="flex items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center group py-5">
            <Image
              src={logoUrl || DEFAULT_LOGO}
              alt="UniPivot"
              width={180}
              height={56}
              priority
              className="h-11 w-auto transition-opacity group-hover:opacity-80"
            />
          </Link>

          {/* Desktop Menu - 상단 메뉴 버튼들 */}
          <div className="flex items-stretch h-full">
            {menuItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  onMouseEnter={() => handleMenuEnter(item.label)}
                  className={cn(
                    'flex items-center px-7 cursor-pointer transition-colors duration-150',
                    hoveredMenu === item.label
                      ? 'bg-[#F97316]'
                      : 'bg-transparent'
                  )}
                >
                  <span
                    className={cn(
                      'text-[15px] font-bold tracking-wide transition-colors duration-150',
                      hoveredMenu === item.label
                        ? 'text-white'
                        : 'text-gray-800'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href!}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center px-7 text-[15px] font-bold tracking-wide text-gray-800 hover:text-[#F97316] transition-colors"
                >
                  {item.label}
                  {item.external && <ExternalLink className="w-3 h-3 ml-1" />}
                </a>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <AuthButtons />
          </div>
        </div>

        {/* Desktop Dropdown Panel */}
        {isDropdownOpen && (
          <MegaMenu
            menuItems={menuItems}
            hoveredMenu={hoveredMenu}
            onColumnEnter={handleColumnEnter}
            menuRefs={menuRefs}
          />
        )}
      </div>
    </nav>
  )
}
