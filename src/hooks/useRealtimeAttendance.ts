'use client'

import { useState, useEffect, useCallback } from 'react'

interface AttendanceRecord {
  id: string
  participantId: string
  participantName: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  checkedAt: string | null
  checkMethod: string | null
}

interface AttendanceStats {
  total: number
  present: number
  late: number
  absent: number
  excused: number
  attendanceRate: number
}

interface UseRealtimeAttendanceResult {
  attendances: AttendanceRecord[]
  stats: AttendanceStats
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRealtimeAttendance(
  sessionId: string,
  pollingInterval: number = 5000
): UseRealtimeAttendanceResult {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    attendanceRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendances = useCallback(async () => {
    if (!sessionId) return

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/attendances`)
      if (!res.ok) {
        throw new Error('출석 현황을 불러오는데 실패했습니다.')
      }
      const data = await res.json()

      setAttendances(data.attendances || [])
      setStats(data.stats || {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        attendanceRate: 0,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  // 초기 로드 및 폴링
  useEffect(() => {
    fetchAttendances()

    const interval = setInterval(fetchAttendances, pollingInterval)

    return () => clearInterval(interval)
  }, [fetchAttendances, pollingInterval])

  return {
    attendances,
    stats,
    loading,
    error,
    refetch: fetchAttendances,
  }
}
