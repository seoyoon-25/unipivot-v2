'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit2, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deletePost } from '@/app/club/community/actions'
import { sanitizeHtml } from '@/lib/sanitize'
import LikeButton from './LikeButton'

const categoryLabels: Record<string, string> = {
  FREE: '자유',
  BOOK_REVIEW: '독후감',
  QUESTION: '질문',
  MEETUP: '모임',
}

interface PostData {
  id: string
  category: string
  title: string
  content: string
  viewCount: number
  createdAt: string
  author: { id: string; name: string | null; image: string | null }
  commentCount: number
  likeCount: number
  isLiked: boolean
}

interface Props {
  post: PostData
  isAuthor: boolean
  isLoggedIn: boolean
}

export default function PostDetail({ post, isAuthor, isLoggedIn }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setIsDeleting(true)
    await deletePost(post.id)
  }

  return (
    <div>
      <Link
        href="/club/community"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        목록으로
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">
            {categoryLabels[post.category] || post.category}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
          <span>{post.author.name || '익명'}</span>
          <span>·</span>
          <span>{format(new Date(post.createdAt), 'yyyy.M.d', { locale: ko })}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.viewCount}
          </span>
        </div>

        <div
          className="prose prose-sm max-w-none text-gray-800 mb-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLiked}
            initialCount={post.likeCount}
            isLoggedIn={isLoggedIn}
          />

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Link
                href={`/club/community/${post.id}/edit`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
                수정
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
