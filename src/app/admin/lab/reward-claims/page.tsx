'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wallet,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Filter,
  ChevronDown,
  Check,
  X,
  Flag,
  DollarSign,
  Users,
  Loader2,
} from 'lucide-react'

interface RewardClaim {
  id: string
  surveyId: string
  userId: string
  realName: string
  phoneNumber: string
  bankCode: string
  bankName: string
  accountNumber: string
  amount: number
  ipAddress: string
  flagged: boolean
  flagReason: string | null
  riskScore: number
  status: string
  rejectedReason: string | null
  createdAt: string
  paidAt: string | null
  survey: {
    id: string
    title: string
    rewardAmount: number
  }
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

interface Stats {
  byStatus: Array<{
    status: string
    _count: number
    _sum: { amount: number | null }
  }>
  flaggedPending: number
}

export default function RewardClaimsAdminPage() {
  const [claims, setClaims] = useState<RewardClaim[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // 필터
  const [filter, setFilter] = useState({
    status: '',
    surveyId: '',
    flagged: '',
  })

  // 선택된 항목
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 페이지네이션
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchClaims()
  }, [filter, page])

  const fetchClaims = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.set('status', filter.status)
      if (filter.surveyId) params.set('surveyId', filter.surveyId)
      if (filter.flagged) params.set('flagged', filter.flagged)
      params.set('page', page.toString())

      const res = await fetch(`/api/admin/reward-claims?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setClaims(data.claims)
        setStats(data.stats)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(claims.filter((c) => c.status === 'PENDING').map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    }
  }

  const handleBulkAction = async (action: string, reason?: string) => {
    if (selectedIds.length === 0) {
      alert('처리할 항목을 선택해주세요.')
      return
    }

    const actionText = {
      approve: '승인',
      reject: '거절',
      pay: '지급 완료',
      unflag: '플래그 해제',
    }[action]

    if (!confirm(`${selectedIds.length}건을 ${actionText} 처리하시겠습니까?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch('/api/admin/reward-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, claimIds: selectedIds, reason }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        setSelectedIds([])
        fetchClaims()
      } else {
        alert(data.error || '처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (filter.surveyId) params.set('surveyId', filter.surveyId)
    params.set('status', 'APPROVED')
    window.open(`/api/admin/reward-claims/export?${params.toString()}`, '_blank')
  }

  const getStatusBadge = (claim: RewardClaim) => {
    const badges: Record<string, React.ReactNode> = {
      PENDING: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          <Clock className="w-3 h-3" />
          대기
        </span>
      ),
      APPROVED: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          승인
        </span>
      ),
      PAID: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <DollarSign className="w-3 h-3" />
          지급완료
        </span>
      ),
      REJECTED: (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          거절
        </span>
      ),
    }
    return badges[claim.status] || null
  }

  const getStatCount = (status: string) => {
    const stat = stats?.byStatus.find((s) => s.status === status)
    return stat?._count || 0
  }

  const getStatAmount = (status: string) => {
    const stat = stats?.byStatus.find((s) => s.status === status)
    return stat?._sum.amount || 0
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Wallet className="w-7 h-7 text-primary" />
          사례비 신청 관리
        </h1>
        <p className="text-gray-600 mt-1">연구 참여자 사례비 신청을 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">대기</span>
          </div>
          <p className="text-2xl font-bold">{getStatCount('PENDING')}</p>
          <p className="text-sm text-gray-500">{getStatAmount('PENDING').toLocaleString()}원</p>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">승인</span>
          </div>
          <p className="text-2xl font-bold">{getStatCount('APPROVED')}</p>
          <p className="text-sm text-gray-500">{getStatAmount('APPROVED').toLocaleString()}원</p>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">지급완료</span>
          </div>
          <p className="text-2xl font-bold">{getStatCount('PAID')}</p>
          <p className="text-sm text-gray-500">{getStatAmount('PAID').toLocaleString()}원</p>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">거절</span>
          </div>
          <p className="text-2xl font-bold">{getStatCount('REJECTED')}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">주의 필요</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats?.flaggedPending || 0}</p>
          <p className="text-sm text-orange-600">플래그된 대기건</p>
        </div>
      </div>

      {/* 필터 및 액션 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          {[
            { value: '', label: '전체' },
            { value: 'PENDING', label: '대기' },
            { value: 'APPROVED', label: '승인' },
            { value: 'PAID', label: '지급완료' },
            { value: 'REJECTED', label: '거절' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilter({ ...filter, status: tab.value })
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter.status === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => {
              setFilter({
                ...filter,
                flagged: filter.flagged === 'true' ? '' : 'true',
              })
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filter.flagged === 'true'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Flag className="w-4 h-4" />
            플래그
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchClaims}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 일괄 처리 버튼 */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 flex items-center justify-between">
          <span className="font-medium">{selectedIds.length}건 선택됨</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              승인
            </button>
            <button
              onClick={() => handleBulkAction('pay')}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
            >
              <DollarSign className="w-4 h-4" />
              지급완료
            </button>
            <button
              onClick={() => {
                const reason = prompt('거절 사유를 입력하세요:')
                if (reason) handleBulkAction('reject', reason)
              }}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              거절
            </button>
            <button
              onClick={() => handleBulkAction('unflag')}
              disabled={isProcessing}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
            >
              <Flag className="w-4 h-4" />
              플래그 해제
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            신청 건이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === claims.filter((c) => c.status === 'PENDING').length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">연구</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">신청자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">계좌</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">금액</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">IP</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">신청일</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className={`hover:bg-gray-50 ${claim.flagged ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      {claim.status === 'PENDING' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(claim.id)}
                          onChange={(e) => handleSelect(claim.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm truncate max-w-[200px]">
                        {claim.survey.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {claim.realName}
                          {claim.flagged && (
                            <span
                              className="text-orange-500"
                              title={claim.flagReason || '위험 감지'}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{claim.phoneNumber}</p>
                        {claim.flagged && claim.flagReason && (
                          <p className="text-xs text-orange-600 mt-1">{claim.flagReason}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{claim.bankName}</p>
                      <p className="text-sm text-gray-500 font-mono">{claim.accountNumber}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {claim.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {claim.ipAddress}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(claim)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(claim.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
