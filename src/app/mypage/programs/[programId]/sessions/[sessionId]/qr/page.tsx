'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import QRCode from 'react-qr-code'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createAttendanceQR, getSessionAttendances } from '@/lib/actions/attendance'

interface SessionAttendanceData {
  session: {
    id: string
    sessionNumber: number
    title: string | null
    date: Date | null
  }
  participants: Array<{
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
    attendance: {
      status: string
      checkInTime: Date | null
      lateMinutes: number | null
      notes: string | null
    } | null
  }>
  stats: {
    total: number
    present: number
    late: number
    absent: number
    excused: number
  }
}

interface QRData {
  token: string
  expiresAt: Date
  url: string
}

export default function QRAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const programId = params.programId as string
  const sessionId = params.sessionId as string

  const [qrData, setQrData] = useState<QRData | null>(null)
  const [attendanceData, setAttendanceData] = useState<SessionAttendanceData | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 출석 목록 조회
  const fetchAttendances = useCallback(async () => {
    try {
      const data = await getSessionAttendances(sessionId)
      setAttendanceData(data)
    } catch (error) {
      console.error('출석 목록 조회 오류:', error)
    }
  }, [sessionId])

  useEffect(() => {
    if (session?.user?.id) {
      fetchAttendances()
      setLoading(false)
    }
  }, [session?.user?.id, fetchAttendances])

  // QR 생성
  const handleGenerateQR = async () => {
    setGenerating(true)
    try {
      const result = await createAttendanceQR(sessionId)
      if (result && !('error' in result)) {
        setQrData({
          token: result.token,
          expiresAt: result.expiresAt,
          url: `${window.location.origin}/attendance/${result.token}`
        })
        // 남은 시간 설정 (10분)
        setRemainingTime(600)
      }
    } catch (error) {
      console.error('QR 생성 오류:', error)
    } finally {
      setGenerating(false)
    }
  }

  // 타이머
  useEffect(() => {
    if (remainingTime <= 0) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setQrData(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingTime])

  // 실시간 출석 업데이트 (3초마다 폴링)
  useEffect(() => {
    if (!qrData) return

    const interval = setInterval(() => {
      fetchAttendances()
    }, 3000)

    return () => clearInterval(interval)
  }, [qrData, fetchAttendances])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const stats = attendanceData?.stats || { total: 0, present: 0, late: 0, absent: 0, excused: 0 }
  const participants = attendanceData?.participants || []

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          &larr; 돌아가기
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-2">QR 출석 체크</h1>
      {attendanceData?.session && (
        <p className="text-gray-600 mb-6">
          {attendanceData.session.sessionNumber}회차 - {attendanceData.session.title || '회차'}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR 코드 */}
        <Card>
          <CardHeader>
            <CardTitle>QR 코드</CardTitle>
            <CardDescription>
              참가자들이 이 QR 코드를 스캔하여 출석합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qrData ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCode value={qrData.url} size={200} />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-2xl font-mono font-bold text-blue-600">
                    {formatTime(remainingTime)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">남은 시간</p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleGenerateQR}
                  disabled={generating}
                >
                  {generating ? 'QR 생성 중...' : 'QR 새로 생성'}
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  QR 코드를 생성하여 출석을 시작하세요
                </p>
                <Button onClick={handleGenerateQR} disabled={generating}>
                  {generating ? 'QR 생성 중...' : 'QR 코드 생성'}
                </Button>
                <p className="text-sm text-gray-400 mt-2">
                  QR 코드는 10분간 유효합니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 출석 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>실시간 출석 현황</CardTitle>
            <CardDescription>
              출석: {stats.present}명 | 지각: {stats.late}명 | 총: {stats.total}명
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  참가자 정보가 없습니다
                </p>
              ) : (
                participants.map((participant) => (
                  <div
                    key={participant.user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {participant.user.image ? (
                        <img
                          src={participant.user.image}
                          alt={participant.user.name || ''}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {participant.user.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">
                        {participant.user.name || '이름 없음'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.attendance ? (
                        <Badge
                          variant={
                            participant.attendance.status === 'PRESENT'
                              ? 'default'
                              : participant.attendance.status === 'LATE'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            participant.attendance.status === 'PRESENT'
                              ? 'bg-green-100 text-green-800'
                              : participant.attendance.status === 'LATE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : participant.attendance.status === 'EXCUSED'
                              ? 'bg-blue-100 text-blue-800'
                              : ''
                          }
                        >
                          {participant.attendance.status === 'PRESENT'
                            ? '출석'
                            : participant.attendance.status === 'LATE'
                            ? '지각'
                            : participant.attendance.status === 'ABSENT'
                            ? '결석'
                            : participant.attendance.status === 'EXCUSED'
                            ? '사유'
                            : participant.attendance.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400">
                          미확인
                        </Badge>
                      )}
                      {participant.attendance?.checkInTime && (
                        <span className="text-xs text-gray-400">
                          {new Date(participant.attendance.checkInTime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 출석 통계 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>출석 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600">총 인원</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-sm text-gray-600">출석</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-sm text-gray-600">지각</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-sm text-gray-600">결석/미확인</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.excused}</p>
              <p className="text-sm text-gray-600">사유</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
