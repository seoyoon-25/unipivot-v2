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
  FREE: 'bg-zinc-100 text-zinc-700',
  BOOK_REVIEW: 'bg-blue-50 text-blue-700',
  QUESTION: 'bg-emerald-50 text-emerald-700',
  MEETUP: 'bg-purple-50 text-purple-700',
}

export default function PostCard({ post }: { post: PostData }) {
  return (
    <Link href={`/club/community/${post.id}`}>
      <div className="club-card club-card-hover p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
              categoryColors[post.category] || 'bg-zinc-100 text-zinc-700'
            }`}
          >
            {categoryLabels[post.category] || post.category}
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-900 mb-2 line-clamp-1">{post.title}</h3>

        <div className="flex items-center justify-between text-xs text-zinc-400">
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
