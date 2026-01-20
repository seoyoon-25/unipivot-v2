'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Book,
  Edit2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { respondRSVP } from '@/lib/actions/rsvp'
import type { RSVPStatus } from '@/types/facilitator'
import { RSVP_STATUS_INFO } from '@/types/facilitator'

interface RSVPResponseFormProps {
  rsvpId: string
  userId: string
  currentStatus: RSVPStatus
  currentNote: string | null
  respondedAt: Date | null
  session: {
    id: string
    title: string | null
    date: Date
    location: string | null
    program: {
      id: string
      title: string
    }
  }
}

export function RSVPResponseForm({
  rsvpId,
  userId,
  currentStatus,
  currentNote,
  respondedAt,
  session,
}: RSVPResponseFormProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<RSVPStatus | null>(
    currentStatus !== 'PENDING' ? currentStatus : null
  )
  const [note, setNote] = useState(currentNote || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(currentStatus === 'PENDING')

  const handleSubmit = async () => {
    if (!selectedStatus) {
      setError('참석 여부를 선택해주세요.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await respondRSVP(rsvpId, userId, selectedStatus, note || undefined)
      setSuccess(true)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답 처리 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusOptions: { status: RSVPStatus; icon: React.ReactNode; color: string; selectedColor: string }[] = [
    {
      status: 'ATTENDING',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'border-gray-200 hover:border-green-300',
      selectedColor: 'border-green-500 bg-green-50 text-green-700',
    },
    {
      status: 'NOT_ATTENDING',
      icon: <XCircle className="w-8 h-8" />,
      color: 'border-gray-200 hover:border-red-300',
      selectedColor: 'border-red-500 bg-red-50 text-red-700',
    },
    {
      status: 'MAYBE',
      icon: <HelpCircle className="w-8 h-8" />,
      color: 'border-gray-200 hover:border-yellow-300',
      selectedColor: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    },
  ]

  // 날짜 포맷
  const sessionDate = new Date(session.date)
  const dateStr = sessionDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const timeStr = sessionDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // 이미 응답 완료한 경우
  if (!isEditing && currentStatus !== 'PENDING') {
    const statusInfo = RSVP_STATUS_INFO[currentStatus]
    const option = statusOptions.find(o => o.status === currentStatus)

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto">
          {/* 프로그램 헤더 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{session.program.title}</h1>
                <p className="text-sm text-gray-500">{session.title || `회차`}</p>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 rounded-lg text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{dateStr}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{timeStr}</span>
              </div>
              {session.location && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{session.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* 응답 완료 상태 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className={cn(
              'flex items-center justify-center flex-col gap-3 p-6 rounded-xl border-2',
              option?.selectedColor
            )}>
              {option?.icon}
              <div className="text-center">
                <p className="font-bold text-lg">{statusInfo.emoji} {statusInfo.name}</p>
                <p className="text-sm opacity-80">
                  {respondedAt
                    ? `${new Date(respondedAt).toLocaleDateString('ko-KR')} 응답`
                    : '응답 완료'}
                </p>
              </div>
            </div>

            {currentNote && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{currentNote}</p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full mt-4 gap-2"
            >
              <Edit2 className="w-4 h-4" />
              응답 수정하기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 성공 화면
  if (success) {
    const statusInfo = selectedStatus ? RSVP_STATUS_INFO[selectedStatus] : null
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">응답 완료!</h1>
          <p className="text-gray-500 mb-2">
            {statusInfo?.emoji} {statusInfo?.name}으로 등록되었습니다.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            응답은 언제든 수정할 수 있습니다.
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/mypage')} className="w-full">
              마이페이지로 이동
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false)
                setIsEditing(false)
              }}
              className="w-full"
            >
              응답 확인하기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{session.program.title}</h1>
              <p className="text-sm text-gray-500">{session.title || `회차`}</p>
            </div>
          </div>

          {/* 모임 정보 */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{timeStr}</span>
            </div>
            {session.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{session.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* 응답 선택 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">참석하시나요?</h2>

          <div className="grid grid-cols-3 gap-3">
            {statusOptions.map((option) => {
              const info = RSVP_STATUS_INFO[option.status]
              const isSelected = selectedStatus === option.status

              return (
                <button
                  key={option.status}
                  onClick={() => setSelectedStatus(option.status)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    isSelected ? option.selectedColor : option.color
                  )}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{info.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 메모 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <Label htmlFor="note" className="font-semibold text-gray-900">
            메모 (선택)
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              selectedStatus === 'NOT_ATTENDING'
                ? '불참 사유를 적어주세요'
                : selectedStatus === 'MAYBE'
                  ? '미정 사유를 적어주세요'
                  : '전달할 내용이 있으면 적어주세요'
            }
            rows={3}
            className="mt-2"
          />
        </div>

        {/* 에러 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="space-y-2">
          <Button
            onClick={handleSubmit}
            disabled={!selectedStatus || submitting}
            className="w-full py-6 text-lg rounded-xl"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                처리 중...
              </>
            ) : (
              '응답하기'
            )}
          </Button>

          {currentStatus !== 'PENDING' && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="w-full"
            >
              취소
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          응답은 언제든 변경할 수 있습니다
        </p>
      </div>
    </div>
  )
}
