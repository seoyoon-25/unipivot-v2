'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  User,
  Calendar,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
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
import { approveReport, rejectReport, requestReportRevision } from '@/lib/actions/review'

interface Report {
  id: string
  title: string
  content: string
  bookTitle: string
  status: string
  createdAt: Date
  approvedAt: Date | null
  session: {
    id: string
    sessionNo: number
    title: string | null
  } | null
  author: {
    id: string
    name: string | null
    email: string | null
  }
  approver: {
    id: string
    name: string | null
  } | null
}

interface ReportsListProps {
  reports: Report[]
  programId: string
  page: number
  totalPages: number
  total: number
}

const statusConfig = {
  DRAFT: {
    label: '초안',
    icon: Edit,
    className: 'bg-gray-100 text-gray-700',
  },
  PENDING: {
    label: '대기 중',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700',
  },
  PUBLISHED: {
    label: '제출됨',
    icon: FileText,
    className: 'bg-blue-100 text-blue-700',
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
  REVISION_REQUESTED: {
    label: '수정 요청',
    icon: Edit,
    className: 'bg-yellow-100 text-yellow-700',
  },
}

export default function ReportsList({
  reports,
  programId,
  page,
  totalPages,
  total,
}: ReportsListProps) {
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'approve' | 'reject' | 'revision' | null>(null)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleApprove = async () => {
    if (!selectedReport) return

    setProcessing(true)
    try {
      await approveReport(selectedReport.id, note || undefined)
      setDialogMode(null)
      setSelectedReport(null)
      setNote('')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '승인 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedReport) return

    if (!reason.trim()) {
      alert('반려 사유를 입력해주세요.')
      return
    }

    setProcessing(true)
    try {
      await rejectReport(selectedReport.id, reason)
      setDialogMode(null)
      setSelectedReport(null)
      setReason('')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '반려 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!selectedReport) return

    if (!reason.trim()) {
      alert('수정 요청 피드백을 입력해주세요.')
      return
    }

    setProcessing(true)
    try {
      await requestReportRevision(selectedReport.id, reason)
      setDialogMode(null)
      setSelectedReport(null)
      setReason('')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '수정 요청 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">독후감이 없습니다</h3>
        <p className="text-gray-500">해당 조건에 맞는 독후감이 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {reports.map((report) => {
          const status = statusConfig[report.status as keyof typeof statusConfig] || statusConfig.DRAFT
          const StatusIcon = status.icon

          return (
            <div
              key={report.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* 사용자 아바타 */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 제목 및 작성자 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">
                        {report.title}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600 text-sm">
                        {report.author.name || '이름 없음'}
                      </span>
                    </div>

                    {/* 책 정보 및 회차 */}
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {report.bookTitle}
                      </span>
                      {report.session && (
                        <span>
                          {report.session.sessionNo}회차
                          {report.session.title && ` - ${report.session.title}`}
                        </span>
                      )}
                    </div>

                    {/* 날짜 */}
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        제출: {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      {report.approvedAt && (
                        <span>
                          승인: {new Date(report.approvedAt).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>

                    {/* 본문 미리보기 */}
                    <p className="mt-2 text-gray-700 line-clamp-2 text-sm">{report.content}</p>
                  </div>
                </div>

                {/* 상태 및 액션 */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedReport(report)
                        setDialogMode('view')
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {(report.status === 'PUBLISHED' || report.status === 'PENDING') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report)
                            setDialogMode('revision')
                          }}
                        >
                          수정 요청
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report)
                            setDialogMode('reject')
                          }}
                        >
                          반려
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report)
                            setDialogMode('approve')
                          }}
                        >
                          승인
                        </Button>
                      </>
                    )}
                  </div>
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
              href={`/admin/programs/${programId}/reports?page=${page - 1}`}
              className={page === 1 ? 'pointer-events-none' : ''}
            >
              <Button variant="outline" size="sm" disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
                이전
              </Button>
            </Link>
            <Link
              href={`/admin/programs/${programId}/reports?page=${page + 1}`}
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
          setSelectedReport(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>독후감 상세</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">제목</p>
                <p className="font-medium">{selectedReport.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">작성자</p>
                <p className="font-medium">{selectedReport.author.name || '이름 없음'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">책</p>
                <p className="font-medium">{selectedReport.bookTitle}</p>
              </div>
              {selectedReport.session && (
                <div>
                  <p className="text-sm text-gray-500">회차</p>
                  <p className="font-medium">
                    {selectedReport.session.sessionNo}회차
                    {selectedReport.session.title && ` - ${selectedReport.session.title}`}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">본문</p>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg prose prose-sm max-w-none whitespace-pre-wrap">
                  {selectedReport.content}
                </div>
              </div>
              {selectedReport.approver && (
                <div>
                  <p className="text-sm text-gray-500">승인자</p>
                  <p className="font-medium">{selectedReport.approver.name}</p>
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
          setSelectedReport(null)
          setNote('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>독후감 승인</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <p className="text-gray-600">
                <strong>{selectedReport.author.name || '이름 없음'}</strong>님의 독후감
                <strong> "{selectedReport.title}"</strong>을(를) 승인하시겠습니까?
              </p>
              <div>
                <p className="text-sm text-gray-500 mb-2">메모 (선택)</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
                setSelectedReport(null)
                setNote('')
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
          setSelectedReport(null)
          setReason('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>독후감 반려</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <p className="text-gray-600">
                <strong>{selectedReport.author.name || '이름 없음'}</strong>님의 독후감
                <strong> "{selectedReport.title}"</strong>을(를) 반려하시겠습니까?
              </p>
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  반려 사유 <span className="text-red-500">*</span>
                </p>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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
                setSelectedReport(null)
                setReason('')
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !reason.trim()}
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

      {/* 수정 요청 다이얼로그 */}
      <Dialog
        open={dialogMode === 'revision'}
        onOpenChange={() => {
          setDialogMode(null)
          setSelectedReport(null)
          setReason('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>독후감 수정 요청</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <p className="text-gray-600">
                <strong>{selectedReport.author.name || '이름 없음'}</strong>님의 독후감
                <strong> "{selectedReport.title}"</strong>에 수정을 요청하시겠습니까?
              </p>
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  피드백 <span className="text-red-500">*</span>
                </p>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="수정이 필요한 부분에 대한 피드백을 입력하세요..."
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
                setSelectedReport(null)
                setReason('')
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleRequestRevision}
              disabled={processing || !reason.trim()}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                '수정 요청'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
