'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Check, MessageSquare, Loader2 } from 'lucide-react'
import {
  generateDiscussionQuestions,
  getAIGeneratedQuestions,
  markQuestionAsUsed,
} from '@/lib/actions/ai-assistant'

interface QuestionGeneratorProps {
  sessionId: string
  reportCount: number
}

interface Question {
  id: string
  question: string
  category: string
  reasoning: string | null
  isUsed: boolean
  usedAt: Date | null
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  INTRO: { label: '도입', color: 'bg-green-100 text-green-700' },
  DEEP: { label: '심화', color: 'bg-purple-100 text-purple-700' },
  APPLICATION: { label: '적용', color: 'bg-blue-100 text-blue-700' },
}

export default function QuestionGenerator({ sessionId, reportCount }: QuestionGeneratorProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuestions()
  }, [sessionId])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const result = await getAIGeneratedQuestions(sessionId)
      setQuestions(result as Question[])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const result = await generateDiscussionQuestions(sessionId)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        await loadQuestions()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '질문 생성에 실패했습니다')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleUsed = async (questionId: string) => {
    try {
      await markQuestionAsUsed(questionId)
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, isUsed: true, usedAt: new Date() } : q
        )
      )
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Generate button */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">AI 토론 질문 생성</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              제출된 독후감 {reportCount}개를 분석하여 질문을 생성합니다
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || reportCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {questions.length > 0 ? '다시 생성' : '질문 생성'}
              </>
            )}
          </button>
        </div>
        {reportCount === 0 && (
          <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2">
            독후감이 아직 제출되지 않았습니다. 독후감이 제출된 후 질문을 생성해주세요.
          </p>
        )}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{error}</p>
        )}
      </div>

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q) => {
            const categoryInfo = CATEGORY_LABELS[q.category] || {
              label: q.category,
              color: 'bg-gray-100 text-gray-600',
            }

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  q.isUsed
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      {q.isUsed && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          사용됨
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 font-medium flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      {q.question}
                    </p>
                    {q.reasoning && (
                      <p className="text-xs text-gray-500 mt-2 ml-6">{q.reasoning}</p>
                    )}
                  </div>
                  {!q.isUsed && (
                    <button
                      onClick={() => handleToggleUsed(q.id)}
                      className="shrink-0 px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      사용
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {questions.length === 0 && !generating && (
        <div className="text-center py-8 text-gray-400 text-sm">
          아직 생성된 질문이 없습니다
        </div>
      )}
    </div>
  )
}
