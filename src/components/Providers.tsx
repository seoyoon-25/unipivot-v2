'use client'

import { SessionProvider } from 'next-auth/react'
import { FontProvider } from './FontProvider'
import { ThemeProvider } from './ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <FontProvider>{children}</FontProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
