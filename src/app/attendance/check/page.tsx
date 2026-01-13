'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

interface AttendanceResult {
  success?: boolean
  alreadyCheckedIn?: boolean
  message?: string
  error?: string
  attendance?: {
    memberName: string
    programTitle: string
    sessionNumber: number
    sessionTitle?: string
    sessionDate: string
    checkedAt: string
    status: string
    isLate?: boolean
  }
}

function AttendanceCheckContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const { data: session, status: sessionStatus } = useSession()
  const [result, setResult] = useState<AttendanceResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === 'loading') return

    if (sessionStatus === 'unauthenticated') {
      // 로그인 페이지로 리다이렉트 (토큰 유지)
      const callbackUrl = encodeURIComponent(`/attendance/check?token=${token}`)
      router.push(`/login?callbackUrl=${callbackUrl}`)
      return
    }

    if (!token) {
      setResult({ error: 'MISSING_TOKEN', message: 'QR 토큰이 없습니다.' })
      setLoading(false)
      return
    }

    // 출석 체크 API 호출
    checkAttendance()
  }, [sessionStatus, token, router])

  const checkAttendance = async () => {
    try {
      const res = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  // 로딩 중
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">출석 처리 중...</p>
        </div>
      </div>
    )
  }

  // 성공
  if (result?.success) {
    const isLate = result.attendance?.isLate || result.attendance?.status === 'LATE'

    return (
      <div className={`min-h-screen flex items-center justify-center ${isLate ? 'bg-amber-50' : 'bg-green-50'}`}>
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm mx-4">
          <div className="mb-4">
            {isLate ? (
              <Clock className="w-16 h-16 text-amber-500 mx-auto" />
            ) : (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            )}
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isLate ? 'text-amber-600' : 'text-green-600'}`}>
            {isLate ? '지각 출석!' : '출석 완료!'}
          </h1>

          {result.alreadyCheckedIn && (
            <div className="mb-4 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm rounded-full inline-block">
              이미 출석 처리됨
            </div>
          )}

          <div className="text-gray-600 space-y-2 mt-4">
            <p className="font-medium text-lg">{result.attendance?.programTitle}</p>
            <p className="text-gray-500">
              {result.attendance?.sessionNumber}회차
              {result.attendance?.sessionTitle && ` - ${result.attendance.sessionTitle}`}
            </p>
            <p className="text-sm text-gray-400">{result.attendance?.sessionDate}</p>
            <div className="pt-3 border-t mt-3">
              <p className="text-sm">
                <span className="text-gray-500">{result.attendance?.memberName}님</span>
              </p>
              <p className="text-sm text-gray-500">
                {result.attendance?.checkedAt &&
                  format(new Date(result.attendance.checkedAt), 'HH:mm', { locale: ko })
                } 출석
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/my/programs')}
            className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
          >
            내 프로그램 보기
          </button>
        </div>
      </div>
    )
  }

  // 에러
  const errorMessages: Record<string, { icon: React.ReactNode; title: string; bg: string }> = {
    LOGIN_REQUIRED: {
      icon: <AlertCircle className="w-16 h-16 text-blue-500 mx-auto" />,
      title: '로그인 필요',
      bg: 'bg-blue-50',
    },
    INVALID_TOKEN: {
      icon: <XCircle className="w-16 h-16 text-red-500 mx-auto" />,
      title: 'QR 오류',
      bg: 'bg-red-50',
    },
    EXPIRED_TOKEN: {
      icon: <Clock className="w-16 h-16 text-amber-500 mx-auto" />,
      title: 'QR 만료',
      bg: 'bg-amber-50',
    },
    NOT_PARTICIPANT: {
      icon: <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />,
      title: '참가 불가',
      bg: 'bg-orange-50',
    },
    default: {
      icon: <XCircle className="w-16 h-16 text-red-500 mx-auto" />,
      title: '출석 실패',
      bg: 'bg-red-50',
    },
  }

  const errorInfo = errorMessages[result?.error || 'default'] || errorMessages.default

  return (
    <div className={`min-h-screen flex items-center justify-center ${errorInfo.bg}`}>
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm mx-4">
        <div className="mb-4">{errorInfo.icon}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{errorInfo.title}</h1>
        <p className="text-gray-600">{result?.message}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}

export default function AttendanceCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AttendanceCheckContent />
    </Suspense>
  )
}
