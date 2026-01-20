import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label?: string
    direction?: 'up' | 'down' | 'neutral'
  }
  description?: string
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorClasses = {
  default: {
    icon: 'bg-gray-100 text-gray-600',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  success: {
    icon: 'bg-green-100 text-green-600',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  warning: {
    icon: 'bg-yellow-100 text-yellow-600',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  error: {
    icon: 'bg-red-100 text-red-600',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
}

const sizeClasses = {
  sm: {
    wrapper: 'p-3',
    icon: 'h-8 w-8',
    iconSize: 'h-4 w-4',
    value: 'text-xl',
    label: 'text-xs',
  },
  md: {
    wrapper: 'p-4',
    icon: 'h-10 w-10',
    iconSize: 'h-5 w-5',
    value: 'text-2xl',
    label: 'text-sm',
  },
  lg: {
    wrapper: 'p-6',
    icon: 'h-12 w-12',
    iconSize: 'h-6 w-6',
    value: 'text-3xl',
    label: 'text-base',
  },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
  color = 'default',
  size = 'md',
  className,
}: StatCardProps) {
  const colors = colorClasses[color]
  const sizes = sizeClasses[size]

  const trendDirection = trend?.direction || (trend?.value !== undefined
    ? trend.value > 0
      ? 'up'
      : trend.value < 0
        ? 'down'
        : 'neutral'
    : 'neutral')

  const TrendIcon = trendDirection === 'up'
    ? TrendingUp
    : trendDirection === 'down'
      ? TrendingDown
      : Minus

  return (
    <div
      className={cn(
        'rounded-xl border bg-white shadow-sm',
        sizes.wrapper,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn('text-gray-500', sizes.label)}>{label}</p>
          <p className={cn('font-bold text-gray-900', sizes.value)}>{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <TrendIcon
                className={cn('h-4 w-4', colors.trend[trendDirection])}
              />
              <span
                className={cn('text-sm font-medium', colors.trend[trendDirection])}
              >
                {trend.value > 0 && '+'}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-gray-400">{trend.label}</span>
              )}
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex items-center justify-center rounded-lg',
              colors.icon,
              sizes.icon
            )}
          >
            <Icon className={sizes.iconSize} />
          </div>
        )}
      </div>
    </div>
  )
}

// Grid layout helper for stat cards
interface StatGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {children}
    </div>
  )
}

// Specialized stat cards
interface AttendanceStatProps {
  present: number
  late: number
  absent: number
  total: number
  className?: string
}

export function AttendanceSummary({
  present,
  late,
  absent,
  total,
  className,
}: AttendanceStatProps) {
  const attendanceRate = total > 0
    ? Math.round(((present + late) / total) * 100)
    : 0

  return (
    <div className={cn('rounded-xl border bg-white p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-medium text-gray-900">출석 현황</h4>
        <span className="text-2xl font-bold text-primary">{attendanceRate}%</span>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">출석 {present}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-600">지각 {late}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">결석 {absent}</span>
        </div>
      </div>
    </div>
  )
}

// NPS Score display
interface NPSScoreProps {
  score: number
  promoters?: number
  passives?: number
  detractors?: number
  className?: string
}

export function NPSScore({
  score,
  promoters,
  passives,
  detractors,
  className,
}: NPSScoreProps) {
  let scoreColor = 'text-red-600'
  let label = '개선 필요'

  if (score >= 50) {
    scoreColor = 'text-green-600'
    label = '우수'
  } else if (score >= 0) {
    scoreColor = 'text-yellow-600'
    label = '양호'
  }

  return (
    <div className={cn('rounded-xl border bg-white p-4', className)}>
      <div className="mb-3 text-sm text-gray-500">NPS 점수</div>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-4xl font-bold', scoreColor)}>
          {score > 0 ? '+' : ''}
          {score}
        </span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      {(promoters !== undefined || passives !== undefined || detractors !== undefined) && (
        <div className="mt-3 flex gap-3 text-xs">
          {promoters !== undefined && (
            <span className="text-green-600">추천 {promoters}%</span>
          )}
          {passives !== undefined && (
            <span className="text-gray-500">중립 {passives}%</span>
          )}
          {detractors !== undefined && (
            <span className="text-red-600">비추천 {detractors}%</span>
          )}
        </div>
      )}
    </div>
  )
}
