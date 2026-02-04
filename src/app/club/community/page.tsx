import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getCommunityPosts } from '@/lib/club/community-queries'
import PostList from '@/components/club/community/PostList'

export const metadata = { title: '커뮤니티 | 유니클럽' }

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>
}

const categories = [
  { value: 'all', label: '전체' },
  { value: 'FREE', label: '자유' },
  { value: 'BOOK_REVIEW', label: '독후감' },
  { value: 'QUESTION', label: '질문' },
  { value: 'MEETUP', label: '모임' },
]

export default async function CommunityPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  const { category: rawCategory, page: rawPage, search } = await searchParams
  const category = rawCategory || 'all'
  const page = parseInt(rawPage || '1')

  const { posts, totalPages } = await getCommunityPosts({
    category,
    page,
    search,
  })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">커뮤니티</h1>
        {user && (
          <Link
            href="/club/community/new"
            className="club-btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            글쓰기
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/club/community${cat.value === 'all' ? '' : `?category=${cat.value}`}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              category === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <PostList
        posts={posts.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }))}
        currentPage={page}
        totalPages={totalPages}
        category={category}
      />
    </div>
  )
}
