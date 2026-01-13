'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import NotificationDropdown from '@/components/NotificationDropdown'

interface AdminMobileHeaderProps {
  userName: string | null | undefined
}

export default function AdminMobileHeader({ userName }: AdminMobileHeaderProps) {
  return (
    <header className="lg:hidden bg-gray-900 text-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="font-bold">Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="text-white">
            <NotificationDropdown />
          </div>
          <Link href="/" className="p-2 text-gray-400 hover:text-white">
            <Home className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
            {userName?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
