'use client'

import Link from 'next/link'
import { Heart, MessageCircle, Eye, Lock, Globe, Star } from 'lucide-react'
import { getStructureInfo } from '@/types/report'
import type { ReportStructureCode } from '@/types/report'

interface ReviewCardProps {
  review: {
    id: string
    title: string
    content: string
    bookTitle: string
    bookAuthor?: string | null
    visibility: string
    status: string
    rating?: number | null
    likeCount: number
    createdAt: Date
    author?: {
      id: string
      name: string | null
    }
    session?: {
      id: string
      sessionNo: number
      title: string | null
      bookTitle?: string | null
    } | null
    program?: {
      id: string
      title: string
    } | null
    hasStructuredData?: boolean
    structureCode?: string | null
    commentCount: number
    isOwner?: boolean
  }
  showAuthor?: boolean
}

export default function ReviewCard({ review, showAuthor = true }: ReviewCardProps) {
  const structureInfo = review.structureCode
    ? getStructureInfo(review.structureCode as ReportStructureCode)
    : null

  const excerpt = review.content.length > 150
    ? review.content.substring(0, 150) + '...'
    : review.content

  return (
    <Link
      href={`/club/bookclub/reviews/${review.id}`}
      className="block club-card club-card-hover p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-zinc-900 line-clamp-1 flex-1">
          {review.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {review.visibility === 'PRIVATE' ? (
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
          )}
          {structureInfo && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${structureInfo.color}`}>
              {structureInfo.icon} {structureInfo.name}
            </span>
          )}
        </div>
      </div>

      <div className="text-xs text-zinc-500 mb-2 flex items-center gap-2">
        <span>{review.bookTitle}</span>
        {review.rating && (
          <>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3 h-3 fill-current" />
              {review.rating}
            </span>
          </>
        )}
        {review.session && (
          <>
            <span>·</span>
            <span>{review.session.sessionNo}회차</span>
          </>
        )}
        {review.program && (
          <>
            <span>·</span>
            <span className="truncate max-w-[120px]">{review.program.title}</span>
          </>
        )}
      </div>

      <p className="text-sm text-zinc-700 leading-relaxed mb-3 line-clamp-3">{excerpt}</p>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          {showAuthor && review.author && (
            <span className="text-zinc-500">{review.author.name}</span>
          )}
          <span>
            {new Date(review.createdAt).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {review.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {review.commentCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
