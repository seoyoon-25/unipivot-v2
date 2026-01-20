import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Search, Library, FileText, Calendar, Users } from 'lucide-react'
import { getBookshelfBooks, getSeasons, getCategories, getBookshelfStats } from '@/lib/actions/bookshelf'
import BookshelfGrid from './BookshelfGrid'
import BookshelfFilters from './BookshelfFilters'

export const metadata: Metadata = {
  title: '유니피벗 책장 | 유니피벗',
  description: '유니피벗에서 함께 읽은 120여 권의 책들을 만나보세요.'
}

interface PageProps {
  searchParams: Promise<{
    season?: string
    category?: string
    search?: string
    page?: string
  }>
}

export default async function BookshelfPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')

  const [{ books, total, totalPages, currentPage }, seasons, categories, stats] = await Promise.all([
    getBookshelfBooks({
      season: params.season,
      category: params.category,
      search: params.search,
      page,
      limit: 24
    }),
    getSeasons(),
    getCategories(),
    getBookshelfStats()
  ])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/90 to-primary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
            <Library className="w-5 h-5 text-white" />
            <span className="text-white font-medium">UNIPIVOT Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            유니피벗 책장
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            시즌 1부터 지금까지, 유니피벗과 함께 읽은 책들의 기록입니다.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalBooks}</div>
              <div className="text-white/70 text-sm">읽은 책</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalSeasons}</div>
              <div className="text-white/70 text-sm">시즌</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalReports}</div>
              <div className="text-white/70 text-sm">독후감</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <BookshelfFilters
            seasons={seasons}
            categories={categories}
            currentSeason={params.season}
            currentCategory={params.category}
            currentSearch={params.search}
          />

          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              총 <span className="font-semibold text-gray-900">{total}권</span>의 책
              {params.season && <span className="text-primary"> ({params.season})</span>}
              {params.category && <span className="text-primary"> · {params.category}</span>}
              {params.search && <span className="text-primary"> · &quot;{params.search}&quot;</span>}
            </p>
            <Link
              href="/books"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" />
              읽고 싶은 책 보기
            </Link>
          </div>

          {/* Book Grid */}
          {books.length > 0 ? (
            <>
              <BookshelfGrid books={books} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={buildUrl(params, currentPage - 1)}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      이전
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                      return (
                        <span key={p} className="flex items-center">
                          {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                          <Link
                            href={buildUrl(params, p)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium ${
                              p === currentPage
                                ? 'bg-primary text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </Link>
                        </span>
                      )
                    })}

                  {currentPage < totalPages && (
                    <Link
                      href={buildUrl(params, currentPage + 1)}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      다음
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                다른 검색어나 필터를 시도해보세요.
              </p>
              <Link
                href="/bookshelf"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                전체 보기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            함께 읽고 싶은 책이 있으신가요?
          </h2>
          <p className="text-gray-600 mb-6">
            다음 독서모임에서 함께 읽고 싶은 책을 추천하고 투표해보세요!
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            읽고 싶은 책 추천하기
          </Link>
        </div>
      </section>
    </main>
  )
}

function buildUrl(params: any, page: number) {
  const searchParams = new URLSearchParams()
  if (params.season) searchParams.set('season', params.season)
  if (params.category) searchParams.set('category', params.category)
  if (params.search) searchParams.set('search', params.search)
  if (page > 1) searchParams.set('page', String(page))
  const query = searchParams.toString()
  return `/bookshelf${query ? '?' + query : ''}`
}
