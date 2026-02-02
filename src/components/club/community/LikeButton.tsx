'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

interface Props {
  postId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}

export default function LikeButton({ postId, initialLiked, initialCount, isLoggedIn }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!isLoggedIn) return
    if (isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/club/community/${postId}/like`, {
        method: 'POST',
      })
      const data = await res.json()
      setLiked(data.liked)
      setCount(data.likeCount)
    } catch {
      // ignore
    }
    setIsLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isLoggedIn || isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
        liked
          ? 'bg-red-50 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      좋아요 {count}
    </button>
  )
}
