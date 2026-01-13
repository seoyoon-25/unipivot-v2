'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Save } from 'lucide-react'

interface SurveyRequest {
  id: string
  startDate: Date
  endDate: Date
  questionCount: number
  estimatedTime: number
  serviceFee: number | null
  participantFee: number | null
  requirements: string
  requesterType: string
  requesterName: string
  email: string
  phone: string
  status: string
  adminNote: string | null
  createdAt: Date
}

interface Props {
  request: SurveyRequest
  onClose: () => void
}

export default function SurveyDetailModal({ request, onClose }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(request.status)
  const [adminNote, setAdminNote] = useState(request.adminNote || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/cooperation/survey/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      })

      if (!res.ok) throw new Error('저장 실패')

      router.refresh()
      onClose()
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">설문·인터뷰 요청 상세</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 설문 정보 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">설문 정보</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">설문 기간</p>
                  <p className="font-medium">
                    {new Date(request.startDate).toLocaleDateString('ko-KR')} ~{' '}
                    {new Date(request.endDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">문항수 / 소요시간</p>
                  <p className="font-medium">{request.questionCount}문항 / {request.estimatedTime}분</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">대행 비용</p>
                  <p className="font-medium">{request.serviceFee ? `${request.serviceFee}만원` : '협의'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">참가자 사례비</p>
                  <p className="font-medium">{request.participantFee ? `${request.participantFee}만원/인` : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 요청사항 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">요청사항</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{request.requirements}</p>
            </div>
          </div>

          {/* 요청자 정보 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">요청자 정보</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">요청구분</p>
                  <p className="font-medium">{request.requesterType === 'INDIVIDUAL' ? '개인' : '기관'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">요청자명</p>
                  <p className="font-medium">{request.requesterName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-medium">{request.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-medium">{request.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 관리자 설정 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">관리자 설정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="PENDING">대기</option>
                  <option value="REVIEWING">검토중</option>
                  <option value="IN_PROGRESS">진행중</option>
                  <option value="COMPLETED">완료</option>
                  <option value="REJECTED">거절</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">관리자 메모</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="내부 메모 (요청자에게 표시되지 않음)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* 접수일 */}
          <div className="text-sm text-gray-500">
            접수일: {new Date(request.createdAt).toLocaleString('ko-KR')}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
