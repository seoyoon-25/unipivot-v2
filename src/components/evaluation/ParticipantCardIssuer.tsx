'use client'

import { useState } from 'react'
import { AlertTriangle, ThumbsUp, X, Check, Loader2 } from 'lucide-react'
import { issueCard } from '@/lib/actions/evaluation'

interface Props {
  programId: string
  userId: string
  userName: string
  sessionId?: string
  onClose: () => void
  onSuccess?: () => void
}

const WARNING_CATEGORIES = [
  { value: 'ABSENT', label: '무단 결석' },
  { value: 'LATE', label: '지각' },
  { value: 'UNPREPARED', label: '독후감 미제출' },
  { value: 'BEHAVIOR', label: '비매너 행동' },
  { value: 'OTHER', label: '기타' }
]

const PRAISE_CATEGORIES = [
  { value: 'GREAT_FACILITATION', label: '훌륭한 진행' },
  { value: 'ACTIVE_PARTICIPATION', label: '적극적인 참여' },
  { value: 'HELPFUL', label: '다른 참가자 도움' },
  { value: 'INSIGHTFUL', label: '통찰력 있는 발언' },
  { value: 'OTHER', label: '기타' }
]

export default function ParticipantCardIssuer({
  programId,
  userId,
  userName,
  sessionId,
  onClose,
  onSuccess
}: Props) {
  const [type, setType] = useState<'WARNING' | 'PRAISE'>('PRAISE')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const categories = type === 'WARNING' ? WARNING_CATEGORIES : PRAISE_CATEGORIES

  const handleSubmit = async () => {
    if (!category || !title) {
      alert('카테고리와 제목을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const result = await issueCard(programId, userId, type, {
        category,
        title,
        description: description || undefined,
        sessionId: sessionId || undefined
      })

      if ('error' in result) {
        alert(result.error)
      } else {
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      console.error('카드 발급 오류:', error)
      alert('카드 발급 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 헤더 */}
        <div
          className={`p-6 text-white ${
            type === 'WARNING'
              ? 'bg-gradient-to-r from-red-500 to-orange-500'
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {type === 'WARNING' ? (
                <>
                  <AlertTriangle className="w-6 h-6" />
                  경고 카드
                </>
              ) : (
                <>
                  <ThumbsUp className="w-6 h-6" />
                  칭찬 카드
                </>
              )}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 mt-2">대상: {userName}</p>
        </div>

        {/* 폼 */}
        <div className="p-6 space-y-5">
          {/* 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카드 종류
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setType('PRAISE')
                  setCategory('')
                }}
                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                  type === 'PRAISE'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                칭찬
              </button>
              <button
                onClick={() => {
                  setType('WARNING')
                  setCategory('')
                }}
                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                  type === 'WARNING'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                경고
              </button>
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                type === 'WARNING'
                  ? '예: 3회 연속 무단 결석'
                  : '예: 적극적인 토론 참여'
              }
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="추가 설명을 입력하세요..."
              className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* 경고 메시지 */}
          {type === 'WARNING' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
              <strong>주의:</strong> 경고 카드 3회 누적 시 보증금 환급이 제한됩니다.
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !category || !title}
              className={`flex-1 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                type === 'WARNING'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  카드 발급
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
