'use client'

import { cn } from '@/lib/utils'
import {
  RefundEligibility,
  getRefundStatusText,
  getRefundGuidanceMessage,
  getRefundProgress,
} from '@/lib/utils/refund'
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar, CircularProgress } from '@/components/shared/ProgressBar'

interface RefundEligibilityCardProps {
  eligibility: RefundEligibility
  depositAmount?: number
  remainingSessions?: number
  className?: string
  showDetails?: boolean
}

export function RefundEligibilityCard({
  eligibility,
  depositAmount = 50000,
  remainingSessions = 0,
  className,
  showDetails = true,
}: RefundEligibilityCardProps) {
  const statusText = getRefundStatusText(eligibility)
  const guidance = getRefundGuidanceMessage(eligibility, remainingSessions)
  const progress = getRefundProgress(eligibility)

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Status Header */}
      <div
        className={cn(
          'p-4',
          eligibility.isEligible ? 'bg-green-50' : 'bg-gray-50'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {eligibility.isEligible ? (
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-gray-200 p-2">
                <XCircle className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{statusText}</h3>
              <p className="text-sm text-gray-600">{eligibility.reason}</p>
            </div>
          </div>
          {eligibility.isEligible && depositAmount > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">환급 예정 금액</p>
              <p className="text-xl font-bold text-green-600">
                {depositAmount.toLocaleString()}원
              </p>
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <CardContent className="space-y-4 pt-4">
          {/* Progress towards eligibility */}
          {!eligibility.isEligible && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">환급 자격 달성률</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <ProgressBar
                value={progress}
                max={100}
                showPercentage={false}
                color={progress >= 50 ? 'warning' : 'error'}
              />
            </div>
          )}

          {/* Attendance & Review Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Attendance */}
            <div
              className={cn(
                'rounded-lg border p-3',
                eligibility.attendanceMet ? 'border-green-200 bg-green-50' : 'border-gray-200'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">출석률</span>
                {eligibility.attendanceMet && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex items-end gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold',
                    eligibility.attendanceMet ? 'text-green-600' : 'text-gray-900'
                  )}
                >
                  {eligibility.attendanceRate}%
                </span>
                <span className="mb-1 text-xs text-gray-500">/ 50%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {eligibility.details.attendance.present +
                  eligibility.details.attendance.late}
                /{eligibility.details.attendance.total}회
              </p>
            </div>

            {/* Reviews */}
            <div
              className={cn(
                'rounded-lg border p-3',
                eligibility.reviewMet ? 'border-green-200 bg-green-50' : 'border-gray-200'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">독후감</span>
                {eligibility.reviewMet && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex items-end gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold',
                    eligibility.reviewMet ? 'text-green-600' : 'text-gray-900'
                  )}
                >
                  {eligibility.reviewRate}%
                </span>
                <span className="mb-1 text-xs text-gray-500">/ 50%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {eligibility.details.reviews.submitted}/{eligibility.details.reviews.total}개
              </p>
            </div>
          </div>

          {/* Guidance message */}
          {!eligibility.isEligible && remainingSessions > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
              <p className="text-sm text-yellow-800">{guidance}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Compact version for list views
interface RefundBadgeProps {
  isEligible: boolean
  className?: string
}

export function RefundBadge({ isEligible, className }: RefundBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
        isEligible
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {isEligible ? (
        <>
          <CheckCircle className="h-3 w-3" />
          환급 대상
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3" />
          환급 불가
        </>
      )}
    </span>
  )
}

// Progress indicator for dashboard
interface RefundProgressProps {
  eligibility: RefundEligibility
  size?: number
  className?: string
}

export function RefundProgressIndicator({
  eligibility,
  size = 80,
  className,
}: RefundProgressProps) {
  const progress = getRefundProgress(eligibility)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <CircularProgress
        value={progress}
        max={100}
        size={size}
        color={eligibility.isEligible ? 'success' : progress >= 50 ? 'warning' : 'error'}
        showLabel={false}
      />
      <div className="mt-2 text-center">
        <p
          className={cn(
            'text-sm font-medium',
            eligibility.isEligible ? 'text-green-600' : 'text-gray-700'
          )}
        >
          {eligibility.isEligible ? '환급 가능' : `${Math.round(progress)}% 달성`}
        </p>
        {!eligibility.isEligible && (
          <p className="text-xs text-gray-500">50% 필요</p>
        )}
      </div>
    </div>
  )
}
