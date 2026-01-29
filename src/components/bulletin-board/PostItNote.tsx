'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostItNoteProps {
  id: string
  keyword: string
  content?: string
  nickname?: string
  likeCount: number
  createdAt: string
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange'
  rotation?: number
  onClick?: () => void
  onLike?: () => void
  isLiked?: boolean
  className?: string
}

// CSS 클래스 기반 색상 매핑
const colorClasses = {
  yellow: 'post-it-yellow',
  pink: 'post-it-pink',
  blue: 'post-it-blue',
  green: 'post-it-green',
  orange: 'post-it-orange',
}

export function PostItNote({
  id,
  keyword,
  content,
  nickname,
  likeCount,
  createdAt,
  color = 'yellow',
  rotation = 0,
  onClick,
  onLike,
  isLiked = false,
  className
}: PostItNoteProps) {
  const [isHovered, setIsHovered] = useState(false)

  const timeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diff < 60) return '방금 전'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
    return past.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      className={cn(
        'post-it rounded cursor-pointer',
        colorClasses[color],
        className
      )}
      style={{
        transform: `rotate(${isHovered ? 0 : rotation}deg)`,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* 키워드 */}
      <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">
        #{keyword}
      </h4>

      {/* 내용 (있는 경우) */}
      {content && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-3">
          {content}
        </p>
      )}

      {/* 하단 정보 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {nickname && (
            <span className="font-medium">{nickname}</span>
          )}
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {timeAgo(createdAt)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onLike?.()
          }}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full transition-colors',
            isLiked
              ? 'text-red-500 bg-red-50'
              : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
          )}
        >
          <Heart className={cn('w-3 h-3', isLiked && 'fill-current')} />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  )
}
