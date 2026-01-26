'use client'

import { SessionProvider } from 'next-auth/react'
import { FontProvider } from './FontProvider'
import { ThemeProvider } from './ThemeProvider'
import { SmoothScroll } from './SmoothScroll'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <FontProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </FontProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
