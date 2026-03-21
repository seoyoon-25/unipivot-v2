'use client'

import Link from 'next/link'
import { User, LogOut, Settings } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import NotificationDropdown from '@/components/NotificationDropdown'

export function AuthButtons() {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        {/* Notification */}
        <div className="rounded-full">
          <NotificationDropdown />
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 focus:outline-none">
              <Avatar
                src={session.user?.image}
                name={session.user?.name || '사용자'}
                size="sm"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{session.user?.name}</span>
                <span className="text-xs text-gray-500 font-normal">{session.user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem asChild className="text-gray-600 focus:bg-[#FF6B35]/10 focus:text-gray-900">
              <Link href="/my" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                마이페이지
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-gray-600 focus:bg-[#FF6B35]/10 focus:text-gray-900">
              <Link href="/my/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                설정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-500 focus:text-red-600 focus:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  return (
    <Link
      href="/login"
      className="px-5 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-all"
    >
      로그인
    </Link>
  )
}

interface MobileAuthButtonsProps {
  onClose: () => void
}

export function MobileAuthButtons({ onClose }: MobileAuthButtonsProps) {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar
            src={session.user?.image}
            name={session.user?.name || '사용자'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{session.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/my"
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <User className="w-4 h-4" />
            마이페이지
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      onClick={onClose}
      className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors"
    >
      <User className="w-4 h-4" />
      로그인
    </Link>
  )
}
