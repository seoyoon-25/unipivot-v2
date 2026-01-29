'use client'

import { useState } from 'react'
import { Trash2, Image, Lock, Globe } from 'lucide-react'
import { deleteQuote } from '@/app/club/bookclub/quotes/actions'

interface QuoteCardProps {
  quote: {
    id: string
    bookTitle: string
    bookAuthor?: string | null
    content: string
    page?: number | null
    memo?: string | null
    isPublic: boolean
    createdAt: Date
    user: { id: string; name: string | null }
    isOwner?: boolean
  }
  onDelete?: (id: string) => void
  onGenerateImage?: (quote: QuoteCardProps['quote']) => void
}

export default function QuoteCard({ quote, onDelete, onGenerateImage }: QuoteCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('이 명문장을 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      await deleteQuote(quote.id)
      onDelete?.(quote.id)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-xs text-gray-500 flex items-center gap-1.5">
          <span className="font-medium text-gray-700">{quote.bookTitle}</span>
          {quote.bookAuthor && <span>· {quote.bookAuthor}</span>}
          {quote.page && <span>· p.{quote.page}</span>}
        </div>
        {quote.isPublic ? (
          <Globe className="w-3.5 h-3.5 text-green-500 shrink-0" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        )}
      </div>

      <blockquote className="text-gray-800 text-sm leading-relaxed border-l-3 border-blue-300 pl-3 mb-3 italic">
        &ldquo;{quote.content}&rdquo;
      </blockquote>

      {quote.memo && (
        <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg p-2">
          {quote.memo}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span>{quote.user.name}</span>
          <span>
            {new Date(quote.createdAt).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onGenerateImage && (
            <button
              onClick={() => onGenerateImage(quote)}
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
              title="이미지 생성"
            >
              <Image className="w-4 h-4" />
            </button>
          )}
          {quote.isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
