import { Suspense } from 'react'
import Link from 'next/link'
import { TrendingUp, Search, BookOpen, ExternalLink, Calendar, User, Tag } from 'lucide-react'
import { prisma } from '@/lib/db'
import TrendsSearch from './TrendsSearch'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '연구동향',
  description: '북한·통일 관련 최신 연구 논문 및 보고서',
}

const SOURCES = [
  { value: '', label: '전체' },
  { value: 'RISS', label: 'RISS' },
  { value: 'DBPIA', label: 'DBpia' },
  { value: 'KCI', label: 'KCI' },
  { value: 'KINU', label: '통일연구원' },
  { value: 'OTHER', label: '기타' },
]

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: '정치·외교', label: '정치·외교' },
  { value: '경제·사회', label: '경제·사회' },
  { value: '북한사회', label: '북한사회' },
  { value: '탈북민', label: '탈북민' },
  { value: '통일교육', label: '통일교육' },
  { value: '인권', label: '인권' },
]

async function getTrends(searchParams: {
  search?: string
  source?: string
  category?: string
  page?: string
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {
    isActive: true,
  }

  if (searchParams.source) {
    where.source = searchParams.source
  }

  if (searchParams.category) {
    where.category = searchParams.category
  }

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { authors: { contains: searchParams.search, mode: 'insensitive' } },
      { keywords: { contains: searchParams.search, mode: 'insensitive' } },
      { abstract: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  const [trends, total] = await Promise.all([
    prisma.researchTrend.findMany({
      where,
      orderBy: { publishedDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.researchTrend.count({ where }),
  ])

  return {
    trends,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    source?: string
    category?: string
    page?: string
  }>
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { trends, pagination } = await getTrends(params)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">연구동향</h1>
              <p className="text-gray-500">Research Trends</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl">
            북한·통일 관련 최신 연구 논문, 보고서, 학술자료를 확인하세요.
            RISS, DBpia, KCI 등 주요 학술 데이터베이스의 자료를 제공합니다.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <TrendsSearch
          sources={SOURCES}
          categories={CATEGORIES}
          currentParams={params}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            총 <span className="font-semibold text-primary">{pagination.total}</span>건의 연구자료
          </p>
        </div>

        {/* Trends List */}
        {trends.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.min(10, pagination.pages) }, (_, i) => {
              let pageNum = i + 1
              if (pagination.pages > 10 && pagination.page > 5) {
                pageNum = pagination.page - 5 + i
                if (pageNum > pagination.pages) pageNum = pagination.pages - 9 + i
              }
              return (
                <Link
                  key={pageNum}
                  href={`/lab/trends?page=${pageNum}${params.search ? `&search=${params.search}` : ''}${params.source ? `&source=${params.source}` : ''}${params.category ? `&category=${params.category}` : ''}`}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.page === pageNum
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function TrendCard({ trend }: { trend: any }) {
  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
    })
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'RISS':
        return 'bg-blue-100 text-blue-700'
      case 'DBPIA':
        return 'bg-green-100 text-green-700'
      case 'KCI':
        return 'bg-purple-100 text-purple-700'
      case 'KINU':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <article className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Content */}
        <div className="flex-1">
          {/* Source & Category */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceColor(trend.source)}`}>
              {trend.source}
            </span>
            {trend.category && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {trend.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
            {trend.sourceUrl ? (
              <a
                href={trend.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {trend.title}
              </a>
            ) : (
              trend.title
            )}
          </h3>

          {/* Authors */}
          {trend.authors && (
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <User className="w-4 h-4" />
              {trend.authors}
            </p>
          )}

          {/* Abstract */}
          {trend.abstract && (
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {trend.abstract}
            </p>
          )}

          {/* Keywords */}
          {trend.keywords && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400" />
              {trend.keywords.split(',').slice(0, 5).map((keyword: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta & Actions */}
        <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(trend.publishedDate)}
          </span>
          {trend.sourceUrl && (
            <a
              href={trend.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              원문 보기
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
