'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, ChevronLeft, ChevronRight, ClipboardList, Mic, Users, Calendar, Edit, Trash2 } from 'lucide-react'
import SurveyFormModal from './SurveyFormModal'

interface Survey {
  id: string
  title: string
  description: string | null
  type: string
  targetCount: number
  currentCount: number
  targetOrigin: string | null
  targetCategories: string | null
  targetCountries: string | null
  targetAgeMin: number | null
  targetAgeMax: number | null
  targetGender: string | null
  targetConditions: string | null
  questionCount: number | null
  estimatedTime: number | null
  externalUrl: string | null
  rewardType: string
  rewardAmount: number | null
  rewardNote: string | null
  startDate: Date
  endDate: Date
  isExternal: boolean
  requesterOrg: string | null
  status: string
  isPublic: boolean
  createdAt: Date
  _count: {
    participations: number
  }
}

interface Props {
  surveys: Survey[]
  total: number
  pages: number
  currentPage: number
  searchParams: { status?: string; type?: string; search?: string }
}

const statusLabels: Record<string, string> = {
  DRAFT: '임시저장',
  RECRUITING: '진행중',
  CLOSED: '마감',
  COMPLETED: '진행완료',
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  RECRUITING: 'bg-green-100 text-green-700',
  CLOSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

export default function SurveysTable({ surveys, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [type, setType] = useState(searchParams.type || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    router.push(`/admin/lab/surveys?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    params.set('page', page.toString())
    router.push(`/admin/lab/surveys?${params.toString()}`)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/lab/surveys/${id}`, {
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

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 설문/인터뷰를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/lab/surveys/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting survey:', error)
    }
  }

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingSurvey(null)
    setIsModalOpen(true)
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
          <h1 className="text-2xl font-bold text-gray-900">설문/인터뷰 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}개의 설문/인터뷰</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 설문/인터뷰
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 설명, 요청기관으로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="DRAFT">임시저장</option>
            <option value="RECRUITING">진행중</option>
            <option value="CLOSED">마감</option>
            <option value="COMPLETED">진행완료</option>
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 유형</option>
            <option value="SURVEY">설문조사</option>
            <option value="INTERVIEW">인터뷰</option>
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
        {surveys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search || searchParams.status || searchParams.type
              ? '검색 결과가 없습니다.'
              : '등록된 설문/인터뷰가 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">제목</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">유형</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">기간</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">참가자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{survey.title}</p>
                      {survey.requesterOrg && (
                        <p className="text-sm text-gray-500">{survey.requesterOrg}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      {survey.type === 'INTERVIEW' ? (
                        <>
                          <Mic className="w-4 h-4" />
                          인터뷰
                        </>
                      ) : (
                        <>
                          <ClipboardList className="w-4 h-4" />
                          설문조사
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(survey.startDate)} ~ {formatDate(survey.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {survey.currentCount} / {survey.targetCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={survey.status}
                      onChange={(e) => handleStatusChange(survey.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${statusStyles[survey.status]}`}
                    >
                      <option value="DRAFT">임시저장</option>
                      <option value="RECRUITING">진행중</option>
                      <option value="CLOSED">마감</option>
                      <option value="COMPLETED">진행완료</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(survey)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              총 {total}개 중 {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
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

      {/* Form Modal */}
      {isModalOpen && (
        <SurveyFormModal
          survey={editingSurvey}
          onClose={() => {
            setIsModalOpen(false)
            setEditingSurvey(null)
          }}
        />
      )}
    </div>
  )
}
