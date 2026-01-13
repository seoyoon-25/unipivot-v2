'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Wallet,
  Download,
  CheckCircle2,
  Heart,
  XCircle,
  Clock,
  RefreshCw,
  Users,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/deposit-calculator'

interface RefundItem {
  id: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
  depositAmount: number
  depositStatus: string
  surveySubmitted: boolean
  refundChoice: 'REFUND' | 'DONATE' | null
  stats: {
    totalSessions: number
    attendedSessions: number
    submittedReports: number
    attendanceRate: number
    reportRate: number
  }
  refundCalc: {
    refundAmount: number
    refundRate: number
    eligible: boolean
    reason: string
  } | null
  bankInfo: {
    bankName: string
    accountNumber: string
    accountHolder: string
  } | null
  refundedAmount: number | null
  refundedAt: string | null
  donatedAmount: number | null
  donatedAt: string | null
}

interface Summary {
  total: number
  surveyResponded: number
  refundPending: number
  refundCompleted: number
  donated: number
  forfeited: number
  totalRefundAmount: number
  totalDonatedAmount: number
}

export default function RefundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [program, setProgram] = useState<any>(null)
  const [refundList, setRefundList] = useState<RefundItem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchRefundList()
  }, [id])

  const fetchRefundList = async () => {
    try {
      const response = await fetch(`/api/admin/programs/${id}/refund`)
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setProgram(data.program)
      setRefundList(data.refundList)
      setSummary(data.summary)
    } catch (error) {
      console.error('Failed to fetch refund list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleIds = filteredList
        .filter(
          (item) =>
            item.depositStatus === 'REFUND_PENDING' && item.refundChoice === 'REFUND'
        )
        .map((item) => item.id)
      setSelectedIds(eligibleIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== itemId))
    }
  }

  const handleCompleteRefund = async () => {
    if (selectedIds.length === 0) {
      alert('반환할 대상자를 선택해주세요.')
      return
    }

    if (!confirm(`${selectedIds.length}명의 반환을 완료 처리하시겠습니까?`)) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/admin/programs/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: selectedIds,
          action: 'complete_refund',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '처리에 실패했습니다.')
      }

      alert('반환 완료 처리되었습니다.')
      setSelectedIds([])
      fetchRefundList()
    } catch (error) {
      alert(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = () => {
    window.open(`/api/admin/programs/${id}/refund/export`, '_blank')
  }

  const filteredList = refundList.filter((item) => {
    switch (filter) {
      case 'pending':
        return item.depositStatus === 'REFUND_PENDING' && item.refundChoice === 'REFUND'
      case 'completed':
        return item.depositStatus === 'REFUNDED'
      case 'donated':
        return item.refundChoice === 'DONATE'
      case 'forfeited':
        return !item.refundCalc?.eligible || !item.surveySubmitted
      default:
        return true
    }
  })

  const getStatusBadge = (item: RefundItem) => {
    if (item.depositStatus === 'REFUNDED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          반환 완료
        </span>
      )
    }
    if (item.refundChoice === 'DONATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
          <Heart className="w-3 h-3" />
          후원 전환
        </span>
      )
    }
    if (!item.surveySubmitted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          <Clock className="w-3 h-3" />
          미응답
        </span>
      )
    }
    if (!item.refundCalc?.eligible) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          미반환
        </span>
      )
    }
    if (item.depositStatus === 'REFUND_PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          <Clock className="w-3 h-3" />
          반환 대기
        </span>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href={`/admin/programs/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          프로그램으로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Wallet className="w-7 h-7 text-primary" />
          보증금 반환 처리
        </h1>
        <p className="text-gray-600 mt-1">{program?.title}</p>
      </div>

      {/* 요약 카드 */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">반환 대기</span>
            </div>
            <p className="text-2xl font-bold">{summary.refundPending}명</p>
            <p className="text-sm text-gray-500">
              {formatCurrency(summary.totalRefundAmount)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">반환 완료</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{summary.refundCompleted}명</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-pink-600 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm">후원 전환</span>
            </div>
            <p className="text-2xl font-bold text-pink-600">{summary.donated}명</p>
            <p className="text-sm text-gray-500">
              {formatCurrency(summary.totalDonatedAmount)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">미반환</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{summary.forfeited}명</p>
          </div>
        </div>
      )}

      {/* 필터 및 액션 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          {[
            { value: 'all', label: '전체' },
            { value: 'pending', label: '반환 대기' },
            { value: 'completed', label: '반환 완료' },
            { value: 'donated', label: '후원 전환' },
            { value: 'forfeited', label: '미반환' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchRefundList}
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
          <button
            onClick={handleCompleteRefund}
            disabled={selectedIds.length === 0 || isProcessing}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isProcessing ? '처리 중...' : `반환 완료 (${selectedIds.length}명)`}
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length ===
                        filteredList.filter(
                          (item) =>
                            item.depositStatus === 'REFUND_PENDING' &&
                            item.refundChoice === 'REFUND'
                        ).length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">이름</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">출석률</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  독후감
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  반환률
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  반환금액
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">계좌</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    해당하는 대상자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {item.depositStatus === 'REFUND_PENDING' &&
                        item.refundChoice === 'REFUND' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) => handleSelect(item.id, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{item.user.name || '이름 없음'}</p>
                        <p className="text-sm text-gray-500">{item.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.stats.attendanceRate >= 80
                            ? 'text-green-600'
                            : item.stats.attendanceRate >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {item.stats.attendanceRate}%
                      </span>
                      <span className="text-gray-400 text-sm ml-1">
                        ({item.stats.attendedSessions}/{item.stats.totalSessions})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.stats.reportRate >= 80
                            ? 'text-green-600'
                            : item.stats.reportRate >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {item.stats.reportRate}%
                      </span>
                      <span className="text-gray-400 text-sm ml-1">
                        ({item.stats.submittedReports}/{item.stats.totalSessions})
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.refundCalc?.refundRate || 0}%
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.refundCalc
                        ? formatCurrency(item.refundCalc.refundAmount)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.bankInfo ? (
                        <div>
                          <p>{item.bankInfo.bankName}</p>
                          <p className="text-gray-500 font-mono text-xs">
                            {item.bankInfo.accountNumber}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
