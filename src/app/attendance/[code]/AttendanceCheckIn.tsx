'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Clock, AlertCircle } from 'lucide-react'

interface Props {
  session: {
    id: string
    sessionNo: number
    date: string
    title: string | null
    program: { id: string; title: string }
  }
  isExpired: boolean
  isParticipant: boolean
  participantId: string | null
  alreadyCheckedIn: boolean
  userName: string
}

export default function AttendanceCheckIn({
  session,
  isExpired,
  isParticipant,
  participantId,
  alreadyCheckedIn,
  userName
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(alreadyCheckedIn)
  const [error, setError] = useState<string | null>(null)

  const handleCheckIn = async () => {
    if (!participantId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          participantId
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '출석 체크 중 오류가 발생했습니다.')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Already checked in
  if (success) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">출석 완료!</h1>
        <p className="text-gray-500 mb-6">
          {userName}님, 출석이 확인되었습니다.
        </p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500">{session.program.title}</p>
          <p className="font-medium text-gray-900">
            {session.sessionNo}회차{session.title && ` - ${session.title}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(session.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </p>
        </div>
        <button
          onClick={() => router.push('/my')}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          마이페이지로 이동
        </button>
      </div>
    )
  }

  // QR Expired
  if (isExpired) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">QR 코드 만료</h1>
        <p className="text-gray-500 mb-6">
          이 QR 코드의 유효 시간이 지났습니다.<br />
          관리자에게 문의해주세요.
        </p>
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          홈으로 이동
        </button>
      </div>
    )
  }

  // Not a participant
  if (!isParticipant) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">참가자가 아닙니다</h1>
        <p className="text-gray-500 mb-6">
          이 프로그램의 참가자로 등록되어 있지 않습니다.<br />
          관리자에게 문의해주세요.
        </p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500">{session.program.title}</p>
          <p className="font-medium text-gray-900">
            {session.sessionNo}회차
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          홈으로 이동
        </button>
      </div>
    )
  }

  // Ready to check in
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">출석 체크</h1>
      <p className="text-gray-500 mb-6">
        {userName}님, 출석을 확인해주세요.
      </p>
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <p className="text-sm text-gray-500">{session.program.title}</p>
        <p className="font-medium text-gray-900">
          {session.sessionNo}회차{session.title && ` - ${session.title}`}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(session.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
          })}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? '확인 중...' : '출석 확인'}
      </button>
    </div>
  )
}
