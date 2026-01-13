'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Send, User, Trash2 } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: { id: string; name: string | null; image: string | null }
}

interface Props {
  reportId: string
  initialLikeCount: number
  initialHasLiked: boolean
  isLoggedIn: boolean
  comments: Comment[]
  currentUserId?: string
}

export default function ReportInteraction({
  reportId,
  initialLikeCount,
  initialHasLiked,
  isLoggedIn,
  comments: initialComments,
  currentUserId
}: Props) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [liking, setLiking] = useState(false)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setLiking(true)
    try {
      const res = await fetch(`/api/reports/${reportId}/like`, {
        method: hasLiked ? 'DELETE' : 'POST'
      })

      if (!res.ok) throw new Error('Failed')

      setHasLiked(!hasLiked)
      setLikeCount(prev => hasLiked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLiking(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isLoggedIn) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (!res.ok) throw new Error('Failed')

      const comment = await res.json()
      setComments([comment, ...comments])
      setNewComment('')
      router.refresh()
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/reports/${reportId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed')

      setComments(comments.filter(c => c.id !== commentId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  return (
    <div className="border-t border-gray-100">
      {/* Like Button */}
      <div className="p-6 border-b border-gray-100">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
            hasLiked
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
          좋아요 {likeCount}
        </button>
      </div>

      {/* Comments */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">댓글 {comments.length}</h3>

        {/* Comment Form */}
        {isLoggedIn ? (
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-gray-500 text-sm">
              댓글을 작성하려면{' '}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
              이 필요합니다.
            </p>
          </div>
        )}

        {/* Comment List */}
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">아직 댓글이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  {comment.user.image ? (
                    <img src={comment.user.image} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{comment.user.name}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {currentUserId === comment.user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
