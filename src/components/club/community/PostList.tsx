'use client'

import Link from 'next/link'
import PostCard from './PostCard'

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
}

interface Props {
  posts: PostData[]
  currentPage: number
  totalPages: number
  category: string
}

export default function PostList({ posts, currentPage, totalPages, category }: Props) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        게시글이 없습니다.
      </div>
    )
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return `/club/community${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={buildPageUrl(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
