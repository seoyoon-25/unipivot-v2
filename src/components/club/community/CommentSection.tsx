'use client'

import { useState } from 'react'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
}

interface Reply {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: CommentAuthor
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: CommentAuthor
  replies: Reply[]
}

interface Props {
  postId: string
  comments: Comment[]
  currentUserId?: string
}

export default function CommentSection({ postId, comments, currentUserId }: Props) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        댓글 {comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)}개
      </h2>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              postId={postId}
              isAuthor={currentUserId === comment.author.id}
              onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              isLoggedIn={!!currentUserId}
            />

            {comment.replies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    isAuthor={currentUserId === reply.author.id}
                    isReply
                    isLoggedIn={!!currentUserId}
                  />
                ))}
              </div>
            )}

            {replyingTo === comment.id && currentUserId && (
              <div className="ml-8 mt-2">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onCancel={() => setReplyingTo(null)}
                  placeholder="답글을 입력하세요..."
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {currentUserId && (
        <div className="mt-6">
          <CommentForm postId={postId} placeholder="댓글을 입력하세요..." />
        </div>
      )}
    </div>
  )
}
