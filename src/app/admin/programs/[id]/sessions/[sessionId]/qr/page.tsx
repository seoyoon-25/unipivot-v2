'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import {
  ArrowLeft,
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createAttendanceQR,
  refreshAttendanceQR,
  getSessionAttendances,
} from '@/lib/actions/attendance'
import { getRemainingTime, formatExpiryTime, generateAttendanceURL } from '@/lib/utils/qr'
import { StatusBadge, AttendanceStatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ programId: string; sessionId: string }>
}

interface Participant {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  attendance: {
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'
    checkInTime: Date | null
    lateMinutes: number | null
    notes: string | null
  } | null
}

interface SessionData {
  session: {
    id: string
    sessionNumber: number
    title: string | null
    date: Date
  }
  participants: Participant[]
  stats: {
    total: number
    present: number
    late: number
    absent: number
    excused: number
  }
}

export default function QRCodePage({ params }: PageProps) {
  const { programId, sessionId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [qrToken, setQrToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate QR code on mount
  useEffect(() => {
    const initQR = async () => {
      try {
        const result = await createAttendanceQR(sessionId)
        setQrToken(result.token)
        setExpiresAt(result.expiresAt)
      } catch (error) {
        toast({
          title: '오류',
          description: error instanceof Error ? error.message : 'QR 생성 실패',
          variant: 'destructive',
        })
      }
    }

    initQR()
  }, [sessionId, toast])

  // Countdown timer
  useEffect(() => {
    if (!qrToken) return

    const updateRemaining = () => {
      const remaining = getRemainingTime(qrToken)
      setRemainingTime(remaining)

      // Auto refresh when 30 seconds remaining
      if (remaining === 30 && !isRefreshing) {
        handleRefresh()
      }
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 1000)

    return () => clearInterval(interval)
  }, [qrToken, isRefreshing])

  // Poll for attendance updates
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const data = await getSessionAttendances(sessionId)
        setSessionData(data)
      } catch (error) {
        console.error('Failed to fetch attendances:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendances()
    const interval = setInterval(fetchAttendances, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [sessionId])

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const result = await refreshAttendanceQR(sessionId)
      setQrToken(result.token)
      setExpiresAt(result.expiresAt)
      toast({
        title: 'QR 코드 갱신',
        description: '새로운 QR 코드가 생성되었습니다',
      })
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : 'QR 갱신 실패',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const qrUrl = qrToken
    ? generateAttendanceURL(qrToken, typeof window !== 'undefined' ? window.location.origin : '')
    : ''

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Button>
          <div>
            <h1 className="text-2xl font-bold">QR 출석</h1>
            {sessionData && (
              <p className="text-sm text-gray-500">
                {sessionData.session.sessionNumber}회차
                {sessionData.session.title && ` - ${sessionData.session.title}`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>출석 QR 코드</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qrToken ? (
              <>
                <div className="rounded-xl border-4 border-primary/20 bg-white p-4">
                  <QRCode value={qrUrl} size={256} />
                </div>

                {/* Timer */}
                <div
                  className={cn(
                    'mt-4 flex items-center gap-2 rounded-lg px-4 py-2',
                    remainingTime <= 60
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  )}
                >
                  <Clock className="h-5 w-5" />
                  <span className="text-lg font-mono font-bold">
                    {formatTime(remainingTime)}
                  </span>
                  <span className="text-sm">남음</span>
                </div>

                {/* Refresh button */}
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-4"
                  variant="outline"
                >
                  {isRefreshing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  QR 코드 갱신
                </Button>

                <p className="mt-4 text-center text-sm text-gray-500">
                  참가자들이 이 QR 코드를 스캔하면<br />
                  자동으로 출석 처리됩니다
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center py-12">
                <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">QR 코드를 불러오는 중...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance List Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                출석 현황
              </CardTitle>
              {sessionData && (
                <span className="text-sm text-gray-500">
                  {sessionData.stats.present + sessionData.stats.late}/
                  {sessionData.stats.total}명
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Stats */}
            {sessionData && (
              <div className="mb-4 flex gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span>출석 {sessionData.stats.present}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>지각 {sessionData.stats.late}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span>미체크 {sessionData.stats.absent}</span>
                </div>
              </div>
            )}

            {/* Participant List */}
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {sessionData?.participants.map((participant) => (
                <div
                  key={participant.user.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3',
                    participant.attendance?.status === 'PRESENT' &&
                      'border-green-200 bg-green-50',
                    participant.attendance?.status === 'LATE' &&
                      'border-yellow-200 bg-yellow-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {participant.attendance ? (
                      <CheckCircle
                        className={cn(
                          'h-5 w-5',
                          participant.attendance.status === 'PRESENT'
                            ? 'text-green-600'
                            : participant.attendance.status === 'LATE'
                              ? 'text-yellow-600'
                              : 'text-gray-400'
                        )}
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <p className="font-medium">
                        {participant.user.name || '이름 없음'}
                      </p>
                      {participant.attendance?.checkInTime && (
                        <p className="text-xs text-gray-500">
                          {new Date(participant.attendance.checkInTime).toLocaleTimeString(
                            'ko-KR',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                          {participant.attendance.lateMinutes && participant.attendance.lateMinutes > 0 && (
                            <span className="ml-1 text-yellow-600">
                              (+{participant.attendance.lateMinutes}분)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  {participant.attendance && (
                    <StatusBadge
                      status={participant.attendance.status}
                      size="sm"
                    />
                  )}
                </div>
              ))}

              {sessionData?.participants.length === 0 && (
                <p className="py-8 text-center text-gray-500">
                  참가자가 없습니다
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
