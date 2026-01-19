'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Eye, MoreVertical, Check, X, Clock, UserX, Users, Ban, AlertTriangle, Sparkles
} from 'lucide-react'

interface Application {
  id: string
  userId: string | null
  status: string
  appliedAt: Date
  name: string | null
  email: string | null
  phone: string | null
  birthYear: number | null
  gender: string | null
  organization: string | null
  origin: string | null
  hometown: string | null
  residence: string | null
  motivation: string | null
  selfIntro: string | null
  referralSource: string | null
  referrerName: string | null
  source: string | null
  referrer: string | null
  facePrivacy: boolean
  depositPaid: boolean
  depositAmount: number | null
  depositPaidAt: Date | null
  memberGrade: string | null
  memberStatus: string | null
  matchedMemberCode: string | null
  alertLevel: string | null
  rejectReason: string | null
  approvalNote: string | null
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
  } | null
  member: {
    id: string
    memberCode: string
    grade: string
    status: string
    stats: {
      totalPrograms: number
      attendanceRate: number
      noShowCount: number
    } | null
  } | null
}

interface ApplicationsTableProps {
  applications: Application[]
  programId: string
  feeType: string
  feeAmount: number
  depositAmount?: number | null
}

const sourceLabels: Record<string, string> = {
  EXISTING_MEMBER: '기존회원',
  HANA_FOUNDATION: '하나재단',
  INSTAGRAM: '인스타그램',
  SNS: 'SNS',
  KAKAO_GROUP: '카톡방',
  KAKAO_CHANNEL: '카카오채널',
  REFERRAL: '지인추천',
  SEARCH: '검색',
  OTHER: '기타',
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  PENDING: { label: '검토중', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: '승인', icon: Check, className: 'bg-green-100 text-green-700' },
  REJECTED: { label: '거절', icon: X, className: 'bg-red-100 text-red-700' },
  WAITLIST: { label: '대기', icon: Users, className: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: '취소', icon: X, className: 'bg-gray-100 text-gray-700' },
  ACCEPTED: { label: '합격', icon: Check, className: 'bg-green-100 text-green-700' },
  ADDITIONAL: { label: '추가합격', icon: Check, className: 'bg-blue-100 text-blue-700' },
  NO_CONTACT: { label: '연락안됨', icon: UserX, className: 'bg-gray-100 text-gray-700' },
}

export function ApplicationsTable({
  applications,
  programId,
  feeType,
  feeAmount,
  depositAmount,
}: ApplicationsTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [detailModal, setDetailModal] = useState<Application | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)))
    }
  }

  const updateStatus = async (ids: string[], status: string, reason?: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/programs/${programId}/applications/bulk`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, status, reason }),
        })

        if (res.ok) {
          setSelectedIds(new Set())
          setActionMenu(null)
          router.refresh()
        } else {
          const data = await res.json()
          alert(data.error || '처리 중 오류가 발생했습니다.')
        }
      } catch (error) {
        alert('처리 중 오류가 발생했습니다.')
      }
    })
  }

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.')
      return
    }
    updateStatus([id], 'REJECTED', rejectReason)
    setShowRejectModal(null)
    setRejectReason('')
  }

  const updateDeposit = async (id: string, depositPaid: boolean) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/programs/${programId}/applications/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            depositPaid,
            depositAmount: depositAmount || feeAmount,
            depositPaidAt: depositPaid ? new Date().toISOString() : null,
            depositStatus: depositPaid ? 'PAID' : 'NONE',
          }),
        })

        if (res.ok) {
          router.refresh()
        }
      } catch (error) {
        alert('처리 중 오류가 발생했습니다.')
      }
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getAlertBadge = (app: Application) => {
    if (!app.alertLevel) return null

    if (app.alertLevel === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <Ban className="w-3 h-3" />
          차단
        </span>
      )
    }

    if (app.alertLevel === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          경고
        </span>
      )
    }

    if (app.alertLevel === 'VVIP' || app.alertLevel === 'VIP') {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          app.alertLevel === 'VVIP' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          <Sparkles className="w-3 h-3" />
          {app.alertLevel}
        </span>
      )
    }

    return null
  }

  const getName = (app: Application) => app.name || app.user?.name || '(미입력)'
  const getEmail = (app: Application) => app.email || app.user?.email || ''
  const getPhone = (app: Application) => app.phone || app.user?.phone || '-'
  const getSource = (app: Application) => app.referralSource || app.source || ''
  const getReferrer = (app: Application) => app.referrerName || app.referrer || ''

  const hasDeposit = feeType !== 'FREE' || !!depositAmount

  return (
    <>
      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/10 rounded-xl p-4 mb-4 flex items-center justify-between">
          <span className="text-primary font-medium">{selectedIds.size}개 선택됨</span>
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus(Array.from(selectedIds), 'APPROVED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              일괄 승인
            </button>
            <button
              onClick={() => updateStatus(Array.from(selectedIds), 'WAITLIST')}
              disabled={isPending}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              일괄 대기
            </button>
            <button
              onClick={() => {
                const reason = prompt('거절 사유를 입력하세요:')
                if (reason) {
                  updateStatus(Array.from(selectedIds), 'REJECTED', reason)
                }
              }}
              disabled={isPending}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              일괄 거절
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === applications.length && applications.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청자</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">연락처</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">회원정보</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청경로</th>
                {hasDeposit && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">보증금</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청일</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className={`hover:bg-gray-50 ${
                    app.alertLevel === 'BLOCKED' ? 'bg-red-50/50' :
                    app.alertLevel === 'WARNING' ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium text-gray-900">{getName(app)}</div>
                        <div className="text-sm text-gray-500">{getEmail(app)}</div>
                      </div>
                      {getAlertBadge(app)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getPhone(app)}</td>
                  <td className="px-4 py-3">
                    {app.member ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{app.member.memberCode}</div>
                        <div className="text-gray-500">
                          {app.member.grade} · {app.member.stats?.totalPrograms || 0}회 참여
                        </div>
                      </div>
                    ) : app.matchedMemberCode ? (
                      <div className="text-sm text-gray-500">
                        매칭: {app.matchedMemberCode}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">신규</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {sourceLabels[getSource(app)] || getSource(app) || '-'}
                    {getReferrer(app) && (
                      <span className="text-gray-400 ml-1">({getReferrer(app)})</span>
                    )}
                  </td>
                  {hasDeposit && (
                    <td className="px-4 py-3">
                      {app.depositPaid ? (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          완납
                        </span>
                      ) : (
                        <button
                          onClick={() => updateDeposit(app.id, true)}
                          disabled={isPending}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          미납
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(app.appliedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setDetailModal(app)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="상세보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === app.id ? null : app.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenu === app.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border z-10">
                            <button
                              onClick={() => {
                                updateStatus([app.id], 'APPROVED')
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => {
                                updateStatus([app.id], 'WAITLIST')
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                            >
                              대기
                            </button>
                            <button
                              onClick={() => {
                                setShowRejectModal(app.id)
                                setActionMenu(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              거절
                            </button>
                            <button
                              onClick={() => {
                                updateStatus([app.id], 'CANCELLED')
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                            >
                              취소
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">신청자가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">신청자 상세</h2>
                  {getAlertBadge(detailModal)}
                </div>
                <button
                  onClick={() => setDetailModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Member Alert */}
              {detailModal.alertLevel === 'BLOCKED' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700 font-medium">
                    <Ban className="w-5 h-5" />
                    차단된 회원입니다
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    회원번호: {detailModal.matchedMemberCode}
                  </p>
                </div>
              )}

              {detailModal.alertLevel === 'WARNING' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-700 font-medium">
                    <AlertTriangle className="w-5 h-5" />
                    주의가 필요한 회원입니다
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    회원번호: {detailModal.matchedMemberCode}
                  </p>
                </div>
              )}

              {/* Member Info */}
              {detailModal.member && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-3">기존 회원 정보</h3>
                  <dl className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-500">회원번호</dt>
                      <dd className="font-medium">{detailModal.member.memberCode}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">등급</dt>
                      <dd className="font-medium">{detailModal.member.grade}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">상태</dt>
                      <dd className="font-medium">{detailModal.member.status}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">총 참여</dt>
                      <dd className="font-medium">{detailModal.member.stats?.totalPrograms || 0}회</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">출석률</dt>
                      <dd className="font-medium">{detailModal.member.stats?.attendanceRate || 0}%</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">노쇼</dt>
                      <dd className="font-medium">{detailModal.member.stats?.noShowCount || 0}회</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">기본 정보</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">이름</dt>
                    <dd className="font-medium">{getName(detailModal)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">연락처</dt>
                    <dd className="font-medium">{getPhone(detailModal)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500">이메일</dt>
                    <dd className="font-medium">{getEmail(detailModal)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">출생연도</dt>
                    <dd className="font-medium">{detailModal.birthYear || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">성별</dt>
                    <dd className="font-medium">
                      {detailModal.gender === 'MALE' ? '남성' : detailModal.gender === 'FEMALE' ? '여성' : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">출신</dt>
                    <dd className="font-medium">{detailModal.origin || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">소속</dt>
                    <dd className="font-medium">{detailModal.organization || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">고향</dt>
                    <dd className="font-medium">{detailModal.hometown || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">거주지역</dt>
                    <dd className="font-medium">{detailModal.residence || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Application Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">신청 정보</h3>
                <dl className="space-y-4 text-sm">
                  {detailModal.motivation && (
                    <div>
                      <dt className="text-gray-500">신청 동기</dt>
                      <dd className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                        {detailModal.motivation}
                      </dd>
                    </div>
                  )}
                  {detailModal.selfIntro && (
                    <div>
                      <dt className="text-gray-500">자기소개</dt>
                      <dd className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                        {detailModal.selfIntro}
                      </dd>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-gray-500">신청 경로</dt>
                      <dd className="font-medium">
                        {sourceLabels[getSource(detailModal)] || getSource(detailModal) || '-'}
                        {getReferrer(detailModal) && ` (추천인: ${getReferrer(detailModal)})`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">얼굴 비공개</dt>
                      <dd className="font-medium">{detailModal.facePrivacy ? '희망' : '해당없음'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">신청일</dt>
                      <dd className="font-medium">{formatDate(detailModal.appliedAt)}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Rejection reason if rejected */}
              {detailModal.status === 'REJECTED' && detailModal.rejectReason && (
                <div className="p-4 bg-red-50 rounded-xl">
                  <h3 className="font-medium text-red-700 mb-2">거절 사유</h3>
                  <p className="text-sm text-red-600">{detailModal.rejectReason}</p>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">상태 변경</h3>
                <div className="flex gap-2 flex-wrap">
                  {['APPROVED', 'WAITLIST', 'PENDING'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateStatus([detailModal.id], status)
                        setDetailModal(null)
                      }}
                      disabled={isPending || detailModal.status === status}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        detailModal.status === status
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {statusConfig[status]?.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setShowRejectModal(detailModal.id)
                      setDetailModal(null)
                    }}
                    disabled={isPending || detailModal.status === 'REJECTED'}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    거절
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">거절 사유 입력</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거절 사유를 입력해주세요"
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectReason('')
                }}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                거절
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
