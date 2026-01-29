'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, RotateCcw, Save, User } from 'lucide-react'
import { saveSpeakingTimes } from '@/app/club/(facilitator)/facilitator/timer/actions'

interface Participant {
  userId: string
  name: string | null
}

interface SpeakingTimerProps {
  sessionId: string
  participants: Participant[]
}

export default function SpeakingTimer({ sessionId, participants }: SpeakingTimerProps) {
  const [times, setTimes] = useState<Record<string, number>>(
    Object.fromEntries(participants.map((p) => [p.userId, 0]))
  )
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(
    (userId: string) => {
      if (activeUserId === userId && isRunning) {
        // Pause
        setIsRunning(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }

      // Switch or start
      setActiveUserId(userId)
      setIsRunning(true)

      if (intervalRef.current) clearInterval(intervalRef.current)

      intervalRef.current = setInterval(() => {
        setTimes((prev) => ({
          ...prev,
          [userId]: (prev[userId] || 0) + 1,
        }))
      }, 1000)
    },
    [activeUserId, isRunning]
  )

  const pauseAll = () => {
    setIsRunning(false)
    setActiveUserId(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const resetAll = () => {
    if (!confirm('모든 타이머를 초기화하시겠습니까?')) return
    pauseAll()
    setTimes(Object.fromEntries(participants.map((p) => [p.userId, 0])))
    setSaved(false)
  }

  const handleSave = async () => {
    pauseAll()
    setSaving(true)
    try {
      await saveSpeakingTimes({
        sessionId,
        times: participants.map((p) => ({
          userId: p.userId,
          duration: times[p.userId] || 0,
        })),
      })
      setSaved(true)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const totalTime = Object.values(times).reduce((a, b) => a + b, 0)
  const maxTime = Math.max(...Object.values(times), 1)

  return (
    <div className="space-y-4">
      {/* Global controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={pauseAll}
          disabled={!isRunning}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm"
        >
          <Pause className="w-4 h-4" />
          일시정지
        </button>
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          초기화
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving || totalTime === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          <Save className="w-4 h-4" />
          {saving ? '저장 중...' : saved ? '저장됨' : '결과 저장'}
        </button>
      </div>

      {/* Total time */}
      <div className="text-center text-sm text-gray-500">
        총 발언 시간: <span className="font-mono font-medium text-gray-900">{formatTime(totalTime)}</span>
      </div>

      {/* Participant timers */}
      <div className="space-y-2">
        {participants.map((p) => {
          const time = times[p.userId] || 0
          const isActive = activeUserId === p.userId && isRunning
          const barWidth = maxTime > 0 ? (time / maxTime) * 100 : 0

          return (
            <button
              key={p.userId}
              onClick={() => startTimer(p.userId)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-full ${
                      isActive ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  >
                    <User className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <span className="font-medium text-gray-900">{p.name || '이름 없음'}</span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      발언 중
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold text-gray-900">
                    {formatTime(time)}
                  </span>
                  {isActive ? (
                    <Pause className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Play className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              {/* Bar chart */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActive ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {participants.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          참가자가 없습니다
        </div>
      )}
    </div>
  )
}
