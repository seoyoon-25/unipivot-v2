import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Book, Plus, Search } from 'lucide-react'
import BooksTable from './BooksTable'

interface PageProps {
  searchParams: Promise<{
    search?: string
    season?: string
    page?: string
  }>
}

export default async function AdminBooksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 20

  const where: any = {}

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' as const } },
      { author: { contains: params.search, mode: 'insensitive' as const } }
    ]
  }

  if (params.season) {
    where.season = params.season
  }

  const [books, total, seasons] = await Promise.all([
    prisma.readBook.findMany({
      where,
      orderBy: [{ season: 'desc' }, { title: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { bookReports: true }
        }
      }
    }),
    prisma.readBook.count({ where }),
    prisma.readBook.findMany({
      select: { season: true },
      distinct: ['season'],
      orderBy: { season: 'desc' }
    })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">책 관리</h1>
          <p className="text-gray-600 mt-1">
            유니피벗에서 읽은 책 {total}권
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          책 추가
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <form className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="제목 또는 저자 검색..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            name="season"
            defaultValue={params.season}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 시즌</option>
            {seasons.map((s) => (
              <option key={s.season} value={s.season}>
                {s.season}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* Table */}
      <BooksTable books={books} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl(params, page - 1)}
              className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"
            >
              이전
            </Link>
          )}
          <span className="px-4 py-2 text-gray-600">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl(params, page + 1)}
              className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function buildUrl(params: any, page: number) {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.season) searchParams.set('season', params.season)
  if (page > 1) searchParams.set('page', String(page))
  const query = searchParams.toString()
  return `/admin/books${query ? '?' + query : ''}`
}
