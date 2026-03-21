'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, ExternalLink, Info, BookOpen, MessageSquare, Heart, FlaskConical } from 'lucide-react'
import { useState, createElement } from 'react'
import type { MenuItem } from './types'
import { DEFAULT_LOGO } from './styles'
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
import { MobileAuthButtons } from './AuthButtons'

// 카테고리별 아이콘 매핑
const ICON_MAP: Record<string, React.ElementType> = {
  '소개': Info,
  '프로그램': BookOpen,
  '소통마당': MessageSquare,
  '함께하기': Heart,
  '리서치랩': FlaskConical,
}

interface MobileNavProps {
  menuItems: MenuItem[]
  logoUrl?: string
  isScrolled: boolean
}

export function MobileNav({ menuItems, logoUrl, isScrolled }: MobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white lg:hidden border-b border-gray-200',
        isScrolled && 'shadow-lg shadow-gray-200/50'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src={logoUrl || DEFAULT_LOGO}
            alt="UniPivot"
            width={140}
            height={44}
            priority
            className="h-9 w-auto transition-opacity group-hover:opacity-80"
          />
        </Link>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2 text-gray-600 hover:text-[#FF6B35] transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-white border-l border-gray-200">
            <SheetHeader className="p-4 border-b border-gray-200">
              <SheetTitle className="flex items-center gap-2 text-[#FF6B35]">
                UniPivot
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto">
              <Accordion type="multiple" className="w-full">
                {menuItems.map((item, index) =>
                  item.children ? (
                    <AccordionItem key={item.label} value={`item-${index}`} className="border-b border-gray-200">
                      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-gray-700">
                        <span className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                            {ICON_MAP[item.label] && createElement(ICON_MAP[item.label], { className: 'w-4 h-4' })}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="bg-gray-50">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              target={child.external ? '_blank' : undefined}
                              rel={child.external ? 'noopener noreferrer' : undefined}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 pl-16 text-gray-600 hover:text-[#FF6B35] hover:bg-gray-100 transition-colors border-t border-gray-100 first:border-t-0"
                            >
                              <div className="flex-1">
                                <span className="font-medium flex items-center gap-1">
                                  {child.label}
                                  {child.external && <ExternalLink className="w-3 h-3" />}
                                </span>
                                {child.description && (
                                  <span className="block text-xs text-gray-400 mt-0.5">{child.description}</span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <div key={item.label} className="border-b border-gray-200">
                      <a
                        href={item.href!}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF6B35] hover:bg-gray-50 transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                          {ICON_MAP[item.label] && createElement(ICON_MAP[item.label], { className: 'w-4 h-4' })}
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
            <div className="p-4 border-t border-gray-200 mt-auto">
              <MobileAuthButtons onClose={() => setMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
