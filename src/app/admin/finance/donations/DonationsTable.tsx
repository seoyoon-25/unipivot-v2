'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, TrendingUp, Check, X } from 'lucide-react'
import { updateDonationStatus } from '@/lib/actions/admin'

interface Donation {
  id: string
  amount: number
  type: string | null
  method: string | null
  message: string | null
  anonymous: boolean
  status: string
  createdAt: Date
  user: { name: string | null; email: string } | null
}

interface Props {
  donations: Donation[]
  total: number
  pages: number
  currentPage: number
  summary: { totalAmount: number; totalCount: number }
  searchParams: { status?: string }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
}

export default function DonationsTable({ donations, total, pages, currentPage, summary, searchParams }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(searchParams.status || '')

  const handleFilter = (newStatus: string) => {
    setStatus(newStatus)
    const params = new URLSearchParams()
    if (newStatus) params.set('status', newStatus)
    router.push(`/admin/finance/donations?${params.toString()}`)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDonationStatus(id, newStatus)
      router.refresh()
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">후원금 관리</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 후원금</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 후원 건수</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalCount}건</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex gap-2">
          {['', 'PENDING', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => handleFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                status === s
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === '' ? '전체' :
               s === 'PENDING' ? '대기' :
               s === 'COMPLETED' ? '완료' : '취소'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {donations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            후원 내역이 없습니다.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">후원자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">금액</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">유형</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">날짜</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {donation.anonymous ? (
                      <span className="text-gray-500">익명</span>
                    ) : donation.user ? (
                      <div>
                        <p className="font-medium text-gray-900">{donation.user.name || '이름 없음'}</p>
                        <p className="text-sm text-gray-500">{donation.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500">비회원</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {donation.type === 'MONTHLY' ? '정기 후원' : '일시 후원'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      donation.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                      donation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {donation.status === 'COMPLETED' ? '완료' :
                       donation.status === 'PENDING' ? '대기' : '취소'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {donation.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusChange(donation.id, 'COMPLETED')}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="승인"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(donation.id, 'CANCELLED')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">총 {total}건</p>
            <div className="flex gap-2">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (status) params.set('status', status)
                    params.set('page', (i + 1).toString())
                    router.push(`/admin/finance/donations?${params.toString()}`)
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
