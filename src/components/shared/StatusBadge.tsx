import { cn } from '@/lib/utils'

type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'
type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'SENT'
type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WAITLIST'
type GenericStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral'

type StatusType = AttendanceStatus | SurveyStatus | ApplicationStatus | GenericStatus

interface StatusBadgeProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusConfig: Record<StatusType, { color: string; label: string }> = {
  // Attendance statuses
  PRESENT: { color: 'bg-green-100 text-green-700 border-green-200', label: '출석' },
  LATE: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '지각' },
  ABSENT: { color: 'bg-red-100 text-red-700 border-red-200', label: '결석' },
  EXCUSED: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: '공결' },

  // Survey statuses
  DRAFT: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: '임시저장' },
  ACTIVE: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: '진행중' },
  SENT: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: '발송됨' },
  CLOSED: { color: 'bg-gray-200 text-gray-600 border-gray-300', label: '종료' },

  // Application statuses
  PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '대기중' },
  APPROVED: { color: 'bg-green-100 text-green-700 border-green-200', label: '승인' },
  REJECTED: { color: 'bg-red-100 text-red-700 border-red-200', label: '거절' },
  CANCELLED: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: '취소' },
  WAITLIST: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: '대기' },

  // Generic statuses
  success: { color: 'bg-green-100 text-green-700 border-green-200', label: '성공' },
  warning: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '주의' },
  error: { color: 'bg-red-100 text-red-700 border-red-200', label: '오류' },
  info: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: '정보' },
  neutral: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: '-' },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function StatusBadge({
  status,
  label,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.neutral
  const displayLabel = label || config.label

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {displayLabel}
    </span>
  )
}

// Attendance status with dot indicator
export function AttendanceStatusBadge({
  status,
  showDot = true,
  className,
}: {
  status: AttendanceStatus
  showDot?: boolean
  className?: string
}) {
  const dotColors: Record<AttendanceStatus, string> = {
    PRESENT: 'bg-green-500',
    LATE: 'bg-yellow-500',
    ABSENT: 'bg-red-500',
    EXCUSED: 'bg-blue-500',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showDot && (
        <span className={cn('h-2 w-2 rounded-full', dotColors[status])} />
      )}
      <StatusBadge status={status} size="sm" />
    </div>
  )
}
