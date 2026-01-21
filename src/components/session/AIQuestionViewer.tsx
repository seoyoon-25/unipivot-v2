'use client'

import { useState, useEffect } from 'react'
import { Loader2, Copy, Check, Sparkles, RefreshCw } from 'lucide-react'
import {
  getAIGeneratedQuestions,
  generateDiscussionQuestions,
  markQuestionAsUsed
} from '@/lib/actions/ai-assistant'

interface AIQuestion {
  id: string
  question: string
  category: string
  reasoning: string | null
  isUsed: boolean
  usedAt: Date | null
}

interface Props {
  sessionId: string
}

export default function AIQuestionViewer({ sessionId }: Props) {
  const [questions, setQuestions] = useState<AIQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [sessionId])

  const loadQuestions = async () => {
    try {
      const data = await getAIGeneratedQuestions(sessionId)
      setQuestions(data)
    } catch (error) {
      console.error('질문 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateDiscussionQuestions(sessionId)
      if ('error' in result) {
        alert(result.error)
      } else {
        await loadQuestions()
      }
    } catch (error) {
      alert('질문 생성 중 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async (question: AIQuestion) => {
    await navigator.clipboard.writeText(question.question)
    setCopiedId(question.id)
    setTimeout(() => setCopiedId(null), 2000)

    // 사용 표시
    await markQuestionAsUsed(question.id)
    setQuestions(prev =>
      prev.map(q => (q.id === question.id ? { ...q, isUsed: true } : q))
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      INTRO: { label: '도입', color: 'bg-green-100 text-green-700' },
      DEEP: { label: '심화', color: 'bg-orange-100 text-orange-700' },
      APPLICATION: { label: '적용', color: 'bg-blue-100 text-blue-700' }
    }
    return labels[category] || { label: category, color: 'bg-gray-100 text-gray-700' }
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-6 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          AI 추천 토론 질문
        </h3>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              질문 생성
            </>
          )}
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">아직 생성된 질문이 없습니다.</p>
          <p className="text-sm mt-2">
            독후감이 제출되면 AI가 토론 질문을 생성할 수 있어요.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const category = getCategoryLabel(q.category)

            return (
              <div
                key={q.id}
                className={`
                  border rounded-lg p-4 transition-all
                  ${q.isUsed ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-sm'}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${category.color}`}
                      >
                        {category.label}
                      </span>
                      {q.isUsed && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          사용됨
                        </span>
                      )}
                    </div>

                    <p className="font-medium text-gray-900">{q.question}</p>

                    {q.reasoning && (
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">추천 이유:</span>{' '}
                        {q.reasoning}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(q)}
                    className={`
                      p-2 rounded-lg transition-colors flex-shrink-0
                      ${copiedId === q.id
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                      }
                    `}
                    title="질문 복사"
                  >
                    {copiedId === q.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
