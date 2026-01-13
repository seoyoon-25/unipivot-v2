'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, ChevronLeft, ChevronRight, BadgeCheck, Mic, MessageSquare, Users, Globe } from 'lucide-react'
import {
  MIGRANT_CATEGORY_LIST,
  getMigrantCategoryLabel,
  getCategoryColorClasses,
} from '@/lib/constants/migrant'

interface Expert {
  id: string
  name: string
  photo: string | null
  title: string | null
  organization: string | null
  categories: string | null
  specialties: string | null
  lectureTopics: string | null
  lectureFeeMin: number | null
  lectureFeeMax: number | null
  lectureCount: number
  consultingCount: number
  isVerified: boolean
  bio: string | null
}

interface Category {
  id: string
  name: string
  nameEn: string | null
  icon: string | null
  color: string | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

interface Props {
  categories: Category[]
  initialExperts: Expert[]
  initialPagination: Pagination
  searchParams: { category?: string; search?: string; page?: string; originCategory?: string }
}

export default function ExpertList({ categories, initialExperts, initialPagination, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '')
  const [selectedOriginCategory, setSelectedOriginCategory] = useState(searchParams.originCategory || '')

  const buildUrl = (overrides: { search?: string; category?: string; originCategory?: string; page?: number } = {}) => {
    const params = new URLSearchParams()
    const s = overrides.search !== undefined ? overrides.search : search
    const c = overrides.category !== undefined ? overrides.category : selectedCategory
    const o = overrides.originCategory !== undefined ? overrides.originCategory : selectedOriginCategory
    const p = overrides.page

    if (s) params.set('search', s)
    if (c) params.set('category', c)
    if (o) params.set('originCategory', o)
    if (p) params.set('page', p.toString())
    return `/lab/experts?${params.toString()}`
  }

  const handleSearch = () => {
    router.push(buildUrl())
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    router.push(buildUrl({ category }))
  }

  const handleOriginCategoryChange = (originCategory: string) => {
    setSelectedOriginCategory(originCategory)
    router.push(buildUrl({ originCategory }))
  }

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page }))
  }

  const parseCategories = (categoriesStr: string | null): string[] => {
    if (!categoriesStr) return []
    try {
      return JSON.parse(categoriesStr)
    } catch {
      return []
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 전문분야, 강연주제로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
          >
            검색
          </button>
        </div>

        {/* Origin Category Filter */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">이주배경</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleOriginCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedOriginCategory
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {MIGRANT_CATEGORY_LIST.map((cat) => {
              const isSelected = selectedOriginCategory === cat.value
              const colorClasses = getCategoryColorClasses(cat.value)
              return (
                <button
                  key={cat.value}
                  onClick={() => handleOriginCategoryChange(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? `${colorClasses.bg} ${colorClasses.text}`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">전문분야</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          총 <span className="font-semibold text-primary">{initialPagination.total}</span>명의 전문가
        </p>
        <Link
          href="/lab/experts/register"
          className="text-sm text-primary hover:underline"
        >
          전문가로 등록하기
        </Link>
      </div>

      {/* Expert Grid */}
      {initialExperts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
          <button
            onClick={() => {
              setSearch('')
              setSelectedCategory('')
              setSelectedOriginCategory('')
              router.push('/lab/experts')
            }}
            className="mt-4 text-primary hover:underline"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialExperts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} parseCategories={parseCategories} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {initialPagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(initialPagination.page - 1)}
            disabled={initialPagination.page === 1}
            className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: Math.min(5, initialPagination.pages) }, (_, i) => {
            let pageNum = i + 1
            if (initialPagination.pages > 5 && initialPagination.page > 3) {
              pageNum = initialPagination.page - 2 + i
              if (pageNum > initialPagination.pages) pageNum = initialPagination.pages - 4 + i
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  initialPagination.page === pageNum
                    ? 'bg-primary text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            onClick={() => handlePageChange(initialPagination.page + 1)}
            disabled={initialPagination.page === initialPagination.pages}
            className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function ExpertCard({
  expert,
  parseCategories,
}: {
  expert: Expert
  parseCategories: (str: string | null) => string[]
}) {
  const categories = parseCategories(expert.categories)

  return (
    <Link
      href={`/lab/experts/${expert.id}`}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
    >
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
          {expert.photo ? (
            <img
              src={expert.photo}
              alt={expert.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
              {expert.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
              {expert.name}
            </h3>
            {expert.isVerified && (
              <BadgeCheck className="w-4 h-4 text-primary" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {expert.title || expert.organization || '-'}
          </p>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {cat}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="px-2 py-1 text-gray-400 text-xs">
              +{categories.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Specialties */}
      {expert.specialties && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {expert.specialties}
        </p>
      )}

      {/* Stats & Fee */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Mic className="w-4 h-4" />
            {expert.lectureCount}회
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {expert.consultingCount}회
          </span>
        </div>
        {expert.lectureFeeMin && (
          <span className="text-sm font-medium text-primary">
            {expert.lectureFeeMin}만원~
          </span>
        )}
      </div>
    </Link>
  )
}
