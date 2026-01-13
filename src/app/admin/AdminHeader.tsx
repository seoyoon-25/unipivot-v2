'use client'

import { Bell } from 'lucide-react'
import NotificationDropdown from '@/components/NotificationDropdown'

interface AdminHeaderProps {
  userName: string | null | undefined
}

export default function AdminHeader({ userName }: AdminHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <NotificationDropdown />
      <span className="text-sm text-gray-600">{userName}</span>
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
        {userName?.[0] || 'A'}
      </div>
    </div>
  )
}
