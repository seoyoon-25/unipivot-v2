import Link from 'next/link'
import { MessageCircle, Heart, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PostData {
  id: string
  category: string
  title: string
  viewCount: number
  createdAt: string
  author: { id: string; name: string | null; image: string | null }
  commentCount: number
  likeCount: number
}

const categoryLabels: Record<string, string> = {
  FREE: '자유',
  BOOK_REVIEW: '독후감',
  QUESTION: '질문',
  MEETUP: '모임',
}

const categoryColors: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  BOOK_REVIEW: 'bg-blue-100 text-blue-700',
  QUESTION: 'bg-green-100 text-green-700',
  MEETUP: 'bg-purple-100 text-purple-700',
}

export default function PostCard({ post }: { post: PostData }) {
  return (
    <Link href={`/club/community/${post.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              categoryColors[post.category] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {categoryLabels[post.category] || post.category}
          </span>
        </div>

        <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">{post.title}</h3>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>{post.author.name || '익명'}</span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {post.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.viewCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
