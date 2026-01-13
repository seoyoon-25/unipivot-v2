'use client'

import { useState, useEffect } from 'react'
import { Hash, TrendingUp, Star, Sparkles } from 'lucide-react'

interface Keyword {
  id: string
  keyword: string
  category?: string
  monthlyCount: number
  isFixed: boolean
  isRecommended: boolean
}

interface QuickSelectButtonsProps {
  onSelect: (keyword: string) => void
  className?: string
}

export function QuickSelectButtons({ onSelect, className = '' }: QuickSelectButtonsProps) {
  const [keywords, setKeywords] = useState<{
    fixed: Keyword[]
    recommended: Keyword[]
    popular: Keyword[]
  }>({
    fixed: [],
    recommended: [],
    popular: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'fixed' | 'recommended' | 'popular'>('fixed')

  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    try {
      const [fixedRes, recommendedRes, popularRes] = await Promise.all([
        fetch('/api/interests/keywords?type=fixed&limit=10'),
        fetch('/api/interests/keywords?type=recommended&limit=10'),
        fetch('/api/interests/keywords?type=popular&limit=10'),
      ])

      const [fixedData, recommendedData, popularData] = await Promise.all([
        fixedRes.json(),
        recommendedRes.json(),
        popularRes.json(),
      ])

      setKeywords({
        fixed: fixedData.keywords || [],
        recommended: recommendedData.keywords?.filter((k: Keyword) => !k.isFixed) || [],
        popular: popularData.keywords?.filter((k: Keyword) => !k.isFixed && !k.isRecommended) || [],
      })
    } catch (error) {
      console.error('Failed to fetch keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'fixed' as const, label: '고정 키워드', icon: Hash },
    { key: 'recommended' as const, label: '추천', icon: Star },
    { key: 'popular' as const, label: '인기', icon: TrendingUp },
  ]

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-4 ${className}`}>
        <div className="flex gap-2 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const currentKeywords = keywords[activeTab]

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      {/* 탭 */}
      <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 키워드 버튼들 */}
      <div className="flex flex-wrap gap-2">
        {currentKeywords.length > 0 ? (
          currentKeywords.map(kw => (
            <button
              key={kw.id}
              onClick={() => onSelect(kw.keyword)}
              className="group relative flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-primary hover:text-white rounded-full text-sm font-medium text-gray-700 transition-all duration-200"
            >
              <span>{kw.keyword}</span>
              {kw.monthlyCount > 0 && (
                <span className="text-xs opacity-60">
                  ({kw.monthlyCount})
                </span>
              )}
              {kw.isFixed && (
                <Sparkles className="w-3 h-3 text-yellow-500 group-hover:text-yellow-300" />
              )}
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-400">
            {activeTab === 'popular' ? '아직 인기 키워드가 없습니다' : '키워드가 없습니다'}
          </p>
        )}
      </div>

      {activeTab === 'fixed' && (
        <p className="text-xs text-gray-400 mt-3">
          유니피벗에서 제공하는 주요 관심 분야입니다
        </p>
      )}
    </div>
  )
}
