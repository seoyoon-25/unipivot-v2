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
      className={`bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 ${
        isReply ? 'border-zinc-100' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-zinc-900">
            {comment.author.name || '익명'}
          </span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-500">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>
      </div>

      <p className="text-zinc-800 text-sm whitespace-pre-wrap">{comment.content}</p>

      <div className="flex items-center gap-2 mt-2">
        {!isReply && isLoggedIn && onReply && (
          <button
            onClick={onReply}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
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
