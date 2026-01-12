'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Download, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Participant {
  id: string
  depositAmount: number
  depositStatus: string
  depositPaidAt: string | null
  returnAmount: number | null
  forfeitAmount: number | null
  returnMethod: string | null
  settledAt: string | null
  settleNote: string | null
  finalAttendanceRate: number | null
  user: {
    id: string
    name: string | null
    email: string
  }
  program: {
    id: string
    title: string
  }
}

interface Summary {
  totalDeposits: number
  paidCount: number
  returnedCount: number
  forfeitedCount: number
  pendingCount: number
  totalPaid: number
  totalReturned: number
  totalForfeited: number
}

export default function DepositsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    try {
      const res = await fetch('/api/finance/deposits')
      if (res.ok) {
        const data = await res.json()
        setParticipants(data.participants)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching deposits:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR')
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'NONE': 'bg-gray-100 text-gray-600',
      'UNPAID': 'bg-yellow-100 text-yellow-700',
      'PAID': 'bg-blue-100 text-blue-700',
      'RETURNED': 'bg-green-100 text-green-700',
      'FORFEITED': 'bg-red-100 text-red-700',
      'CARRIED': 'bg-purple-100 text-purple-700'
    }
    const labels: Record<string, string> = {
      'NONE': '미설정',
      'UNPAID': '미납',
      'PAID': '납부완료',
      'RETURNED': '반환완료',
      'FORFEITED': '차감완료',
      'CARRIED': '이월'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles['NONE']}`}>
        {labels[status] || status}
      </span>
    )
  }

  const filteredParticipants = participants.filter(p => {
    // Filter by status
    if (filter !== 'all') {
      if (filter === 'pending' && !['PAID'].includes(p.depositStatus)) return false
      if (filter === 'paid' && p.depositStatus !== 'PAID') return false
      if (filter === 'settled' && !['RETURNED', 'FORFEITED', 'CARRIED'].includes(p.depositStatus)) return false
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        p.user.name?.toLowerCase().includes(searchLower) ||
        p.user.email.toLowerCase().includes(searchLower) ||
        p.program.title.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">입금 관리</h1>
          <p className="text-gray-600">프로그램 보증금 현황</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">총 보증금</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalPaid)}원</p>
            <p className="text-xs text-gray-400 mt-1">{summary.paidCount}명 납부</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">반환 완료</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalReturned)}원</p>
            <p className="text-xs text-gray-400 mt-1">{summary.returnedCount}명</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">차감 완료</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalForfeited)}원</p>
            <p className="text-xs text-gray-400 mt-1">{summary.forfeitedCount}명</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">정산 대기</p>
            <p className="text-xl font-bold text-blue-600">{summary.pendingCount}명</p>
            <p className="text-xs text-gray-400 mt-1">납부 후 미정산</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 이메일, 프로그램명 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="paid">납부 완료</option>
              <option value="pending">정산 대기</option>
              <option value="settled">정산 완료</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">참여자</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">프로그램</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">보증금</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">상태</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">출석률</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">반환/차감</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">정산일</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredParticipants.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{p.user.name || '이름없음'}</p>
                      <p className="text-xs text-gray-500">{p.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 max-w-[200px] truncate">{p.program.title}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(p.depositAmount)}원</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(p.depositStatus)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.finalAttendanceRate !== null ? (
                      <span className={`font-medium ${p.finalAttendanceRate >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                        {p.finalAttendanceRate.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.returnAmount ? (
                      <span className="text-green-600">+{formatCurrency(p.returnAmount)}원</span>
                    ) : p.forfeitAmount ? (
                      <span className="text-red-600">-{formatCurrency(p.forfeitAmount)}원</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {formatDate(p.settledAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/programs/${p.program.id}?tab=deposit`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      상세 <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">보증금 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>안내:</strong> 보증금 정산은 각 프로그램 상세 페이지의 &apos;보증금&apos; 탭에서 진행할 수 있습니다.
          출석률에 따라 반환 또는 차감 금액이 자동 계산됩니다.
        </p>
      </div>
    </div>
  )
}
