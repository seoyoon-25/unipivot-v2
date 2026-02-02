'use client'

import { useIsMobile } from '@/hooks/useMediaQuery'
import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  mobileHeight?: number
  desktopHeight?: number
}

export default function ResponsiveChart({
  children,
  mobileHeight = 250,
  desktopHeight = 350,
}: Props) {
  const isMobile = useIsMobile()

  return (
    <div style={{ width: '100%', height: isMobile ? mobileHeight : desktopHeight }}>
      {children}
    </div>
  )
}
