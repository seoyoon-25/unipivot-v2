'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter } from 'lucide-react'

interface Props {
  seasons: string[]
  categories: string[]
  currentSeason?: string
  currentCategory?: string
  currentSearch?: string
}

export default function BookshelfFilters({
  seasons,
  categories,
  currentSeason,
  currentCategory,
  currentSearch
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset page when filter changes
    router.push(`/bookshelf?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search.trim() || null)
  }

  const clearAllFilters = () => {
    router.push('/bookshelf')
    setSearch('')
  }

  const hasFilters = currentSeason || currentCategory || currentSearch

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="책 제목 또는 저자로 검색..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                updateFilter('search', null)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          검색
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border transition-colors ${
            showFilters || hasFilters
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">필터</h3>
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-primary"
              >
                전체 해제
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Season Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시즌</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('season', null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !currentSeason
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => updateFilter('season', season)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      currentSeason === season
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateFilter('category', null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      !currentCategory
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => updateFilter('category', category)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        currentCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {currentSeason && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {currentSeason}
              <button onClick={() => updateFilter('season', null)}>
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {currentCategory}
              <button onClick={() => updateFilter('category', null)}>
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              &quot;{currentSearch}&quot;
              <button onClick={() => {
                setSearch('')
                updateFilter('search', null)
              }}>
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-primary"
          >
            전체 해제
          </button>
        </div>
      )}
    </div>
  )
}
