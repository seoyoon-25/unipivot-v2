'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

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
}

interface Props {
  trend?: ResearchTrend | null
  onClose: () => void
  onSuccess: () => void
}

const SOURCES = [
  { value: 'RISS', label: 'RISS' },
  { value: 'DBPIA', label: 'DBpia' },
  { value: 'KCI', label: 'KCI' },
  { value: 'KINU', label: '통일연구원' },
  { value: 'OTHER', label: '기타' },
]

const CATEGORIES = [
  { value: '정치·외교', label: '정치·외교' },
  { value: '경제·사회', label: '경제·사회' },
  { value: '북한사회', label: '북한사회' },
  { value: '탈북민', label: '탈북민' },
  { value: '통일교육', label: '통일교육' },
  { value: '인권', label: '인권' },
]

export default function TrendFormModal({ trend, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: trend?.title || '',
    source: trend?.source || 'RISS',
    category: trend?.category || '',
    authors: trend?.authors || '',
    abstract: trend?.abstract || '',
    keywords: trend?.keywords || '',
    publishedDate: trend?.publishedDate
      ? new Date(trend.publishedDate).toISOString().split('T')[0]
      : '',
    sourceUrl: trend?.sourceUrl || '',
    isActive: trend?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const url = trend
        ? `/api/admin/lab/trends/${trend.id}`
        : '/api/admin/lab/trends'
      const method = trend ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publishedDate: formData.publishedDate || null,
        }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {trend ? '연구자료 수정' : '새 연구자료 등록'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="연구 제목"
            />
          </div>

          {/* Source & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출처</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">분야</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">선택하세요</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Authors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">저자</label>
            <input
              type="text"
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="저자명 (여러 명일 경우 쉼표로 구분)"
            />
          </div>

          {/* Published Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">발행일</label>
            <input
              type="date"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">원문 URL</label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="https://..."
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">키워드</label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="키워드를 쉼표로 구분하여 입력"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">초록/요약</label>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="연구 요약 내용"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              공개 여부 (체크 시 목록에 표시됨)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : (trend ? '수정하기' : '등록하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
