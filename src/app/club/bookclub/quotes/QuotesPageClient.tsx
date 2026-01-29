'use client'

import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import QuoteCard from '@/components/club/bookclub/QuoteCard'
import QuoteImageGenerator from '@/components/club/bookclub/QuoteImageGenerator'
import { createQuote } from './actions'

interface QuoteItem {
  id: string
  bookTitle: string
  bookAuthor?: string | null
  content: string
  page?: number | null
  memo?: string | null
  isPublic: boolean
  createdAt: Date
  user: { id: string; name: string | null }
  isOwner?: boolean
}

interface QuotesPageClientProps {
  publicQuotes: QuoteItem[]
  myQuotes: QuoteItem[]
  isLoggedIn: boolean
}

export default function QuotesPageClient({
  publicQuotes: initialPublic,
  myQuotes: initialMy,
  isLoggedIn,
}: QuotesPageClientProps) {
  const [tab, setTab] = useState<'public' | 'my'>(isLoggedIn && initialMy.length > 0 ? 'my' : 'public')
  const [publicQuotes, setPublicQuotes] = useState(initialPublic)
  const [myQuotes, setMyQuotes] = useState(initialMy)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [imageQuote, setImageQuote] = useState<QuoteItem | null>(null)

  // Form state
  const [formBookTitle, setFormBookTitle] = useState('')
  const [formBookAuthor, setFormBookAuthor] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formPage, setFormPage] = useState('')
  const [formMemo, setFormMemo] = useState('')
  const [formIsPublic, setFormIsPublic] = useState(true)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const filteredQuotes = (tab === 'public' ? publicQuotes : myQuotes).filter((q) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      q.bookTitle.toLowerCase().includes(s) ||
      q.content.toLowerCase().includes(s) ||
      q.bookAuthor?.toLowerCase().includes(s)
    )
  })

  const handleSubmit = async () => {
    setFormError('')
    setFormSaving(true)
    try {
      await createQuote({
        bookTitle: formBookTitle,
        bookAuthor: formBookAuthor || undefined,
        content: formContent,
        page: formPage ? parseInt(formPage, 10) : undefined,
        memo: formMemo || undefined,
        isPublic: formIsPublic,
      })
      setShowForm(false)
      setFormBookTitle('')
      setFormBookAuthor('')
      setFormContent('')
      setFormPage('')
      setFormMemo('')
      // Refresh page to get new data
      window.location.reload()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '저장에 실패했습니다')
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    setPublicQuotes((prev) => prev.filter((q) => q.id !== id))
    setMyQuotes((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div>
      {/* Search + Add */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="책 제목, 구절 검색..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shrink-0"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">명문장 추가</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formBookTitle}
                onChange={(e) => setFormBookTitle(e.target.value)}
                placeholder="책 제목 *"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={formBookAuthor}
                onChange={(e) => setFormBookAuthor(e.target.value)}
                placeholder="저자"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="인상 깊은 구절을 입력하세요 *"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={formPage}
                onChange={(e) => setFormPage(e.target.value)}
                placeholder="페이지 (선택)"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublic}
                    onChange={(e) => setFormIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">공개</span>
                </label>
              </div>
            </div>
            <input
              type="text"
              value={formMemo}
              onChange={(e) => setFormMemo(e.target.value)}
              placeholder="메모 (선택)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {formError && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{formError}</div>
            )}
            <button
              onClick={handleSubmit}
              disabled={formSaving || !formBookTitle.trim() || !formContent.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {formSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {isLoggedIn && (
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setTab('public')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
              tab === 'public'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            전체 ({publicQuotes.length})
          </button>
          <button
            onClick={() => setTab('my')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
              tab === 'my'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            내 명문장 ({myQuotes.length})
          </button>
        </div>
      )}

      {/* Quote List */}
      <div className="space-y-3">
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onDelete={handleDelete}
              onGenerateImage={(q) => setImageQuote(q)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            {search ? '검색 결과가 없습니다' : '아직 등록된 명문장이 없습니다'}
          </div>
        )}
      </div>

      {/* Image Generator Modal */}
      {imageQuote && (
        <QuoteImageGenerator quote={imageQuote} onClose={() => setImageQuote(null)} />
      )}
    </div>
  )
}
