'use client'

import { useEffect, useState } from 'react'
import type { NavbarProps } from './types'
import { defaultMenuItems } from './menuData'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'

export function Header({ menuItems = defaultMenuItems, logoUrl }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <DesktopNav
        menuItems={menuItems}
        logoUrl={logoUrl}
        isScrolled={isScrolled}
      />
      <MobileNav
        menuItems={menuItems}
        logoUrl={logoUrl}
        isScrolled={isScrolled}
      />
    </>
  )
}
