'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Book } from 'lucide-react'
import { createBookReport } from '@/lib/actions/public'

interface Book {
  id: string
  title: string
  author: string | null
}

interface Props {
  books: Book[]
}

export default function ReportForm({ books }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    bookId: '',
    title: '',
    content: '',
    isPublic: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.bookId) {
      setError('도서를 선택해주세요.')
      return
    }
    if (!form.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!form.content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createBookReport({
        bookId: form.bookId,
        title: form.title,
        content: form.content,
        isPublic: form.isPublic
      })
      router.push('/my/reports')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/my/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-lg font-bold text-gray-900">기록 작성</h2>
        </div>

        <div className="space-y-6">
          {/* Book Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도서 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.bookId}
              onChange={(e) => setForm({ ...form, bookId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">도서를 선택하세요</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} {book.author && `- ${book.author}`}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="독서 기록의 제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="책을 읽고 느낀 점, 인상 깊었던 내용, 생각의 변화 등을 자유롭게 기록해주세요."
              rows={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="isPublic" className="text-gray-700">
              다른 회원들에게 공개하기
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              작성 시 <span className="text-primary font-medium">200P</span> 적립
            </p>
            <div className="flex gap-3">
              <Link
                href="/my/reports"
                className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
