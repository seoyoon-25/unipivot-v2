'use client'

import { useState } from 'react'
import { Star, X, Loader2, Check } from 'lucide-react'
import { createSeasonEvaluation } from '@/lib/actions/evaluation'

interface Props {
  programId: string
  userId: string
  userName: string
  existingEvaluation?: {
    overallRating: number
    participationScore: number
    preparationScore: number
    cooperationScore: number
    contributionScore: number
    strengths: string | null
    improvements: string | null
    recommendation: string
  }
  onClose: () => void
  onSuccess?: () => void
}

type Recommendation = 'PRIORITY' | 'WELCOME' | 'HOLD' | 'RESTRICT'

const RECOMMENDATIONS = [
  { value: 'PRIORITY', label: '우선 승인', emoji: '🌟', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'WELCOME', label: '환영', emoji: '✅', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'HOLD', label: '보류', emoji: '⏸️', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'RESTRICT', label: '제한', emoji: '❌', color: 'bg-red-100 text-red-800 border-red-300' }
]

export default function SeasonEvaluationForm({
  programId,
  userId,
  userName,
  existingEvaluation,
  onClose,
  onSuccess
}: Props) {
  const [formData, setFormData] = useState({
    overallRating: existingEvaluation?.overallRating || 3,
    participationScore: existingEvaluation?.participationScore || 3,
    preparationScore: existingEvaluation?.preparationScore || 3,
    cooperationScore: existingEvaluation?.cooperationScore || 3,
    contributionScore: existingEvaluation?.contributionScore || 3,
    strengths: existingEvaluation?.strengths || '',
    improvements: existingEvaluation?.improvements || '',
    recommendation: (existingEvaluation?.recommendation as Recommendation) || 'WELCOME'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const result = await createSeasonEvaluation(programId, userId, {
        ...formData,
        strengths: formData.strengths || undefined,
        improvements: formData.improvements || undefined
      })

      if ('error' in result) {
        alert(result.error)
      } else {
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      console.error('평가 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const renderStarRating = (
    value: number,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-bold text-gray-700">{value}/5</span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">시즌 종합 평가</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 mt-2">참가자: {userName}</p>
        </div>

        {/* 폼 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* 종합 평가 */}
          {renderStarRating(
            formData.overallRating,
            v => setFormData(prev => ({ ...prev, overallRating: v })),
            '종합 평가 ⭐'
          )}

          <hr className="my-4" />

          {/* 세부 평가 */}
          <p className="text-sm font-medium text-gray-500 mb-4">세부 평가</p>

          {renderStarRating(
            formData.participationScore,
            v => setFormData(prev => ({ ...prev, participationScore: v })),
            '참여도'
          )}

          {renderStarRating(
            formData.preparationScore,
            v => setFormData(prev => ({ ...prev, preparationScore: v })),
            '준비성 (독후감 제출 등)'
          )}

          {renderStarRating(
            formData.cooperationScore,
            v => setFormData(prev => ({ ...prev, cooperationScore: v })),
            '협조성'
          )}

          {renderStarRating(
            formData.contributionScore,
            v => setFormData(prev => ({ ...prev, contributionScore: v })),
            '기여도 (진행, 토론 참여 등)'
          )}

          <hr className="my-4" />

          {/* 코멘트 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              강점
            </label>
            <textarea
              value={formData.strengths}
              onChange={e =>
                setFormData(prev => ({ ...prev, strengths: e.target.value }))
              }
              placeholder="이 참가자의 강점을 적어주세요..."
              className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              개선점
            </label>
            <textarea
              value={formData.improvements}
              onChange={e =>
                setFormData(prev => ({ ...prev, improvements: e.target.value }))
              }
              placeholder="개선이 필요한 점을 적어주세요..."
              className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <hr className="my-4" />

          {/* 재참여 권장 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              다음 시즌 재참여 권장
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDATIONS.map(rec => (
                <button
                  key={rec.value}
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      recommendation: rec.value as Recommendation
                    }))
                  }
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    formData.recommendation === rec.value
                      ? rec.color + ' border-current'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{rec.emoji}</span>
                  {rec.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                {existingEvaluation ? '수정하기' : '저장하기'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
