import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
}

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}

const bgColorClasses = {
  primary: 'bg-primary/20',
  success: 'bg-green-100',
  warning: 'bg-yellow-100',
  error: 'bg-red-100',
  info: 'bg-blue-100',
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className,
  animate = false,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showPercentage && (
            <span className="font-medium text-gray-900">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full',
          bgColorClasses[color],
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
            animate && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Circular progress variant
interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  showLabel?: boolean
  label?: string
  className?: string
}

const circularColorClasses = {
  primary: 'text-primary',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  color = 'primary',
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', circularColorClasses[color])}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
          {label && <span className="text-xs text-gray-500">{label}</span>}
        </div>
      )}
    </div>
  )
}

// Response rate progress (specialized for surveys)
interface ResponseRateProps {
  count: number
  total: number
  className?: string
}

export function ResponseRate({ count, total, className }: ResponseRateProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  let color: 'success' | 'warning' | 'error' = 'error'
  if (percentage >= 80) color = 'success'
  else if (percentage >= 50) color = 'warning'

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">응답률</span>
        <span className="font-medium">
          {count}/{total}명 ({percentage}%)
        </span>
      </div>
      <ProgressBar value={count} max={total} showPercentage={false} color={color} />
    </div>
  )
}
