'use client'

import { useState, useTransition } from 'react'
import { Bookmark, BookmarkCheck, CheckCircle, Trash2 } from 'lucide-react'
import { toggleSaveRecommendation, toggleReadRecommendation, deleteRecommendation } from '@/app/club/recommendations/actions'

interface Props {
  recommendation: {
    id: string
    bookTitle: string
    bookAuthor: string | null
    reason: string
    isSaved: boolean
    isRead: boolean
    createdAt: Date
  }
}

export default function RecommendationCard({ recommendation }: Props) {
  const [saved, setSaved] = useState(recommendation.isSaved)
  const [read, setRead] = useState(recommendation.isRead)
  const [deleted, setDeleted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await toggleSaveRecommendation(recommendation.id)
      if (result.success) setSaved(result.isSaved!)
    })
  }

  const handleRead = () => {
    startTransition(async () => {
      const result = await toggleReadRecommendation(recommendation.id)
      if (result.success) setRead(result.isRead!)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRecommendation(recommendation.id)
      if (result.success) setDeleted(true)
    })
  }

  if (deleted) return null

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all ${
        read ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{recommendation.bookTitle}</h3>
          {recommendation.bookAuthor && (
            <p className="text-sm text-gray-500">{recommendation.bookAuthor}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
            }`}
            aria-label={saved ? '저장 취소' : '저장'}
          >
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRead}
            disabled={isPending}
            className={`p-1.5 rounded-lg transition-colors ${
              read
                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'
            }`}
            aria-label={read ? '읽음 취소' : '읽음 표시'}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
            aria-label="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{recommendation.reason}</p>

      <div className="flex items-center gap-2 mt-3">
        {read && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            읽음
          </span>
        )}
        {saved && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            저장됨
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(recommendation.createdAt).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  )
}
