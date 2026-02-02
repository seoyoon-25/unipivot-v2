'use client'

import { useState, useTransition } from 'react'
import { Reply, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deleteComment } from '@/app/club/community/actions'

interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
}

interface Props {
  comment: {
    id: string
    content: string
    createdAt: string
    author: CommentAuthor
  }
  postId: string
  isAuthor: boolean
  isReply?: boolean
  isLoggedIn: boolean
  onReply?: () => void
}

export default function CommentItem({
  comment,
  postId,
  isAuthor,
  isReply,
  isLoggedIn,
  onReply,
}: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    startTransition(async () => {
      await deleteComment(comment.id, postId)
    })
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 ${
        isReply ? 'border-gray-100' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-900">
            {comment.author.name || '익명'}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>
      </div>

      <p className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</p>

      <div className="flex items-center gap-2 mt-2">
        {!isReply && isLoggedIn && onReply && (
          <button
            onClick={onReply}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <Reply className="w-3.5 h-3.5" />
            답글
          </button>
        )}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            삭제
          </button>
        )}
      </div>
    </div>
  )
}
