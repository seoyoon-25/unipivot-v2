'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  User,
  Star,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'
import { getUserProfile } from '@/lib/actions/badges'

interface UserProfile {
  id: string
  userId: string
  xp: number
  level: number
  totalPrograms: number
  totalBooks: number
  totalFacilitated: number
  attendanceRate: number
  reportRate: number
  averageSpeakingTime: number
  updatedAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
}

interface Props {
  userId?: string
}

export default function UserProfileCard({ userId }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await getUserProfile(userId)
      setProfile(data)
    } catch (error) {
      console.error('프로필 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
        <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>프로필을 찾을 수 없습니다</p>
      </div>
    )
  }

  // XP 진행률 계산
  const currentLevelXp = Array.from({ length: profile.level - 1 }, (_, i) => (i + 1) * 100).reduce(
    (sum, xp) => sum + xp,
    0
  )
  const nextLevelXp = profile.level * 100
  const progressXp = profile.xp - currentLevelXp
  const progressPercent = Math.min(100, Math.round((progressXp / nextLevelXp) * 100))

  const stats = [
    {
      icon: Calendar,
      label: '참여 프로그램',
      value: profile.totalPrograms,
      color: 'text-blue-600'
    },
    {
      icon: BookOpen,
      label: '읽은 책',
      value: profile.totalBooks,
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      label: '출석률',
      value: `${profile.attendanceRate}%`,
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      label: '평균 발언',
      value: `${Math.floor(profile.averageSpeakingTime / 60)}분`,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden">
      {/* 상단 프로필 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          {/* 프로필 이미지 */}
          <div className="relative">
            {profile.user.image ? (
              <Image
                src={profile.user.image}
                alt={profile.user.name || ''}
                width={80}
                height={80}
                className="rounded-full border-4 border-white/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                <User className="w-10 h-10 text-white/80" />
              </div>
            )}
            {/* 레벨 배지 */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm border-2 border-white shadow-md">
              {profile.level}
            </div>
          </div>

          {/* 이름 및 레벨 */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.user.name || '익명'}</h2>
            <div className="flex items-center gap-2 mt-1 text-white/80">
              <Star className="w-4 h-4" />
              <span>레벨 {profile.level} 독서인</span>
            </div>
          </div>
        </div>

        {/* XP 프로그레스 */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>경험치</span>
            <span>
              {progressXp} / {nextLevelXp} XP
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1 text-white/70">
            다음 레벨까지 {nextLevelXp - progressXp} XP 필요
          </p>
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          활동 통계
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* 총 XP */}
        <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 text-center">
          <p className="text-sm text-orange-700 mb-1">총 획득 경험치</p>
          <p className="text-3xl font-bold text-orange-600">{profile.xp} XP</p>
        </div>
      </div>
    </div>
  )
}
