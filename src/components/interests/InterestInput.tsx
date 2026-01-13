'use client'

import { useState, useEffect } from 'react'
import { Send, User, UserCircle, EyeOff } from 'lucide-react'
import { useSession } from 'next-auth/react'

type Visibility = 'ANONYMOUS' | 'NICKNAME' | 'MEMBER'

interface InterestInputProps {
  onSubmit?: (data: { keyword: string; content?: string }) => void
  className?: string
}

export function InterestInput({ onSubmit, className = '' }: InterestInputProps) {
  const { data: session } = useSession()
  const [keyword, setKeyword] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('ANONYMOUS')
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showOptions, setShowOptions] = useState(false)

  // 회원인 경우 기본값을 MEMBER로
  useEffect(() => {
    if (session?.user) {
      setVisibility('MEMBER')
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keyword.trim()) {
      setMessage({ type: 'error', text: '관심 키워드를 입력해주세요' })
      return
    }

    if (visibility === 'NICKNAME' && !nickname.trim()) {
      setMessage({ type: 'error', text: '닉네임을 입력해주세요' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          content: content.trim() || undefined,
          visibility,
          nickname: visibility === 'NICKNAME' ? nickname.trim() : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: '관심사가 등록되었습니다!' })
        setKeyword('')
        setContent('')
        setShowOptions(false)
        onSubmit?.({ keyword: keyword.trim(), content: content.trim() })
      } else {
        setMessage({ type: 'error', text: data.error || '등록에 실패했습니다' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibilityOptions = [
    { value: 'ANONYMOUS', label: '익명', icon: EyeOff, desc: '이름 없이 표시' },
    { value: 'NICKNAME', label: '닉네임', icon: User, desc: '원하는 닉네임으로' },
    ...(session?.user ? [{ value: 'MEMBER', label: '실명', icon: UserCircle, desc: session.user.name || '회원 이름' }] : []),
  ] as const

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        어떤 것에 관심이 있으세요?
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 키워드 입력 */}
        <div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 통일교육, 진로상담, 독서모임..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-lg"
            disabled={isSubmitting}
          />
        </div>

        {/* 추가 내용 (선택) */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="더 자세히 알려주세요 (선택사항)"
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* 옵션 토글 버튼 */}
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showOptions ? '옵션 닫기 ▲' : '표시 방식 선택 ▼'}
        </button>

        {/* 공개 범위 선택 */}
        {showOptions && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">표시 방식</p>
            <div className="flex flex-wrap gap-2">
              {visibilityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisibility(opt.value as Visibility)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    visibility === opt.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* 닉네임 입력 */}
            {visibility === 'NICKNAME' && (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                disabled={isSubmitting}
              />
            )}

            <p className="text-xs text-gray-400">
              {visibility === 'ANONYMOUS' && '익명으로 표시되어 누가 입력했는지 알 수 없습니다'}
              {visibility === 'NICKNAME' && '입력한 닉네임으로 표시됩니다'}
              {visibility === 'MEMBER' && '회원 이름으로 표시됩니다'}
            </p>
          </div>
        )}

        {/* 메시지 */}
        {message && (
          <div
            className={`px-4 py-2 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting || !keyword.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              관심사 등록하기
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-4 text-center">
        하루에 3개까지 등록할 수 있습니다
      </p>
    </div>
  )
}
