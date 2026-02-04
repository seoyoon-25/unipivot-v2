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
    <div className="club-card p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-xs text-zinc-500 flex items-center gap-1.5">
          <span className="font-medium text-zinc-700">{quote.bookTitle}</span>
          {quote.bookAuthor && <span>· {quote.bookAuthor}</span>}
          {quote.page && <span>· p.{quote.page}</span>}
        </div>
        {quote.isPublic ? (
          <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        )}
      </div>

      <blockquote className="text-zinc-800 text-sm leading-relaxed border-l-3 border-blue-300 pl-3 mb-3 italic">
        &ldquo;{quote.content}&rdquo;
      </blockquote>

      {quote.memo && (
        <p className="text-xs text-zinc-500 mb-3 bg-zinc-50 rounded-xl p-2">
          {quote.memo}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
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
              className="p-1.5 text-zinc-400 hover:text-blue-600 rounded-lg hover:bg-zinc-50 transition-colors duration-200"
              title="이미지 생성"
            >
              <Image className="w-4 h-4" />
            </button>
          )}
          {quote.isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-50 transition-colors duration-200 disabled:opacity-50"
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
