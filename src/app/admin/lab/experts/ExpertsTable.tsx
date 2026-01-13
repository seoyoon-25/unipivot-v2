'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, EyeOff, CheckCircle, XCircle, ChevronLeft, ChevronRight, User } from 'lucide-react'
import ExpertDetailModal from './ExpertDetailModal'
import {
  getMigrantCategoryLabel,
  getCategoryColorClasses,
  MIGRANT_CATEGORY_LIST,
} from '@/lib/constants/migrant'

interface Expert {
  id: string
  name: string
  title: string | null
  organization: string | null
  email: string
  phone: string | null
  origin: string | null
  originCategory: string | null
  originCountry: string | null
  arrivalYear: number | null
  defectionYear: number | null
  settlementYear: number | null
  hometown: string | null
  targetExpertise: string | null
  categories: string | null
  specialties: string | null
  isVerified: boolean
  isPublic: boolean
  isActive: boolean
  viewCount: number
  lectureCount: number
  createdAt: Date
}

interface Props {
  experts: Expert[]
  total: number
  pages: number
  currentPage: number
  searchParams: { status?: string; search?: string; category?: string }
}

// 출신 카테고리 표시 (새 필드 우선, 하위 호환)
function getOriginDisplay(expert: Expert): { label: string; colorClasses: ReturnType<typeof getCategoryColorClasses> } {
  if (expert.originCategory) {
    return {
      label: getMigrantCategoryLabel(expert.originCategory),
      colorClasses: getCategoryColorClasses(expert.originCategory),
    }
  }
  // 하위 호환성: origin 필드 기반
  if (expert.origin === 'NORTH') {
    return {
      label: '북한이탈주민',
      colorClasses: getCategoryColorClasses('DEFECTOR'),
    }
  }
  if (expert.origin === 'SOUTH') {
    return {
      label: '내국인',
      colorClasses: getCategoryColorClasses('KOREAN'),
    }
  }
  return {
    label: '-',
    colorClasses: getCategoryColorClasses(null),
  }
}

export default function ExpertsTable({ experts, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [category, setCategory] = useState(searchParams.category || '')
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    router.push(`/admin/lab/experts?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    params.set('page', page.toString())
    router.push(`/admin/lab/experts?${params.toString()}`)
  }

  const handleToggleVerified = async (id: string, isVerified: boolean) => {
    try {
      const res = await fetch(`/api/admin/lab/experts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !isVerified }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling verified:', error)
    }
  }

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      const res = await fetch(`/api/admin/lab/experts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling public:', error)
    }
  }

  const parseCategories = (categories: string | null): string[] => {
    if (!categories) return []
    try {
      return JSON.parse(categories)
    } catch {
      return []
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">전문가 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}명의 전문가</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 기관, 전문분야로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">이주배경 전체</option>
            {MIGRANT_CATEGORY_LIST.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">상태 전체</option>
            <option value="verified">검증됨</option>
            <option value="pending">대기중</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {experts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search || searchParams.status
              ? '검색 결과가 없습니다.'
              : '등록된 전문가가 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">전문가</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">소속</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">출신</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">분야</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">검증</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">공개</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {experts.map((expert) => {
                const categories = parseCategories(expert.categories)
                return (
                  <tr key={expert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expert.name}</p>
                          <p className="text-sm text-gray-500">{expert.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{expert.organization || '-'}</p>
                      <p className="text-sm text-gray-500">{expert.title || ''}</p>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const display = getOriginDisplay(expert)
                        return (
                          <span className={`px-2 py-1 text-xs rounded ${display.colorClasses.bg} ${display.colorClasses.text}`}>
                            {display.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {categories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {cat}
                          </span>
                        ))}
                        {categories.length > 2 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVerified(expert.id, expert.isVerified)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                          expert.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {expert.isVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            검증됨
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            대기중
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublic(expert.id, expert.isPublic)}
                        className={`p-2 rounded-lg transition-colors ${
                          expert.isPublic
                            ? 'text-green-500 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={expert.isPublic ? '공개중' : '비공개'}
                      >
                        {expert.isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedExpert(expert)}
                        className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 {total}명 중 {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pageNum = i + 1
                if (pages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i
                  if (pageNum > pages) pageNum = pages - 4 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pages}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExpert && (
        <ExpertDetailModal
          expert={selectedExpert}
          onClose={() => setSelectedExpert(null)}
        />
      )}
    </div>
  )
}
