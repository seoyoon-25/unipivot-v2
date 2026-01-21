'use client'

import { useState, useEffect } from 'react'
import { Award, Star, Flame, BookOpen, Mic, Trophy } from 'lucide-react'
import { getUserBadges, getAllBadges } from '@/lib/actions/badges'

interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: string
}

interface UserBadge {
  id: string
  earnedAt: Date
  badge: Badge
}

interface Props {
  userId?: string
  showAll?: boolean
}

const categoryIcons: Record<string, typeof Award> = {
  ATTENDANCE: Flame,
  FACILITATOR: Mic,
  REPORT: BookOpen,
  SPEAKING: Mic,
  READING: BookOpen,
  LEVEL: Star,
  SPECIAL: Trophy
}

const categoryColors: Record<string, string> = {
  ATTENDANCE: 'bg-orange-100 text-orange-700 border-orange-300',
  FACILITATOR: 'bg-purple-100 text-purple-700 border-purple-300',
  REPORT: 'bg-blue-100 text-blue-700 border-blue-300',
  SPEAKING: 'bg-green-100 text-green-700 border-green-300',
  READING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  LEVEL: 'bg-pink-100 text-pink-700 border-pink-300',
  SPECIAL: 'bg-amber-100 text-amber-700 border-amber-300'
}

export default function BadgeDisplay({ userId, showAll = false }: Props) {
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([])
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadBadges()
  }, [userId])

  const loadBadges = async () => {
    setLoading(true)
    try {
      const [earned, all] = await Promise.all([
        getUserBadges(userId),
        showAll ? getAllBadges() : Promise.resolve([])
      ])

      setEarnedBadges(earned)
      setAllBadges(all)
    } catch (error) {
      console.error('배지 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const earnedBadgeCodes = new Set(earnedBadges.map(ub => ub.badge.code))

  const categories = showAll
    ? Array.from(new Set(allBadges.map(b => b.category)))
    : Array.from(new Set(earnedBadges.map(ub => ub.badge.category)))

  const filteredBadges = showAll
    ? allBadges.filter(b => !selectedCategory || b.category === selectedCategory)
    : earnedBadges
        .filter(ub => !selectedCategory || ub.badge.category === selectedCategory)
        .map(ub => ub.badge)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {categories.map(cat => {
          const Icon = categoryIcons[cat] || Award
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat}
            </button>
          )
        })}
      </div>

      {/* 배지 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredBadges.map(badge => {
          const isEarned = earnedBadgeCodes.has(badge.code)
          const Icon = categoryIcons[badge.category] || Award

          return (
            <div
              key={badge.code}
              className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                isEarned
                  ? categoryColors[badge.category] || 'bg-gray-100 text-gray-700 border-gray-300'
                  : 'bg-gray-50 text-gray-400 border-gray-200 opacity-50'
              }`}
            >
              {/* 배지 아이콘 */}
              <div className="text-4xl mb-2">{badge.icon}</div>

              {/* 배지 이름 */}
              <h4 className="font-bold text-sm mb-1">{badge.name}</h4>

              {/* 설명 */}
              <p className="text-xs opacity-80">{badge.description}</p>

              {/* 획득 마크 */}
              {isEarned && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>아직 획득한 배지가 없습니다</p>
          <p className="text-sm mt-1">활동을 통해 배지를 획득해보세요!</p>
        </div>
      )}

      {/* 통계 요약 */}
      {showAll && (
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {earnedBadges.length}
            </p>
            <p className="text-sm text-gray-600">획득한 배지</p>
          </div>
          <div className="w-px h-10 bg-gray-300"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">
              {allBadges.length - earnedBadges.length}
            </p>
            <p className="text-sm text-gray-600">미획득 배지</p>
          </div>
          <div className="w-px h-10 bg-gray-300"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {allBadges.length > 0
                ? Math.round((earnedBadges.length / allBadges.length) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-gray-600">달성률</p>
          </div>
        </div>
      )}
    </div>
  )
}
