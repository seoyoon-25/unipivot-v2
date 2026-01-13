'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Crown, Heart } from 'lucide-react'

interface TopKeyword {
  id: string
  keyword: string
  category?: string
  rank: number
  count: number
  likeCount: number
  trend: 'up' | 'down' | 'stable' | 'new'
}

interface TopInterestsProps {
  onKeywordClick?: (keyword: string) => void
  className?: string
}

export function TopInterests({ onKeywordClick, className = '' }: TopInterestsProps) {
  const [keywords, setKeywords] = useState<TopKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'monthly' | 'all'>('monthly')

  useEffect(() => {
    fetchTopKeywords()
  }, [period])

  const fetchTopKeywords = async () => {
    try {
      const res = await fetch(`/api/interests/top?period=${period}&limit=5`)
      const data = await res.json()
      setKeywords(data.keywords || [])
    } catch (error) {
      console.error('Failed to fetch top keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'new':
        return <span className="text-xs font-bold text-blue-500">NEW</span>
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-gray-900">인기 관심사 TOP 5</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              period === 'monthly'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            이번달
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              period === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
        </div>
      </div>

      {/* 랭킹 리스트 */}
      {keywords.length > 0 ? (
        <div className="space-y-2">
          {keywords.map((kw) => (
            <button
              key={kw.id}
              onClick={() => onKeywordClick?.(kw.keyword)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              {/* 순위 */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${getRankStyle(kw.rank)}`}
              >
                {kw.rank}
              </div>

              {/* 키워드 정보 */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {kw.keyword}
                  </span>
                  {kw.category && (
                    <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                      {kw.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span>{kw.count}회 언급</span>
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-3 h-3" />
                    {kw.likeCount}
                  </span>
                </div>
              </div>

              {/* 트렌드 */}
              <div className="flex items-center">
                {getTrendIcon(kw.trend)}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>아직 순위 데이터가 없습니다</p>
        </div>
      )}
    </div>
  )
}
