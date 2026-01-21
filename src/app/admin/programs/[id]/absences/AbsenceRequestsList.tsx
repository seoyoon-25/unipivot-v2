'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { approveAbsenceRequest, rejectAbsenceRequest } from '@/lib/actions/absence'

interface AbsenceRequest {
  id: string
  reason: string
  attachment: string | null
  status: string
  reviewNote: string | null
  reviewedAt: Date | null
  createdAt: Date
  session: {
    id: string
    sessionNo: number
    title: string | null
    date: Date
    program: {
      id: string
      title: string
    }
  }
  user: {
    id: string
    name: string | null
    image: string | null
  }
  reviewer: {
    id: string
    name: string | null
  } | null
}

interface AbsenceRequestsListProps {
  requests: AbsenceRequest[]
  programId: string
  page: number
  totalPages: number
  total: number
}

const statusConfig = {
  PENDING: {
    label: '대기 중',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700',
  },
  APPROVED: {
    label: '승인됨',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700',
  },
  REJECTED: {
    label: '반려됨',
    icon: XCircle,
    className: 'bg-red-100 text-red-700',
  },
}

export default function AbsenceRequestsList({
  requests,
  programId,
  page,
  totalPages,
  total,
}: AbsenceRequestsListProps) {
  const router = useRouter()
  const [selectedRequest, setSelectedRequest] = useState<AbsenceRequest | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approveNote, setApproveNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleApprove = async () => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      await approveAbsenceRequest(selectedRequest.id, approveNote || undefined)
      setDialogMode(null)
      setSelectedRequest(null)
      setApproveNote('')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '승인 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.')
      return
    }

    setProcessing(true)
    try {
      await rejectAbsenceRequest(selectedRequest.id, rejectReason)
      setDialogMode(null)
      setSelectedRequest(null)
      setRejectReason('')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '반려 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">결석 신청이 없습니다</h3>
        <p className="text-gray-500">해당 조건에 맞는 결석 신청이 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => {
          const status = statusConfig[request.status as keyof typeof statusConfig]
          const StatusIcon = status.icon
          const sessionDate = new Date(request.session.date)

          return (
            <div
              key={request.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* 사용자 아바타 */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {request.user.image ? (
                      <img
                        src={request.user.image}
                        alt={request.user.name || ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* 사용자 정보 및 세션 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {request.user.name || '이름 없음'}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">
                        {request.session.sessionNo}회차
                        {request.session.title && ` - ${request.session.title}`}
                      </span>
                    </div>

                    {/* 날짜 */}
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {sessionDate.toLocaleDateString('ko-KR')}
                      </span>
                      <span>
                        신청일: {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>

                    {/* 사유 미리보기 */}
                    <p className="mt-2 text-gray-700 line-clamp-2">{request.reason}</p>

                    {/* 첨부 파일 */}
                    {request.attachment && (
                      <a
                        href={request.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        증빙 자료 보기
                      </a>
                    )}
                  </div>
                </div>

                {/* 상태 및 액션 */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request)
                          setDialogMode('reject')
                        }}
                      >
                        반려
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request)
                          setDialogMode('approve')
                        }}
                      >
                        승인
                      </Button>
                    </div>
                  )}

                  {request.status !== 'PENDING' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(request)
                        setDialogMode('view')
                      }}
                    >
                      상세 보기
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            총 {total}건 중 {(page - 1) * 20 + 1}-{Math.min(page * 20, total)}건
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin/programs/${programId}/absences?page=${page - 1}`}
              className={page === 1 ? 'pointer-events-none' : ''}
            >
              <Button variant="outline" size="sm" disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
                이전
              </Button>
            </Link>
            <Link
              href={`/admin/programs/${programId}/absences?page=${page + 1}`}
              className={page === totalPages ? 'pointer-events-none' : ''}
            >
              <Button variant="outline" size="sm" disabled={page === totalPages}>
                다음
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 상세 보기 다이얼로그 */}
      <Dialog
        open={dialogMode === 'view'}
        onOpenChange={() => {
          setDialogMode(null)
          setSelectedRequest(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결석 신청 상세</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">신청자</p>
                <p className="font-medium">{selectedRequest.user.name || '이름 없음'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">세션</p>
                <p className="font-medium">
                  {selectedRequest.session.sessionNo}회차
                  {selectedRequest.session.title && ` - ${selectedRequest.session.title}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">결석 사유</p>
                <p className="font-medium">{selectedRequest.reason}</p>
              </div>
              {selectedRequest.attachment && (
                <div>
                  <p className="text-sm text-gray-500">증빙 자료</p>
                  <a
                    href={selectedRequest.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    파일 보기
                  </a>
                </div>
              )}
              {selectedRequest.reviewNote && (
                <div>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.status === 'APPROVED' ? '승인 메모' : '반려 사유'}
                  </p>
                  <p className="font-medium">{selectedRequest.reviewNote}</p>
                </div>
              )}
              {selectedRequest.reviewer && (
                <div>
                  <p className="text-sm text-gray-500">처리자</p>
                  <p className="font-medium">{selectedRequest.reviewer.name}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 승인 다이얼로그 */}
      <Dialog
        open={dialogMode === 'approve'}
        onOpenChange={() => {
          setDialogMode(null)
          setSelectedRequest(null)
          setApproveNote('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결석 신청 승인</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <p className="text-gray-600">
                <strong>{selectedRequest.user.name || '이름 없음'}</strong>님의{' '}
                {selectedRequest.session.sessionNo}회차 결석 신청을 승인하시겠습니까?
              </p>
              <div>
                <p className="text-sm text-gray-500 mb-2">메모 (선택)</p>
                <Textarea
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  placeholder="승인 관련 메모를 입력하세요..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogMode(null)
                setSelectedRequest(null)
                setApproveNote('')
              }}
            >
              취소
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                '승인'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 반려 다이얼로그 */}
      <Dialog
        open={dialogMode === 'reject'}
        onOpenChange={() => {
          setDialogMode(null)
          setSelectedRequest(null)
          setRejectReason('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결석 신청 반려</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <p className="text-gray-600">
                <strong>{selectedRequest.user.name || '이름 없음'}</strong>님의{' '}
                {selectedRequest.session.sessionNo}회차 결석 신청을 반려하시겠습니까?
              </p>
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  반려 사유 <span className="text-red-500">*</span>
                </p>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="반려 사유를 입력하세요..."
                  rows={3}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogMode(null)
                setSelectedRequest(null)
                setRejectReason('')
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                '반려'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
