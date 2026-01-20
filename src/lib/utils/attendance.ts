/**
 * 출석 상태 결정 유틸리티
 *
 * 출석 기준:
 * - 0-10분: 출석 (PRESENT)
 * - 10-15분: 지각 (LATE)
 * - 15분+: 결석 (ABSENT)
 */

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'

const LATE_THRESHOLD_MINUTES = 10 // 지각 기준 (분)
const ABSENT_THRESHOLD_MINUTES = 15 // 결석 기준 (분)

/**
 * 출석 상태 결정
 * @param sessionStartTime 세션 시작 시간
 * @param checkInTime 체크인 시간
 * @returns 출석 상태
 */
export function determineAttendanceStatus(
  sessionStartTime: Date,
  checkInTime: Date
): AttendanceStatus {
  const diffMs = checkInTime.getTime() - sessionStartTime.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes <= LATE_THRESHOLD_MINUTES) {
    return 'PRESENT'
  } else if (diffMinutes <= ABSENT_THRESHOLD_MINUTES) {
    return 'LATE'
  } else {
    return 'ABSENT'
  }
}

/**
 * 지각 시간 계산 (분)
 * @param sessionStartTime 세션 시작 시간
 * @param checkInTime 체크인 시간
 * @returns 지각 시간 (분), 음수면 일찍 도착
 */
export function calculateLateMinutes(
  sessionStartTime: Date,
  checkInTime: Date
): number {
  const diffMs = checkInTime.getTime() - sessionStartTime.getTime()
  return Math.floor(diffMs / (1000 * 60))
}

/**
 * 출석 상태 레이블
 */
export function getAttendanceLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return '출석'
    case 'LATE':
      return '지각'
    case 'ABSENT':
      return '결석'
    case 'EXCUSED':
      return '공결'
    default:
      return '-'
  }
}

/**
 * 출석 상태 색상 클래스
 */
export function getAttendanceColor(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'text-green-600 bg-green-100'
    case 'LATE':
      return 'text-yellow-600 bg-yellow-100'
    case 'ABSENT':
      return 'text-red-600 bg-red-100'
    case 'EXCUSED':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * 출석 가능 시간 확인
 * @param sessionStartTime 세션 시작 시간
 * @param sessionEndTime 세션 종료 시간 (옵션)
 * @param currentTime 현재 시간
 * @returns 출석 가능 여부
 */
export function canCheckIn(
  sessionStartTime: Date,
  sessionEndTime: Date | null,
  currentTime: Date = new Date()
): boolean {
  // 세션 시작 30분 전부터 체크인 가능
  const earliestCheckIn = new Date(sessionStartTime.getTime() - 30 * 60 * 1000)

  // 세션 종료 시간이 없으면 시작 후 2시간까지 허용
  const latestCheckIn = sessionEndTime
    ? sessionEndTime
    : new Date(sessionStartTime.getTime() + 2 * 60 * 60 * 1000)

  return currentTime >= earliestCheckIn && currentTime <= latestCheckIn
}

/**
 * 출석 통계 계산
 */
export interface AttendanceStats {
  present: number
  late: number
  absent: number
  excused: number
  total: number
  attendanceRate: number // (present + late) / total * 100
}

export function calculateAttendanceStats(
  attendances: { status: AttendanceStatus }[]
): AttendanceStats {
  const stats: AttendanceStats = {
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    total: attendances.length,
    attendanceRate: 0,
  }

  attendances.forEach((a) => {
    switch (a.status) {
      case 'PRESENT':
        stats.present++
        break
      case 'LATE':
        stats.late++
        break
      case 'ABSENT':
        stats.absent++
        break
      case 'EXCUSED':
        stats.excused++
        break
    }
  })

  if (stats.total > 0) {
    stats.attendanceRate = Math.round(
      ((stats.present + stats.late + stats.excused) / stats.total) * 100
    )
  }

  return stats
}

/**
 * 출석 체크인 결과 메시지
 */
export function getCheckInMessage(
  status: AttendanceStatus,
  lateMinutes?: number
): string {
  switch (status) {
    case 'PRESENT':
      return '출석이 완료되었습니다! 🎉'
    case 'LATE':
      return `지각 처리되었습니다. (${lateMinutes}분 지각)`
    case 'ABSENT':
      return '결석 처리됩니다. 진행자에게 문의해주세요.'
    default:
      return '출석 처리되었습니다.'
  }
}

/**
 * 남은 출석 가능 시간 계산
 */
export function getRemainingCheckInTime(
  sessionStartTime: Date,
  sessionEndTime: Date | null,
  currentTime: Date = new Date()
): number {
  const latestCheckIn = sessionEndTime
    ? sessionEndTime
    : new Date(sessionStartTime.getTime() + 2 * 60 * 60 * 1000)

  const remainingMs = latestCheckIn.getTime() - currentTime.getTime()
  return Math.max(0, Math.floor(remainingMs / 1000))
}

/**
 * 세션까지 남은 시간 포맷
 */
export function formatTimeUntilSession(sessionStartTime: Date): string {
  const now = new Date()
  const diffMs = sessionStartTime.getTime() - now.getTime()

  if (diffMs <= 0) {
    return '진행중'
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays}일 후`
  } else if (diffHours > 0) {
    return `${diffHours}시간 ${diffMinutes % 60}분 후`
  } else {
    return `${diffMinutes}분 후`
  }
}
