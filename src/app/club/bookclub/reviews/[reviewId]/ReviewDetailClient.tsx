'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, MessageCircle, Edit, Globe, Lock, Send } from 'lucide-react'
import { toggleReviewLike, addReviewComment } from '@/lib/actions/review'

interface ReviewDetailClientProps {
  review: {
    id: string
    title: string
    content: string
    bookTitle: string
    bookAuthor?: string | null
    visibility: string
    status: string
    likeCount: number
    viewCount: number
    createdAt: string
    user: { id: string; name: string | null; email: string | null }
    session?: {
      sessionNo: number
      title: string | null
      date: string | null
    } | null
    program?: { id: string; title: string } | null
    comments: {
      id: string
      content: string
      createdAt: string
      author: { id: string; name: string | null }
    }[]
    hasLiked: boolean
    isOwner: boolean
    structuredData?: {
      structure: string
      sections: Record<string, unknown>
    } | null
    structureInfo?: { name: string; icon: string; color: string } | null
    likeCountFromRelation: number
  }
}

export default function ReviewDetailClient({ review }: ReviewDetailClientProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(review.hasLiked)
  const [likeCount, setLikeCount] = useState(review.likeCount)
  const [comments, setComments] = useState(review.comments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLike = async () => {
    try {
      const result = await toggleReviewLike(review.id)
      setLiked(result.liked)
      setLikeCount((prev) => prev + (result.liked ? 1 : -1))
    } catch {
      // ignore
    }
  }

  const handleComment = async () => {
    if (!newComment.trim() || submitting) return
    setSubmitting(true)
    try {
      const comment = await addReviewComment(review.id, newComment)
      setComments((prev) => [
        ...prev,
        {
          id: comment.id,
          content: comment.content,
          createdAt: new Date().toISOString(),
          author: { id: comment.user.id, name: comment.user.name },
        },
      ])
      setNewComment('')
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Back */}
      <Link
        href="/club/bookclub/reviews"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        소감 목록
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{review.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <span>{review.bookTitle}</span>
              {review.bookAuthor && (
                <>
                  <span>·</span>
                  <span>{review.bookAuthor}</span>
                </>
              )}
              {review.session && (
                <>
                  <span>·</span>
                  <span>{review.session.sessionNo}회차</span>
                </>
              )}
            </div>
          </div>
          {review.structureInfo && (
            <span className={`text-xs px-2 py-1 rounded ${review.structureInfo.color}`}>
              {review.structureInfo.icon} {review.structureInfo.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span>{review.user.name}</span>
          <span>
            {new Date(review.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {review.visibility === 'PRIVATE' ? (
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> 비공개
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> 공개
            </span>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
          {review.content}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageCircle className="w-5 h-5" />
              {comments.length}
            </span>
          </div>
          {review.isOwner && (
            <Link
              href={`/club/bookclub/reviews/write?edit=${review.id}`}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
              수정
            </Link>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          댓글 {comments.length > 0 && `(${comments.length})`}
        </h3>

        {comments.length > 0 ? (
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-50 pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{comment.author.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">첫 번째 댓글을 남겨보세요</p>
        )}

        {/* New Comment */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="댓글을 입력하세요"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleComment}
            disabled={!newComment.trim() || submitting}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
