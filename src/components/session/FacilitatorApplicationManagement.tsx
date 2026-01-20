'use client'

import { useState } from 'react'
import { Loader2, Check, X, UserPlus, Crown, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  approveFacilitatorApplication,
  rejectFacilitatorApplication,
  assignFacilitatorByOrganizer,
} from '@/lib/actions/facilitator'
import type { ApplicationStatus, FacilitatorType } from '@/types/facilitator'
import { APPLICATION_STATUS_INFO, FACILITATOR_TYPE_INFO } from '@/types/facilitator'

interface Application {
  id: string
  userId: string
  status: ApplicationStatus
  message: string | null
  createdAt: Date
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface Organizer {
  id: string
  userId: string
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface CurrentFacilitator {
  id: string
  userId: string
  type: FacilitatorType
  user?: {
    id: string
    name: string | null
    image: string | null
  }
}

interface FacilitatorApplicationManagementProps {
  sessionId: string
  programId: string
  currentUserId: string
  applications: Application[]
  organizers: Organizer[]
  currentFacilitator?: CurrentFacilitator | null
  className?: string
}

export function FacilitatorApplicationManagement({
  sessionId,
  programId,
  currentUserId,
  applications,
  organizers,
  currentFacilitator,
  className,
}: FacilitatorApplicationManagementProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>('')
  const [rejectNote, setRejectNote] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const pendingApplications = applications.filter(a => a.status === 'PENDING')

  const handleApprove = async (applicationId: string) => {
    setLoading(applicationId)
    setError(null)
    try {
      await approveFacilitatorApplication(applicationId, currentUserId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '승인 중 오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    setLoading(applicationId)
    setError(null)
    try {
      await rejectFacilitatorApplication(applicationId, currentUserId, rejectNote || undefined)
      setRejectingId(null)
      setRejectNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '거절 중 오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  const handleAssign = async () => {
    if (!selectedOrganizer) return
    setLoading('assign')
    setError(null)
    try {
      await assignFacilitatorByOrganizer(sessionId, selectedOrganizer, currentUserId)
      setShowAssignDialog(false)
      setSelectedOrganizer('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '배정 중 오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  // 이미 진행자가 배정된 경우
  if (currentFacilitator) {
    const typeInfo = FACILITATOR_TYPE_INFO[currentFacilitator.type]
    return (
      <div className={cn('bg-white rounded-lg border p-6', className)}>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          진행자 배정 완료
        </h3>
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            {currentFacilitator.user?.image ? (
              <img
                src={currentFacilitator.user.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-green-600">
                {currentFacilitator.user?.name?.slice(0, 1) || '?'}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-green-800">
              {currentFacilitator.user?.name || '진행자'}
            </p>
            <span className={cn('text-xs px-2 py-0.5 rounded', typeInfo.color)}>
              {typeInfo.emoji} {typeInfo.name}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border p-6 space-y-6', className)}>
      {/* 지원 현황 섹션 */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          진행자 지원 현황
          {pendingApplications.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {pendingApplications.length}명 대기 중
            </span>
          )}
        </h3>

        {pendingApplications.length === 0 ? (
          <p className="text-gray-500 text-sm">아직 지원자가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {pendingApplications.map((application) => (
              <div
                key={application.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {application.user?.image ? (
                        <img
                          src={application.user.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {application.user?.name?.slice(0, 1) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {application.user?.name || '알 수 없음'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectingId(application.id)}
                      disabled={loading === application.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(application.id)}
                      disabled={loading === application.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading === application.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          승인
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {application.message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{application.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 직접 배정 섹션 */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          운영진 직접 배정
        </h3>
        <Button
          variant="outline"
          onClick={() => setShowAssignDialog(true)}
          className="w-full"
        >
          운영진을 진행자로 배정하기
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 거절 다이얼로그 */}
      <Dialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지원 거절</DialogTitle>
            <DialogDescription>
              거절 사유를 입력할 수 있습니다 (선택).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectNote">거절 사유</Label>
            <Textarea
              id="rejectNote"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="거절 사유를 입력해주세요 (선택)"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectingId && handleReject(rejectingId)}
              disabled={loading === rejectingId}
            >
              {loading === rejectingId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '거절하기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 직접 배정 다이얼로그 */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>운영진 직접 배정</DialogTitle>
            <DialogDescription>
              이번 회차를 진행할 운영진을 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>운영진 선택</Label>
            <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="운영진을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {organizers.map((org) => (
                  <SelectItem key={org.userId} value={org.userId}>
                    {org.user?.name || org.user?.email || '알 수 없음'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              취소
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedOrganizer || loading === 'assign'}
            >
              {loading === 'assign' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '배정하기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
