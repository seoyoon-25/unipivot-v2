'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface Props {
  sources: Option[]
  categories: Option[]
  currentParams: {
    search?: string
    source?: string
    category?: string
  }
}

export default function TrendsSearch({ sources, categories, currentParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentParams.search || '')
  const [source, setSource] = useState(currentParams.source || '')
  const [category, setCategory] = useState(currentParams.category || '')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (source) params.set('source', source)
    if (category) params.set('category', category)
    router.push(`/lab/trends?${params.toString()}`)
  }

  const handleSourceChange = (newSource: string) => {
    setSource(newSource)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (newSource) params.set('source', newSource)
    if (category) params.set('category', category)
    router.push(`/lab/trends?${params.toString()}`)
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (source) params.set('source', source)
    if (newCategory) params.set('category', newCategory)
    router.push(`/lab/trends?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch('')
    setSource('')
    setCategory('')
    router.push('/lab/trends')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
      {/* Search Input */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="논문 제목, 저자, 키워드로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
        >
          검색
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Source Filter */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Filter className="w-4 h-4" />
            출처
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSourceChange(s.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  source === s.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <div className="text-sm text-gray-500 mb-2">분야</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => handleCategoryChange(c.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  category === c.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset */}
      {(search || source || category) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-primary"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}
