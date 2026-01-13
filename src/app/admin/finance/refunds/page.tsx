'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Wallet,
  Users,
  Clock,
  CheckCircle,
  Heart,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react'

interface ProgramRefundSummary {
  id: string
  title: string
  type: string
  endDate: string | null
  depositSetting: {
    depositAmount: number
    surveyRequired: boolean
  } | null
  _count: {
    applications: number
  }
  refundStats: {
    total: number
    pending: number
    completed: number
    donated: number
  }
}

export default function RefundsPage() {
  const [programs, setPrograms] = useState<ProgramRefundSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/admin/finance/refunds')
      if (res.ok) {
        const data = await res.json()
        setPrograms(data.programs)
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === 'pending') {
      return matchesSearch && program.refundStats.pending > 0
    } else if (filter === 'completed') {
      return matchesSearch && program.refundStats.pending === 0 && program.refundStats.completed > 0
    }
    return matchesSearch
  })

  const totalStats = programs.reduce(
    (acc, p) => ({
      total: acc.total + p.refundStats.total,
      pending: acc.pending + p.refundStats.pending,
      completed: acc.completed + p.refundStats.completed,
      donated: acc.donated + p.refundStats.donated,
    }),
    { total: 0, pending: 0, completed: 0, donated: 0 }
  )

  const getProgramTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      BOOK_CLUB: { label: '북클럽', className: 'bg-blue-100 text-blue-700' },
      SEMINAR: { label: '세미나', className: 'bg-purple-100 text-purple-700' },
      WORKSHOP: { label: '워크샵', className: 'bg-green-100 text-green-700' },
      LECTURE: { label: '강연', className: 'bg-orange-100 text-orange-700' },
      OTHER: { label: '기타', className: 'bg-gray-100 text-gray-700' },
    }
    return types[type] || types.OTHER
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/finance"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">보증금 반환 관리</h1>
            <p className="text-gray-600">프로그램별 보증금 반환 현황을 관리합니다</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 대상</p>
              <p className="text-xl font-bold">{totalStats.total}명</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">반환 대기</p>
              <p className="text-xl font-bold text-yellow-600">{totalStats.pending}명</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">반환 완료</p>
              <p className="text-xl font-bold text-green-600">{totalStats.completed}명</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">후원 전환</p>
              <p className="text-xl font-bold text-pink-600">{totalStats.donated}명</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="프로그램 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              반환 대기
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              완료
            </button>
          </div>
        </div>
      </div>

      {/* Programs List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredPrograms.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || filter !== 'all'
                ? '검색 결과가 없습니다'
                : '보증금 반환 대상 프로그램이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredPrograms.map((program) => {
              const typeBadge = getProgramTypeBadge(program.type)
              const hasPending = program.refundStats.pending > 0

              return (
                <Link
                  key={program.id}
                  href={`/admin/programs/${program.id}/refund`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadge.className}`}
                        >
                          {typeBadge.label}
                        </span>
                        {hasPending && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            처리 필요
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {program.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>보증금: {(program.depositSetting?.depositAmount || 0).toLocaleString()}원</span>
                        <span>참가자: {program._count.applications}명</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">대기</p>
                        <p className={`font-bold ${hasPending ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {program.refundStats.pending}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">완료</p>
                        <p className="font-bold text-green-600">
                          {program.refundStats.completed}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">후원</p>
                        <p className="font-bold text-pink-600">
                          {program.refundStats.donated}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
