'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Plus, Edit, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import TrendFormModal from './TrendFormModal'

interface ResearchTrend {
  id: string
  title: string
  source: string
  category: string | null
  authors: string | null
  abstract: string | null
  keywords: string | null
  publishedDate: Date | null
  sourceUrl: string | null
  isActive: boolean
  createdAt: Date
}

interface Props {
  trends: ResearchTrend[]
  total: number
  pages: number
  currentPage: number
  searchParams: { source?: string; search?: string }
}

const SOURCES = [
  { value: '', label: '전체' },
  { value: 'RISS', label: 'RISS' },
  { value: 'DBPIA', label: 'DBpia' },
  { value: 'KCI', label: 'KCI' },
  { value: 'KINU', label: '통일연구원' },
  { value: 'OTHER', label: '기타' },
]

function getSourceColor(source: string) {
  switch (source) {
    case 'RISS': return 'bg-blue-100 text-blue-700'
    case 'DBPIA': return 'bg-green-100 text-green-700'
    case 'KCI': return 'bg-purple-100 text-purple-700'
    case 'KINU': return 'bg-orange-100 text-orange-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default function TrendsTable({ trends, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [source, setSource] = useState(searchParams.source || '')
  const [showForm, setShowForm] = useState(false)
  const [editingTrend, setEditingTrend] = useState<ResearchTrend | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (source) params.set('source', source)
    router.push(`/admin/lab/trends?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (source) params.set('source', source)
    params.set('page', page.toString())
    router.push(`/admin/lab/trends?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/lab/trends/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/lab/trends/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling active:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTrend(null)
    router.refresh()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">연구동향 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}건의 연구자료</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 연구자료
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 저자, 키워드로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
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
        {trends.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search || searchParams.source
              ? '검색 결과가 없습니다.'
              : '등록된 연구자료가 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">제목</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">출처</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">저자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">발행일</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trends.map((trend) => (
                <tr key={trend.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 truncate max-w-[300px]">{trend.title}</p>
                    {trend.category && (
                      <p className="text-sm text-gray-500">{trend.category}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-sm rounded ${getSourceColor(trend.source)}`}>
                      {trend.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <p className="truncate max-w-[150px]">{trend.authors || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(trend.publishedDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-sm rounded ${
                      trend.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {trend.isActive ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {trend.sourceUrl && (
                        <a
                          href={trend.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          title="원문 보기"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleActive(trend.id, trend.isActive)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                        title={trend.isActive ? '비공개로 변경' : '공개로 변경'}
                      >
                        {trend.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditingTrend(trend)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(trend.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 {total}건 중 {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
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

      {/* Form Modal */}
      {(showForm || editingTrend) && (
        <TrendFormModal
          trend={editingTrend}
          onClose={() => {
            setShowForm(false)
            setEditingTrend(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
