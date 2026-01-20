'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageSquare, Send, Trash2, CornerDownRight } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string
  }
  replies?: Comment[]
}

interface Like {
  id: string
  memberId: string
  member: {
    id: string
    name: string
  }
}

interface Props {
  reportId: string
  likes: Like[]
  comments: Comment[]
  isLiked: boolean
  currentMemberId: string | null
  isLoggedIn: boolean
}

export default function ReportInteractions({
  reportId,
  likes,
  comments,
  isLiked: initialIsLiked,
  currentMemberId,
  isLoggedIn
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(likes.length)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/reports/' + reportId)
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/like`, {
          method: 'POST',
        })

        if (res.ok) {
          const data = await res.json()
          setIsLiked(data.liked)
          setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
        }
      } catch (error) {
        console.error('Like error:', error)
      }
    })
  }

  const handleComment = async () => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/reports/' + reportId)
      return
    }

    if (!newComment.trim()) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newComment })
        })

        if (res.ok) {
          setNewComment('')
          router.refresh()
        }
      } catch (error) {
        console.error('Comment error:', error)
      }
    })
  }

  const handleReply = async (parentId: string) => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/reports/' + reportId)
      return
    }

    if (!replyContent.trim()) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: replyContent, parentId })
        })

        if (res.ok) {
          setReplyContent('')
          setReplyTo(null)
          router.refresh()
        }
      } catch (error) {
        console.error('Reply error:', error)
      }
    })
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/comment/${commentId}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          router.refresh()
        }
      } catch (error) {
        console.error('Delete comment error:', error)
      }
    })
  }

  return (
    <>
      {/* Like & Comment Count */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              isLiked
                ? 'bg-red-50 text-red-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likeCount}</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">{comments.length}</span>
          </div>
        </div>

        {/* Liked users tooltip */}
        {likes.length > 0 && (
          <p className="text-sm text-gray-400">
            {likes.slice(0, 3).map(l => l.member.name).join(', ')}
            {likes.length > 3 && ` 외 ${likes.length - 3}명`}이 좋아합니다
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="px-6 pb-6">
        <h3 className="font-bold text-gray-900 mb-4">댓글 {comments.length}개</h3>

        {/* Comment Input */}
        {isLoggedIn ? (
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium flex-shrink-0">
              ?
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성하세요..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleComment}
                  disabled={isPending || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  작성
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-gray-500 mb-2">댓글을 작성하려면 로그인이 필요합니다</p>
            <Link
              href={`/login?redirect=/reports/${reportId}`}
              className="text-primary font-medium hover:underline"
            >
              로그인하기
            </Link>
          </div>
        )}

        {/* Comment List */}
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">첫 댓글을 작성해보세요!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id}>
                {/* Main Comment */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium flex-shrink-0">
                    {comment.author.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{comment.author.name}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLoggedIn && (
                          <button
                            onClick={() => setReplyTo({ id: comment.id, name: comment.author.name })}
                            className="text-xs text-gray-400 hover:text-primary"
                          >
                            답글
                          </button>
                        )}
                        {currentMemberId === comment.author.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isPending}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>

                    {/* Reply Input */}
                    {replyTo?.id === comment.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`@${replyTo.name}에게 답글...`}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={isPending || !replyContent.trim()}
                          className="px-3 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setReplyTo(null); setReplyContent('') }}
                          className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 mt-3 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <CornerDownRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-2" />
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm flex-shrink-0">
                          {reply.author.name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            {currentMemberId === reply.author.id && (
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                disabled={isPending}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
