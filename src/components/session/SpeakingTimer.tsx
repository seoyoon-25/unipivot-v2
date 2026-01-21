'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, BarChart3 } from 'lucide-react'
import {
  toggleSpeakingTimer,
  updateSpeakingDuration,
  resetAllTimers,
  getSessionSpeakingTimes,
  calculateSpeakingStats
} from '@/lib/actions/speaking-timer'

interface Participant {
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface SpeakingTimeData {
  id: string
  userId: string
  duration: number
  isActive: boolean
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Props {
  sessionId: string
  participants: Participant[]
}

export default function SpeakingTimer({ sessionId, participants }: Props) {
  const [speakingTimes, setSpeakingTimes] = useState<SpeakingTimeData[]>([])
  const [localTimers, setLocalTimers] = useState<Record<string, number>>({})
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 초기 데이터 로드
  useEffect(() => {
    loadSpeakingTimes()
  }, [sessionId])

  // 타이머 인터벌
  useEffect(() => {
    if (activeUserId) {
      intervalRef.current = setInterval(() => {
        setLocalTimers(prev => ({
          ...prev,
          [activeUserId]: (prev[activeUserId] || 0) + 1
        }))
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeUserId])

  // 활성 사용자 변경 시 이전 타이머 저장
  useEffect(() => {
    const prevActiveUser = speakingTimes.find(st => st.isActive)
    if (prevActiveUser && localTimers[prevActiveUser.userId]) {
      updateSpeakingDuration(
        sessionId,
        prevActiveUser.userId,
        localTimers[prevActiveUser.userId]
      )
    }
  }, [activeUserId])

  const loadSpeakingTimes = async () => {
    const times = await getSessionSpeakingTimes(sessionId)
    setSpeakingTimes(times)

    // 로컬 타이머 초기화
    const timers: Record<string, number> = {}
    times.forEach((st: SpeakingTimeData) => {
      timers[st.userId] = st.duration
      if (st.isActive) {
        setActiveUserId(st.userId)
      }
    })
    setLocalTimers(timers)
  }

  const handleToggle = async (userId: string) => {
    // 현재 활성 사용자의 시간 저장
    if (activeUserId && localTimers[activeUserId]) {
      await updateSpeakingDuration(sessionId, activeUserId, localTimers[activeUserId])
    }

    const result = await toggleSpeakingTimer(sessionId, userId)

    if (result.isActive) {
      setActiveUserId(userId)
    } else {
      setActiveUserId(null)
    }

    await loadSpeakingTimes()
  }

  const handleReset = async () => {
    if (confirm('모든 타이머를 리셋하시겠습니까?')) {
      await resetAllTimers(sessionId)
      setLocalTimers({})
      setActiveUserId(null)
      await loadSpeakingTimes()
    }
  }

  const handleCalculateStats = async () => {
    // 현재 활성 타이머 저장
    if (activeUserId && localTimers[activeUserId]) {
      await updateSpeakingDuration(sessionId, activeUserId, localTimers[activeUserId])
    }

    await calculateSpeakingStats(sessionId)
    alert('통계가 업데이트되었습니다.')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 모든 참가자에 대한 타이머 데이터 생성
  const allParticipants = participants.map(p => {
    const existing = speakingTimes.find(st => st.userId === p.userId)
    const duration = localTimers[p.userId] || existing?.duration || 0
    return {
      userId: p.userId,
      user: p.user,
      duration,
      isActive: activeUserId === p.userId
    }
  })

  // 총 발언 시간
  const totalTime = Object.values(localTimers).reduce((sum, t) => sum + t, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span>&#128483;</span> 발언 타이머
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCalculateStats}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            통계 업데이트
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            전체 리셋
          </button>
        </div>
      </div>

      {/* 총 발언 시간 */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">총 발언 시간</p>
        <p className="text-3xl font-bold">{formatTime(totalTime)}</p>
      </div>

      {/* 참가자별 타이머 */}
      <div className="grid gap-3">
        {allParticipants.map(participant => {
          const percentage = totalTime > 0
            ? Math.round((participant.duration / totalTime) * 100)
            : 0

          return (
            <div
              key={participant.userId}
              className={`
                flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                ${participant.isActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
                }
              `}
            >
              {/* 아바타 */}
              <div className="relative">
                {participant.user.image ? (
                  <img
                    src={participant.user.image}
                    alt={participant.user.name || ''}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {participant.user.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                {participant.isActive && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* 이름 및 진행바 */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {participant.user.name || '알 수 없음'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      participant.isActive ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* 시간 */}
              <div className="text-right min-w-[80px]">
                <span className={`text-xl font-mono ${
                  participant.isActive ? 'text-green-600' : 'text-gray-700'
                }`}>
                  {formatTime(participant.duration)}
                </span>
              </div>

              {/* 토글 버튼 */}
              <button
                onClick={() => handleToggle(participant.userId)}
                className={`
                  p-3 rounded-full transition-colors
                  ${participant.isActive
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {participant.isActive ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
