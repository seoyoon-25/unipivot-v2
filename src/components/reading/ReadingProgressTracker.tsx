'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Target,
  Calendar,
  TrendingUp,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import {
  updateReadingProgress,
  getReadingProgress,
  getReadingGoal
} from '@/lib/actions/reading-helper'

interface ReadingGoal {
  currentPage: number
  totalPages: number
  remainingPages: number
  daysUntilSession: number
  dailyGoal: number
  percentage: number
}

interface Props {
  sessionId: string
  initialTotalPages?: number
}

export default function ReadingProgressTracker({
  sessionId,
  initialTotalPages = 0
}: Props) {
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [goal, setGoal] = useState<ReadingGoal | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadProgress()
  }, [sessionId])

  const loadProgress = async () => {
    setLoading(true)
    try {
      const [progress, goalData] = await Promise.all([
        getReadingProgress(sessionId),
        getReadingGoal(sessionId)
      ])

      if (progress) {
        setCurrentPage(progress.currentPage)
        setTotalPages(progress.totalPages)
      }
      setGoal(goalData)
    } catch (error) {
      console.error('진도 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (totalPages <= 0) return

    setSaving(true)
    try {
      await updateReadingProgress(sessionId, currentPage, totalPages)
      await loadProgress()
    } catch (error) {
      console.error('진도 저장 오류:', error)
    } finally {
      setSaving(false)
    }
  }

  const incrementPage = (amount: number) => {
    const newPage = Math.max(0, Math.min(totalPages, currentPage + amount))
    setCurrentPage(newPage)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0
  const isOnTrack = goal ? currentPage >= goal.currentPage - (goal.dailyGoal * 2) : true

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5" />
          읽기 진도
        </h3>

        {/* 진행률 바 */}
        <div className="relative">
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>{currentPage}쪽</span>
            <span className="font-bold">{percentage}%</span>
            <span>{totalPages}쪽</span>
          </div>
        </div>
      </div>

      {/* 컨트롤 영역 */}
      <div className="p-6">
        {/* 페이지 입력 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => incrementPage(-10)}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-gray-600"
          >
            -10
          </button>
          <button
            onClick={() => incrementPage(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="text-center">
            <input
              type="number"
              value={currentPage}
              onChange={e =>
                setCurrentPage(
                  Math.max(0, Math.min(totalPages, parseInt(e.target.value) || 0))
                )
              }
              className="w-20 text-3xl font-bold text-center border-b-2 border-blue-500 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">현재 페이지</p>
          </div>

          <button
            onClick={() => incrementPage(1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => incrementPage(10)}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-gray-600"
          >
            +10
          </button>
        </div>

        {/* 총 페이지 설정 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-sm text-gray-600">총</span>
          <input
            type="number"
            value={totalPages}
            onChange={e => setTotalPages(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center border rounded-lg px-2 py-1"
          />
          <span className="text-sm text-gray-600">쪽</span>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? '저장 중...' : '진도 저장하기'}
        </button>

        {/* 목표 세부 정보 */}
        {goal && (
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-sm text-gray-600 mb-3"
            >
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                읽기 목표
              </span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showDetails && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    모임까지
                  </span>
                  <span className="font-bold text-gray-900">
                    {goal.daysUntilSession}일
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    남은 페이지
                  </span>
                  <span className="font-bold text-gray-900">
                    {goal.remainingPages}쪽
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Target className="w-4 h-4" />
                    일일 목표
                  </span>
                  <span
                    className={`font-bold ${
                      isOnTrack ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {goal.dailyGoal}쪽/일
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    isOnTrack
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {isOnTrack
                      ? '잘 하고 있어요! 이대로 유지하세요 💪'
                      : '조금 더 분발해볼까요? 화이팅! 🔥'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
