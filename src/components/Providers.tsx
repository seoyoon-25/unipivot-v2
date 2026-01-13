'use client'

import { SessionProvider } from 'next-auth/react'
import { FontProvider } from './FontProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FontProvider>{children}</FontProvider>
    </SessionProvider>
  )
}
