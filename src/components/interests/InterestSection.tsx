'use client'

import { useState, useCallback } from 'react'
import { InterestInput } from './InterestInput'
import { QuickSelectButtons } from './QuickSelectButtons'
import { WordCloud } from './WordCloud'
import { TopInterests } from './TopInterests'
import { KeywordDetailModal } from './KeywordDetailModal'

interface InterestSectionProps {
  className?: string
}

export function InterestSection({ className = '' }: InterestSectionProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [inputKeyword, setInputKeyword] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleKeywordSelect = useCallback((keyword: string) => {
    setInputKeyword(keyword)
    // 키워드 입력 필드에 자동 입력되도록 이벤트 발생
    const inputElement = document.querySelector('input[placeholder*="통일교육"]') as HTMLInputElement
    if (inputElement) {
      inputElement.value = keyword
      inputElement.dispatchEvent(new Event('input', { bubbles: true }))
      inputElement.focus()
    }
  }, [])

  const handleKeywordClick = useCallback((keyword: string) => {
    setSelectedKeyword(keyword)
  }, [])

  const handleSubmitSuccess = useCallback(() => {
    // 새로고침 트리거
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <section className={`py-12 bg-gradient-to-b from-gray-50 to-white ${className}`}>
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            요즘 무엇이 궁금하세요?
          </h2>
          <p className="text-gray-600">
            여러분의 관심사를 알려주세요. 함께 나누고 프로그램으로 연결해드릴게요!
          </p>
        </div>

        {/* 메인 레이아웃 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 왼쪽: 입력 영역 */}
          <div className="space-y-6">
            {/* 관심사 입력 */}
            <InterestInput onSubmit={handleSubmitSuccess} />

            {/* 빠른 선택 */}
            <QuickSelectButtons onSelect={handleKeywordSelect} />
          </div>

          {/* 오른쪽: 시각화 영역 */}
          <div className="space-y-6">
            {/* 워드클라우드 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                지금 많이 궁금해하는 것들
              </h3>
              <WordCloud key={`wordcloud-${refreshKey}`} onKeywordClick={handleKeywordClick} />
            </div>

            {/* 인기 순위 */}
            <TopInterests key={`top-${refreshKey}`} onKeywordClick={handleKeywordClick} />
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            입력하신 관심사는 통계로 활용되며, 관련 프로그램 개설에 반영됩니다.
          </p>
          <p className="mt-1">
            알림을 신청하시면 관련 프로그램이 열릴 때 알려드립니다.
          </p>
        </div>
      </div>

      {/* 키워드 상세 모달 */}
      <KeywordDetailModal
        keyword={selectedKeyword || ''}
        isOpen={!!selectedKeyword}
        onClose={() => setSelectedKeyword(null)}
      />
    </section>
  )
}
