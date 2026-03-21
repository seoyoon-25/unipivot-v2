'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { MenuItem } from './types'
import { COLORS } from './styles'

interface MegaMenuProps {
  menuItems: MenuItem[]
  hoveredMenu: string | null
  onColumnEnter: (label: string) => void
  menuRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
}

export function MegaMenu({ menuItems, hoveredMenu, onColumnEnter, menuRefs }: MegaMenuProps) {
  // 드롭다운이 있는 메뉴만 필터링
  const dropdownMenus = menuItems.filter(item => item.children)

  return (
    <div className="hidden lg:block bg-white shadow-lg border-t border-gray-100 animate-dropdown-in">
      <div className="relative flex">
        {dropdownMenus.map((menu) => (
          <div
            key={menu.label}
            ref={(el) => { menuRefs.current[menu.label] = el }}
            onMouseEnter={() => onColumnEnter(menu.label)}
            className={cn(
              'relative flex-1 min-w-[200px] px-8 py-6 transition-colors duration-200',
              hoveredMenu === menu.label ? 'bg-[#F97316]' : 'bg-white'
            )}
          >
            {/* 카테고리 타이틀 */}
            <h3 className={cn(
              'font-bold text-sm mb-4 tracking-wide transition-colors duration-200',
              hoveredMenu === menu.label ? 'text-white' : 'text-gray-800'
            )}>
              {menu.label}
            </h3>

            {/* 서브메뉴 아이템들 */}
            <ul className="space-y-2">
              {menu.children?.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    target={child.external ? '_blank' : undefined}
                    rel={child.external ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'group flex items-center gap-1 text-sm transition-all duration-150',
                      'border-b-2 border-transparent pb-0.5',
                      hoveredMenu === menu.label
                        ? 'text-white/70 hover:text-white hover:border-white'
                        : 'text-gray-500 hover:text-gray-900 hover:border-gray-400'
                    )}
                  >
                    {child.label}
                    {child.external && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
