'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Book, Save, ArrowLeft, Loader2 } from 'lucide-react'

interface ReadBook {
  id: string
  title: string
  author: string | null
  publisher: string | null
  pubYear: string | null
  image: string | null
  season: string
  sessionCount: number | null
  participants: number | null
  category: string | null
  rating: number | null
  status: string
}

interface Props {
  book?: ReadBook
}

const CATEGORIES = [
  '인문',
  '사회',
  '과학',
  '경제',
  '철학',
  '역사',
  '문학',
  '예술',
  '자기계발',
  '기타'
]

export default function BookForm({ book }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    publisher: book?.publisher || '',
    pubYear: book?.pubYear || '',
    image: book?.image || '',
    season: book?.season || '',
    sessionCount: book?.sessionCount?.toString() || '',
    participants: book?.participants?.toString() || '',
    category: book?.category || '',
    rating: book?.rating?.toString() || '',
    status: book?.status || 'COMPLETED'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!formData.season.trim()) {
      alert('시즌을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const url = book ? `/api/admin/books/${book.id}` : '/api/admin/books'
      const method = book ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionCount: formData.sessionCount ? parseInt(formData.sessionCount) : null,
          participants: formData.participants ? parseInt(formData.participants) : null,
          rating: formData.rating ? parseInt(formData.rating) : null
        })
      })

      if (res.ok) {
        router.push('/admin/books')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="책 제목"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">저자</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="저자명"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">출판사</label>
            <input
              type="text"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="출판사"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">출판년도</label>
            <input
              type="text"
              value={formData.pubYear}
              onChange={(e) => setFormData({ ...formData, pubYear: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="예: 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">표지 이미지 URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">프로그램 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시즌 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="예: 시즌26"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">분류</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">선택 안함</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">진행 회차</label>
            <input
              type="number"
              value={formData.sessionCount}
              onChange={(e) => setFormData({ ...formData, sessionCount: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="예: 4"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">참여 인원</label>
            <input
              type="number"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="예: 15"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">평점</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">선택 안함</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r}점)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="COMPLETED">완료</option>
              <option value="IN_PROGRESS">진행중</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      {formData.image && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">미리보기</h2>
          <div className="flex items-start gap-4">
            <img
              src={formData.image}
              alt={formData.title}
              className="w-24 h-36 object-cover rounded-lg shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div>
              <h3 className="font-bold text-gray-900">{formData.title || '제목 미입력'}</h3>
              <p className="text-gray-600">{formData.author || '저자 미입력'}</p>
              {formData.season && (
                <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-sm rounded">
                  {formData.season}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/books"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          목록으로
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              저장
            </>
          )}
        </button>
      </div>
    </form>
  )
}
