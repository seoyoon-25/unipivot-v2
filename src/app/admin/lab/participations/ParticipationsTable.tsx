'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, User, Mail, Phone, CheckCircle, Clock, XCircle, DollarSign, ClipboardList, Mic } from 'lucide-react'
import {
  getMigrantCategoryLabel,
  getCategoryColorClasses,
} from '@/lib/constants/migrant'

interface Participation {
  id: string
  surveyId: string
  expertId: string | null
  userId: string | null
  name: string | null
  email: string | null
  phone: string | null
  origin: string | null
  originCategory: string | null
  originCountry: string | null
  status: string
  responses: string | null
  completedAt: Date | null
  rewardStatus: string
  rewardAmount: number | null
  paidAt: Date | null
  note: string | null
  createdAt: Date
  survey: {
    id: string
    title: string
    type: string
    rewardAmount: number | null
  }
  expert: {
    id: string
    name: string
    email: string
    originCategory: string | null
  } | null
}

interface Survey {
  id: string
  title: string
}

interface Props {
  participations: Participation[]
  surveys: Survey[]
  total: number
  pages: number
  currentPage: number
  searchParams: { status?: string; rewardStatus?: string; search?: string; surveyId?: string }
}

const statusLabels: Record<string, string> = {
  APPLIED: '신청',
  APPROVED: '승인',
  COMPLETED: '완료',
  CANCELLED: '취소',
  REJECTED: '거절',
}

const statusStyles: Record<string, string> = {
  APPLIED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-red-100 text-red-700',
}

const rewardStatusLabels: Record<string, string> = {
  PENDING: '대기',
  PAID: '지급완료',
  CANCELLED: '취소',
}

const rewardStatusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

// 출신 카테고리 표시 (새 필드 우선, 하위 호환)
function getOriginDisplay(p: Participation): { label: string; colorClasses: ReturnType<typeof getCategoryColorClasses> } {
  // 전문가 정보가 있으면 전문가의 originCategory 사용
  if (p.expert?.originCategory) {
    return {
      label: getMigrantCategoryLabel(p.expert.originCategory),
      colorClasses: getCategoryColorClasses(p.expert.originCategory),
    }
  }
  // 참여자 본인의 originCategory 사용
  if (p.originCategory) {
    return {
      label: getMigrantCategoryLabel(p.originCategory),
      colorClasses: getCategoryColorClasses(p.originCategory),
    }
  }
  // 하위 호환성: origin 필드 기반
  if (p.origin === 'NORTH') {
    return {
      label: '북한이탈주민',
      colorClasses: getCategoryColorClasses('DEFECTOR'),
    }
  }
  if (p.origin === 'SOUTH') {
    return {
      label: '내국인',
      colorClasses: getCategoryColorClasses('KOREAN'),
    }
  }
  return {
    label: '-',
    colorClasses: getCategoryColorClasses(null),
  }
}

export default function ParticipationsTable({ participations, surveys, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [rewardStatus, setRewardStatus] = useState(searchParams.rewardStatus || '')
  const [surveyId, setSurveyId] = useState(searchParams.surveyId || '')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (rewardStatus) params.set('rewardStatus', rewardStatus)
    if (surveyId) params.set('surveyId', surveyId)
    router.push(`/admin/lab/participations?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (rewardStatus) params.set('rewardStatus', rewardStatus)
    if (surveyId) params.set('surveyId', surveyId)
    params.set('page', page.toString())
    router.push(`/admin/lab/participations?${params.toString()}`)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/lab/participations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleRewardStatusChange = async (id: string, newStatus: string, amount?: number) => {
    try {
      const body: any = { rewardStatus: newStatus }
      if (newStatus === 'PAID') {
        body.paidAt = new Date().toISOString()
        if (amount) body.rewardAmount = amount
      }
      const res = await fetch(`/api/admin/lab/participations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating reward status:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">연구참여 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}건의 참여 신청</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-w-[200px]"
          >
            <option value="">전체 설문</option>
            {surveys.map((survey) => (
              <option key={survey.id} value={survey.id}>
                {survey.title.length > 20 ? survey.title.slice(0, 20) + '...' : survey.title}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="APPLIED">신청</option>
            <option value="APPROVED">승인</option>
            <option value="COMPLETED">완료</option>
            <option value="CANCELLED">취소</option>
            <option value="REJECTED">거절</option>
          </select>
          <select
            value={rewardStatus}
            onChange={(e) => setRewardStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">사례비 상태</option>
            <option value="PENDING">대기</option>
            <option value="PAID">지급완료</option>
            <option value="CANCELLED">취소</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {participations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search || searchParams.status || searchParams.rewardStatus || searchParams.surveyId
              ? '검색 결과가 없습니다.'
              : '등록된 참여 신청이 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">참가자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">설문조사</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">출신</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">신청일</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">참여상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">사례비</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {participations.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {p.expert?.name || p.name || '-'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {p.expert?.email || p.email || '-'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {p.survey.type === 'INTERVIEW' ? (
                        <Mic className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ClipboardList className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-gray-900 max-w-[200px] truncate">
                        {p.survey.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const display = getOriginDisplay(p)
                      return (
                        <span className={`px-2 py-1 text-xs rounded ${display.colorClasses.bg} ${display.colorClasses.text}`}>
                          {display.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${statusStyles[p.status]}`}
                    >
                      <option value="APPLIED">신청</option>
                      <option value="APPROVED">승인</option>
                      <option value="COMPLETED">완료</option>
                      <option value="CANCELLED">취소</option>
                      <option value="REJECTED">거절</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={p.rewardStatus}
                        onChange={(e) => handleRewardStatusChange(p.id, e.target.value, p.survey.rewardAmount || undefined)}
                        disabled={p.status !== 'COMPLETED'}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${rewardStatusStyles[p.rewardStatus]}`}
                      >
                        <option value="PENDING">대기</option>
                        <option value="PAID">지급완료</option>
                        <option value="CANCELLED">취소</option>
                      </select>
                      {p.rewardAmount && (
                        <span className="text-sm text-gray-500">
                          {p.rewardAmount.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 {total}건 중 {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pageNum = i + 1
                if (pages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i
                  if (pageNum > pages) pageNum = pages - 4 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pages}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
