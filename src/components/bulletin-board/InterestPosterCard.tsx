'use client'

import { useState } from 'react'
import { Users, Heart, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface InterestPosterCardProps {
  id: string
  keyword: string
  category?: string | null
  totalCount: number
  likeCount: number
  isFixed?: boolean
  isRecommended?: boolean
  trend?: 'up' | 'down' | 'stable' | 'new'
  onClick?: () => void
  className?: string
}

export function InterestPosterCard({
  id,
  keyword,
  category,
  totalCount,
  likeCount,
  isFixed = false,
  isRecommended = false,
  trend,
  onClick,
  className
}: InterestPosterCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // 크기 결정 (totalCount 기반)
  const getSize = () => {
    if (totalCount >= 20) return 'large'
    if (totalCount >= 10) return 'medium'
    return 'small'
  }

  const size = getSize()

  const sizeStyles = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-1 md:col-span-2',
    large: 'col-span-2 row-span-1 md:col-span-2 md:row-span-2'
  }

  const bgColors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-orange-500 to-orange-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
  ]

  const bgColor = bgColors[keyword.length % bgColors.length]

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300',
        'bg-gradient-to-br shadow-lg',
        bgColor,
        sizeStyles[size],
        isHovered && 'scale-[1.02] shadow-xl z-10',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
      </div>

      {/* 콘텐츠 */}
      <div className={cn(
        'relative h-full p-4 flex flex-col justify-between text-white',
        size === 'large' ? 'p-6' : 'p-4'
      )}>
        {/* 상단: 배지들 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {isFixed && (
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                고정
              </Badge>
            )}
            {isRecommended && (
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                추천
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                {category}
              </Badge>
            )}
          </div>

          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' && 'bg-green-400/30 text-green-100',
              trend === 'down' && 'bg-red-400/30 text-red-100',
              trend === 'stable' && 'bg-gray-400/30 text-gray-100',
              trend === 'new' && 'bg-yellow-400/30 text-yellow-100'
            )}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'new' && 'NEW'}
              {trend === 'up' && '상승'}
            </div>
          )}
        </div>

        {/* 중앙: 키워드 */}
        <div className="flex-1 flex items-center justify-center py-4">
          <h3 className={cn(
            'font-bold text-center leading-tight',
            size === 'large' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
          )}>
            {keyword}
          </h3>
        </div>

        {/* 하단: 통계 */}
        <div className="flex items-center justify-between text-white/80 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalCount}명
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {likeCount}
            </span>
          </div>
        </div>
      </div>

      {/* 호버 효과 */}
      <div className={cn(
        'absolute inset-0 bg-black/10 transition-opacity',
        isHovered ? 'opacity-100' : 'opacity-0'
      )} />
    </div>
  )
}
