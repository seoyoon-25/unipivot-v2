'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Send,
  FileText,
  Users,
  ChevronRight,
  Plus,
  BarChart3,
  Calendar,
  AlertCircle,
} from 'lucide-react'

interface Survey {
  id: string
  title: string
  description: string | null
  status: 'DRAFT' | 'SENT' | 'CLOSED'
  deadline: string
  targetCount: number
  responseCount: number
  sentAt: string | null
  createdAt: string
  program: {
    id: string
    title: string
    type: string
  }
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'DRAFT' | 'SENT' | 'CLOSED'>('all')

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const res = await fetch('/api/admin/surveys')
      if (res.ok) {
        const data = await res.json()
        setSurveys(data.surveys)
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.program.title.toLowerCase().includes(searchTerm.toLowerCase())

    if (statusFilter === 'all') return matchesSearch
    return matchesSearch && survey.status === statusFilter
  })

  const stats = {
    total: surveys.length,
    draft: surveys.filter((s) => s.status === 'DRAFT').length,
    sent: surveys.filter((s) => s.status === 'SENT').length,
    closed: surveys.filter((s) => s.status === 'CLOSED').length,
    totalResponses: surveys.reduce((acc, s) => acc + s.responseCount, 0),
    totalTargets: surveys.reduce((acc, s) => acc + s.targetCount, 0),
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: typeof Clock }> = {
      DRAFT: { label: '임시저장', className: 'bg-gray-100 text-gray-700', icon: FileText },
      SENT: { label: '발송됨', className: 'bg-blue-100 text-blue-700', icon: Send },
      CLOSED: { label: '마감', className: 'bg-green-100 text-green-700', icon: CheckCircle },
    }
    return badges[status] || badges.DRAFT
  }

  const getProgramTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      BOOK_CLUB: { label: '북클럽', className: 'bg-blue-50 text-blue-600' },
      SEMINAR: { label: '세미나', className: 'bg-purple-50 text-purple-600' },
      WORKSHOP: { label: '워크샵', className: 'bg-green-50 text-green-600' },
      LECTURE: { label: '강연', className: 'bg-orange-50 text-orange-600' },
      OTHER: { label: '기타', className: 'bg-gray-50 text-gray-600' },
    }
    return types[type] || types.OTHER
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
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
        <div>
          <h1 className="text-2xl font-bold">만족도 조사 관리</h1>
          <p className="text-gray-600">프로그램별 만족도 조사를 관리합니다</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 조사</p>
              <p className="text-xl font-bold">{stats.total}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">진행 중</p>
              <p className="text-xl font-bold text-blue-600">{stats.sent}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 응답</p>
              <p className="text-xl font-bold text-green-600">{stats.totalResponses}건</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">응답률</p>
              <p className="text-xl font-bold text-purple-600">
                {stats.totalTargets > 0
                  ? Math.round((stats.totalResponses / stats.totalTargets) * 100)
                  : 0}
                %
              </p>
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
              placeholder="조사명 또는 프로그램명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'DRAFT', 'SENT', 'CLOSED'] as const).map((status) => {
              const labels = {
                all: '전체',
                DRAFT: '임시저장',
                SENT: '진행 중',
                CLOSED: '마감',
              }
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {labels[status]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredSurveys.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? '검색 결과가 없습니다'
                : '등록된 만족도 조사가 없습니다'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              프로그램 상세 페이지에서 만족도 조사를 생성할 수 있습니다
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredSurveys.map((survey) => {
              const statusBadge = getStatusBadge(survey.status)
              const programType = getProgramTypeBadge(survey.program.type)
              const responseRate =
                survey.targetCount > 0
                  ? Math.round((survey.responseCount / survey.targetCount) * 100)
                  : 0

              return (
                <Link
                  key={survey.id}
                  href={`/admin/programs/${survey.program.id}/survey`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${programType.className}`}
                        >
                          {programType.label}
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusBadge.className}`}
                        >
                          <statusBadge.icon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                        {survey.status === 'SENT' && isDeadlineSoon(survey.deadline) && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            마감 임박
                          </span>
                        )}
                        {survey.status === 'SENT' && isDeadlinePassed(survey.deadline) && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            기한 초과
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">{survey.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{survey.program.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          마감: {formatDate(survey.deadline)}
                        </span>
                        {survey.sentAt && (
                          <span className="flex items-center gap-1">
                            <Send className="w-4 h-4" />
                            발송: {formatDate(survey.sentAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">대상</p>
                        <p className="font-bold">{survey.targetCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">응답</p>
                        <p className="font-bold text-green-600">{survey.responseCount}</p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs text-gray-500">응답률</p>
                        <p
                          className={`font-bold ${
                            responseRate >= 80
                              ? 'text-green-600'
                              : responseRate >= 50
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {responseRate}%
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
