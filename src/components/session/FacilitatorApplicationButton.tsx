'use client'

import { useState } from 'react'
import { Loader2, Hand, X, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { applyForFacilitator, cancelFacilitatorApplication } from '@/lib/actions/facilitator'
import type { ApplicationStatus, FacilitatorType } from '@/types/facilitator'

interface FacilitatorApplicationButtonProps {
  sessionId: string
  userId: string
  programId: string
  // 현재 진행자 정보
  currentFacilitator?: {
    id: string
    userId: string
    type: FacilitatorType
    user?: {
      name: string | null
      image: string | null
    }
  } | null
  // 내 지원 정보
  myApplication?: {
    id: string
    status: ApplicationStatus
    message: string | null
  } | null
  className?: string
}

export function FacilitatorApplicationButton({
  sessionId,
  userId,
  programId,
  currentFacilitator,
  myApplication,
  className,
}: FacilitatorApplicationButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    setLoading(true)
    setError(null)
    try {
      await applyForFacilitator(sessionId, userId, message || undefined)
      setShowDialog(false)
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '지원 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!myApplication) return
    setLoading(true)
    setError(null)
    try {
      await cancelFacilitatorApplication(myApplication.id, userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '취소 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 이미 진행자가 있는 경우
  if (currentFacilitator) {
    const isMe = currentFacilitator.userId === userId
    const typeLabel = currentFacilitator.type === 'ORGANIZER' ? '운영진' : '참가자'

    return (
      <div className={cn('p-4 bg-green-50 border border-green-200 rounded-lg', className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">
              {isMe ? '내가 진행자입니다!' : `${currentFacilitator.user?.name || '진행자'} (${typeLabel})`}
            </p>
            <p className="text-sm text-green-600">
              {isMe ? '체크리스트를 확인해주세요' : '이번 회차 진행자가 배정되었습니다'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 내가 지원한 경우
  if (myApplication) {
    if (myApplication.status === 'PENDING') {
      return (
        <div className={cn('p-4 bg-yellow-50 border border-yellow-200 rounded-lg', className)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">진행자 지원 대기 중</p>
                <p className="text-sm text-yellow-600">운영진 승인을 기다리고 있습니다</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '취소'}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )
    }

    if (myApplication.status === 'REJECTED') {
      return (
        <div className={cn('p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">지원이 거절되었습니다</p>
              <p className="text-sm text-red-600">다른 참가자가 선정되었습니다</p>
            </div>
          </div>
        </div>
      )
    }
  }

  // 지원 가능한 경우
  return (
    <>
      <div className={cn('p-4 bg-blue-50 border border-blue-200 rounded-lg', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Hand className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">진행자를 모집 중입니다</p>
              <p className="text-sm text-blue-600">진행자 혜택: 결석 또는 독후감 1회 면제</p>
            </div>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            지원하기
          </Button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hand className="w-5 h-5" />
              진행자 지원
            </DialogTitle>
            <DialogDescription>
              이번 회차의 진행자로 지원합니다. 승인되면 체크리스트와 함께 인센티브가 부여됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">진행자 혜택</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 결석 1회 면제 (결석이 없으면 독후감 1회 면제)</li>
                <li>• 최대 3회까지 인센티브 적용</li>
                <li>• 진행자 체크리스트 제공</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">지원 동기 (선택)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="진행자로 지원하는 이유나 준비 계획을 적어주세요"
                rows={3}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>
              취소
            </Button>
            <Button onClick={handleApply} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  지원 중...
                </>
              ) : (
                '지원하기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
