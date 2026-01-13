'use client'

import { useState, useEffect, useMemo } from 'react'

interface WordCloudItem {
  text: string
  value: number
  category?: string
}

interface WordCloudProps {
  onKeywordClick?: (keyword: string) => void
  className?: string
}

// 색상 팔레트
const colors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
]

export function WordCloud({ onKeywordClick, className = '' }: WordCloudProps) {
  const [words, setWords] = useState<WordCloudItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    try {
      const res = await fetch('/api/interests/keywords?wordcloud=true&limit=50')
      const data = await res.json()
      setWords(data.keywords || [])
    } catch (error) {
      console.error('Failed to fetch wordcloud:', error)
    } finally {
      setLoading(false)
    }
  }

  // 값에 따른 폰트 크기 계산
  const getWordStyle = useMemo(() => {
    if (words.length === 0) return () => ({ fontSize: 16, color: colors[0], opacity: 1 })

    const maxValue = Math.max(...words.map(w => w.value), 1)
    const minValue = Math.min(...words.map(w => w.value), 0)
    const range = maxValue - minValue || 1

    return (word: WordCloudItem, index: number) => {
      const normalized = (word.value - minValue) / range
      const fontSize = Math.max(14, Math.min(48, 14 + normalized * 34))
      const color = colors[index % colors.length]
      const opacity = 0.6 + normalized * 0.4

      return { fontSize, color, opacity }
    }
  }, [words])

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <p className="text-lg font-medium">아직 관심사가 없습니다</p>
          <p className="text-sm mt-1">첫 번째 관심사를 등록해보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-3 min-h-[200px]">
        {words.map((word, index) => {
          const style = getWordStyle(word, index)
          return (
            <button
              key={`${word.text}-${index}`}
              onClick={() => onKeywordClick?.(word.text)}
              className="transition-all duration-200 hover:scale-110 cursor-pointer"
              style={{
                fontSize: `${style.fontSize}px`,
                color: style.color,
                opacity: style.opacity,
                fontWeight: style.fontSize > 24 ? 700 : 500,
              }}
            >
              {word.text}
            </button>
          )
        })}
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">
        클릭하여 상세 정보 보기
      </p>
    </div>
  )
}
