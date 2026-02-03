'use client'

import { useState } from 'react'
import { UserPlus, UserCheck } from 'lucide-react'

interface Props {
  userId: string
  initialFollowing: boolean
}

export default function FollowButton({ userId, initialFollowing }: Props) {
  const [isFollowingState, setIsFollowingState] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/club/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: isFollowingState ? 'unfollow' : 'follow',
        }),
      })

      if (res.ok) {
        setIsFollowingState(!isFollowingState)
      }
    } catch {
      // silently fail
    }

    setIsLoading(false)
  }

  if (isFollowingState) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <UserCheck className="w-4 h-4" />
        팔로잉
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      <UserPlus className="w-4 h-4" />
      팔로우
    </button>
  )
}
