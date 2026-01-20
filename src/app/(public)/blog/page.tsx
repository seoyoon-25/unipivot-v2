export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, Search, Tag, User } from 'lucide-react'
import { getPublicBlogPosts } from '@/lib/actions/public'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: '블로그',
  description: '유니피벗의 이야기와 인사이트',
}

interface Props {
  searchParams: { page?: string; category?: string; search?: string }
}

// Default header content
const defaultHeader = {
  hero: {
    badge: 'Blog',
    title: '블로그',
    subtitle: '유니피벗의 이야기와 인사이트를 공유합니다',
  },
}

async function getHeaderContent() {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'page.blog' },
    })
    if (section?.content && typeof section.content === 'string') {
      return JSON.parse(section.content) as typeof defaultHeader
    }
  } catch (error) {
    console.error('Failed to load blog header:', error)
  }
  return defaultHeader
}

export default async function BlogPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const [header, blogData] = await Promise.all([
    getHeaderContent(),
    getPublicBlogPosts({
      page,
      limit: 12,
      category: searchParams.category,
      search: searchParams.search,
    }),
  ])
  const { posts, total, pages, categories } = blogData

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            {header.hero.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            {header.hero.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {header.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
            <form method="GET" className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchParams.search}
                    placeholder="검색어를 입력하세요"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <select
                name="category"
                defaultValue={searchParams.category}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="">전체 카테고리</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
              >
                검색
              </button>
              {(searchParams.search || searchParams.category) && (
                <Link
                  href="/blog"
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  초기화
                </Link>
              )}
            </form>
          </div>

          {/* Results Info */}
          {(searchParams.search || searchParams.category) && (
            <div className="mb-6 text-gray-600">
              {searchParams.search && (
                <span>&quot;{searchParams.search}&quot; 검색 결과 </span>
              )}
              {searchParams.category && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {searchParams.category}
                </span>
              )}
              <span className="ml-2">({total}건)</span>
            </div>
          )}

          {/* Blog Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-gray-500 text-lg">
                {searchParams.search || searchParams.category
                  ? '검색 결과가 없습니다.'
                  : '등록된 블로그 글이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="text-4xl font-bold text-primary/20">B</span>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        {post.author.image ? (
                          <Image
                            src={post.author.image}
                            alt={post.author.name || ''}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span>{post.author.name || '관리자'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                    className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    이전
                  </Link>
                )}
                {Array.from({ length: pages }, (_, i) => {
                  const pageNum = i + 1
                  // Show first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === pages ||
                    (pageNum >= page - 2 && pageNum <= page + 2)
                  ) {
                    return (
                      <Link
                        key={pageNum}
                        href={`/blog?page=${pageNum}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-white'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  }
                  // Show ellipsis
                  if (pageNum === page - 3 || pageNum === page + 3) {
                    return <span key={pageNum} className="px-2 py-2 text-gray-400">...</span>
                  }
                  return null
                })}
                {page < pages && (
                  <Link
                    href={`/blog?page=${page + 1}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                    className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    다음
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
