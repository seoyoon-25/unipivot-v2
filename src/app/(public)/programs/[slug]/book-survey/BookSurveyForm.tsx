'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Book, Smartphone, Check } from 'lucide-react'

interface BookSurveyFormProps {
  programId: string
  initialData: {
    bookReceiveType: string | null
    ebookProvider: string | null
    ebookProviderOther: string | null
  }
}

const ebookProviders = [
  { value: 'KYOBO', label: '교보문고' },
  { value: 'YES24', label: '예스24' },
  { value: 'RIDI', label: '리디북스' },
  { value: 'ALADIN', label: '알라딘' },
  { value: 'MILLIE', label: '밀리의 서재' },
  { value: 'OTHER', label: '기타' },
]

export function BookSurveyForm({ programId, initialData }: BookSurveyFormProps) {
  const router = useRouter()
  const [bookReceiveType, setBookReceiveType] = useState(
    initialData.bookReceiveType || ''
  )
  const [ebookProvider, setEbookProvider] = useState(
    initialData.ebookProvider || ''
  )
  const [ebookProviderOther, setEbookProviderOther] = useState(
    initialData.ebookProviderOther || ''
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch(`/api/programs/${programId}/book-survey`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookReceiveType,
          ebookProvider: bookReceiveType === 'EBOOK' ? ebookProvider : null,
          ebookProviderOther:
            bookReceiveType === 'EBOOK' && ebookProvider === 'OTHER'
              ? ebookProviderOther
              : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '저장 중 오류가 발생했습니다')
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-5 h-5" />
          저장되었습니다!
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          책 수령 방식 선택
        </label>

        {/* Paper Book Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            bookReceiveType === 'PAPER'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="bookReceiveType"
            value="PAPER"
            checked={bookReceiveType === 'PAPER'}
            onChange={(e) => setBookReceiveType(e.target.value)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">종이책</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              교보문고 선물하기로 배송됩니다.
              <br />
              카카오톡으로 선물 링크가 전송됩니다.
            </p>
          </div>
        </label>

        {/* Ebook Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            bookReceiveType === 'EBOOK'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="bookReceiveType"
            value="EBOOK"
            checked={bookReceiveType === 'EBOOK'}
            onChange={(e) => setBookReceiveType(e.target.value)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">ebook</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              원하시는 플랫폼으로 전자책을 보내드립니다.
            </p>
          </div>
        </label>

        {/* Ebook Provider Selection */}
        {bookReceiveType === 'EBOOK' && (
          <div className="ml-8 space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ebook 플랫폼 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ebookProviders.map((provider) => (
                <label
                  key={provider.value}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    ebookProvider === provider.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="ebookProvider"
                    value={provider.value}
                    checked={ebookProvider === provider.value}
                    onChange={(e) => setEbookProvider(e.target.value)}
                  />
                  <span className="text-sm">{provider.label}</span>
                </label>
              ))}
            </div>
            {ebookProvider === 'OTHER' && (
              <input
                type="text"
                value={ebookProviderOther}
                onChange={(e) => setEbookProviderOther(e.target.value)}
                placeholder="플랫폼 이름을 입력해주세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            )}
          </div>
        )}

        {/* Already Own Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            bookReceiveType === 'OWN'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="bookReceiveType"
            value="OWN"
            checked={bookReceiveType === 'OWN'}
            onChange={(e) => setBookReceiveType(e.target.value)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">이미 책을 보유하고 있음</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              이미 해당 책을 가지고 계신 경우 선택해 주세요.
            </p>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !bookReceiveType || (bookReceiveType === 'EBOOK' && !ebookProvider)}
        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '저장 중...' : '저장하기'}
      </button>
    </form>
  )
}
