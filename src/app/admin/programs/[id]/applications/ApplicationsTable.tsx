'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, MoreVertical, Mail, Check, X, Clock, UserX } from 'lucide-react'
import { applicationStatusConfig } from '@/lib/program/status-calculator'

interface Application {
  id: string
  userId: string
  status: string
  appliedAt: Date
  email: string | null
  hometown: string | null
  residence: string | null
  motivation: string | null
  source: string | null
  referrer: string | null
  facePrivacy: boolean
  depositPaid: boolean
  depositAmount: number | null
  depositPaidAt: Date | null
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
  }
}

interface ApplicationsTableProps {
  applications: Application[]
  programId: string
  feeType: string
  feeAmount: number
}

const sourceLabels: Record<string, string> = {
  EXISTING_MEMBER: '기존회원',
  HANA_FOUNDATION: '하나재단',
  SNS: 'SNS',
  KAKAO_GROUP: '카톡방',
  KAKAO_CHANNEL: '카카오채널',
  REFERRAL: '지인추천',
}

export function ApplicationsTable({
  applications,
  programId,
  feeType,
  feeAmount,
}: ApplicationsTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [detailModal, setDetailModal] = useState<Application | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

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

  const updateStatus = async (ids: string[], status: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/programs/${programId}/applications/bulk`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, status }),
        })

        if (res.ok) {
          setSelectedIds(new Set())
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

  const updateDeposit = async (id: string, depositPaid: boolean, depositAmount?: number) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/programs/${programId}/applications/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            depositPaid,
            depositAmount: depositAmount || feeAmount,
            depositPaidAt: depositPaid ? new Date().toISOString() : null,
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
    const config = applicationStatusConfig[status as keyof typeof applicationStatusConfig]
    if (!config) return null

    const icons: Record<string, React.ReactNode> = {
      PENDING: <Clock className="w-3 h-3" />,
      ACCEPTED: <Check className="w-3 h-3" />,
      ADDITIONAL: <Check className="w-3 h-3" />,
      REJECTED: <X className="w-3 h-3" />,
      NO_CONTACT: <UserX className="w-3 h-3" />,
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.badgeClass}`}>
        {icons[status]}
        {config.label}
      </span>
    )
  }

  return (
    <>
      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/10 rounded-xl p-4 mb-4 flex items-center justify-between">
          <span className="text-primary font-medium">{selectedIds.size}개 선택됨</span>
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus(Array.from(selectedIds), 'ACCEPTED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              일괄 합격
            </button>
            <button
              onClick={() => updateStatus(Array.from(selectedIds), 'ADDITIONAL')}
              disabled={isPending}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              일괄 추가합격
            </button>
            <button
              onClick={() => updateStatus(Array.from(selectedIds), 'REJECTED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              일괄 불합격
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">이름</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">연락처</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청경로</th>
                {feeType !== 'FREE' && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">보증금</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">신청일</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{app.user.name}</div>
                    <div className="text-sm text-gray-500">{app.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{app.user.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {sourceLabels[app.source || ''] || app.source}
                    {app.source === 'REFERRAL' && app.referrer && (
                      <span className="text-gray-400 ml-1">({app.referrer})</span>
                    )}
                  </td>
                  {feeType !== 'FREE' && (
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
                                updateStatus([app.id], 'ACCEPTED')
                                setActionMenu(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                            >
                              합격
                            </button>
                            <button
                              onClick={() => {
                                updateStatus([app.id], 'ADDITIONAL')
                                setActionMenu(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                            >
                              추가합격
                            </button>
                            <button
                              onClick={() => {
                                updateStatus([app.id], 'REJECTED')
                                setActionMenu(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              불합격
                            </button>
                            <button
                              onClick={() => {
                                updateStatus([app.id], 'NO_CONTACT')
                                setActionMenu(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                            >
                              연락안됨
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
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">신청자 상세</h2>
                <button
                  onClick={() => setDetailModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">기본 정보</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">이름</dt>
                    <dd className="font-medium">{detailModal.user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">연락처</dt>
                    <dd className="font-medium">{detailModal.user.phone || '-'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500">이메일</dt>
                    <dd className="font-medium">{detailModal.email || detailModal.user.email}</dd>
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

              <div>
                <h3 className="font-medium text-gray-900 mb-3">신청 정보</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500">신청 동기</dt>
                    <dd className="mt-1 whitespace-pre-wrap">{detailModal.motivation || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">신청 경로</dt>
                    <dd className="font-medium">
                      {sourceLabels[detailModal.source || ''] || detailModal.source}
                      {detailModal.referrer && ` (추천인: ${detailModal.referrer})`}
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
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">상태</h3>
                <div className="flex gap-2 flex-wrap">
                  {['PENDING', 'ACCEPTED', 'ADDITIONAL', 'REJECTED', 'NO_CONTACT'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateStatus([detailModal.id], status)
                        setDetailModal(null)
                      }}
                      disabled={isPending}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        detailModal.status === status
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {applicationStatusConfig[status as keyof typeof applicationStatusConfig]?.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
