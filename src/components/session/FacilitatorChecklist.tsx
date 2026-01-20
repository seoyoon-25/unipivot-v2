'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, Circle, BookOpen, MessageSquare, Clock, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toggleChecklistItem } from '@/lib/actions/facilitator-checklist'
import type { ChecklistItem } from '@/types/facilitator'

interface FacilitatorChecklistProps {
  facilitatorId: string
  userId: string
  items: ChecklistItem[]
  completedItems: string[]
  progress: number
  isRequired: boolean
  sessionDate: Date
  className?: string
}

const CATEGORY_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  preparation: {
    label: '사전 준비',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-50',
  },
  content: {
    label: '콘텐츠',
    icon: <FileText className="w-4 h-4" />,
    color: 'text-purple-600 bg-purple-50',
  },
  planning: {
    label: '진행 계획',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-green-600 bg-green-50',
  },
  materials: {
    label: '자료',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-orange-600 bg-orange-50',
  },
}

export function FacilitatorChecklist({
  facilitatorId,
  userId,
  items,
  completedItems,
  progress,
  isRequired,
  sessionDate,
  className,
}: FacilitatorChecklistProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [localCompleted, setLocalCompleted] = useState<string[]>(completedItems)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async (itemId: string) => {
    setLoading(itemId)
    setError(null)

    // Optimistic update
    const newCompleted = localCompleted.includes(itemId)
      ? localCompleted.filter(id => id !== itemId)
      : [...localCompleted, itemId]
    setLocalCompleted(newCompleted)

    try {
      await toggleChecklistItem(facilitatorId, itemId, userId)
    } catch (err) {
      // Rollback on error
      setLocalCompleted(localCompleted)
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  // 카테고리별로 그룹화
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'preparation'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  // 진행률 계산 (필수 항목 기준)
  const requiredItems = items.filter(item => !item.optional)
  const completedRequired = requiredItems.filter(item => localCompleted.includes(item.id)).length
  const currentProgress = requiredItems.length > 0
    ? Math.round((completedRequired / requiredItems.length) * 100)
    : 0

  // 남은 시간 계산
  const now = new Date()
  const daysUntilSession = Math.ceil((new Date(sessionDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className={cn('bg-white rounded-lg border p-6 space-y-6', className)}>
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            진행자 체크리스트
            {isRequired && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">필수</span>
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {daysUntilSession > 0
              ? `모임까지 ${daysUntilSession}일 남았습니다`
              : daysUntilSession === 0
                ? '오늘 모임입니다!'
                : '모임이 종료되었습니다'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{currentProgress}%</div>
          <div className="text-xs text-gray-500">
            {completedRequired}/{requiredItems.length} 완료
          </div>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="relative">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              currentProgress === 100
                ? 'bg-green-500'
                : currentProgress >= 50
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
            )}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
        {currentProgress === 100 && (
          <div className="absolute -right-1 -top-1">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>

      {/* 카테고리별 체크리스트 */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const info = CATEGORY_INFO[category] || CATEGORY_INFO.preparation
          const categoryCompleted = categoryItems.filter(item => localCompleted.includes(item.id)).length

          return (
            <div key={category} className="space-y-2">
              <div className={cn('flex items-center gap-2 px-2 py-1 rounded-lg', info.color)}>
                {info.icon}
                <span className="text-sm font-medium">{info.label}</span>
                <span className="text-xs ml-auto">
                  {categoryCompleted}/{categoryItems.length}
                </span>
              </div>

              <div className="space-y-1 pl-2">
                {categoryItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const isCompleted = localCompleted.includes(item.id)
                    const isLoading = loading === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        disabled={isLoading}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                          isCompleted
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50',
                          isLoading && 'opacity-50'
                        )}
                      >
                        <div className="flex-shrink-0">
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          ) : isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <span
                          className={cn(
                            'flex-1 text-sm',
                            isCompleted ? 'text-green-800 line-through' : 'text-gray-700'
                          )}
                        >
                          {item.text}
                        </span>
                        {item.optional && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            선택
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 완료 메시지 */}
      {currentProgress === 100 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">준비 완료!</p>
              <p className="text-sm text-green-600">
                모든 필수 항목을 완료했습니다. 멋진 진행 되세요!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
