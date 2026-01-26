'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Calendar, Users, Edit3, Trash2, ExternalLink, ArrowUpDown,
  LayoutGrid, List, Clock, MapPin, Globe, DollarSign, BookOpen
} from 'lucide-react'
import { deleteProgram } from '@/lib/actions/admin'

interface Program {
  id: string
  slug: string
  title: string
  type: string
  status: string
  capacity: number | null
  startDate: Date | null
  endDate: Date | null
  recruitEndDate: Date | null
  isOnline: boolean
  feeType: string
  feeAmount: number
  _count: { registrations: number; sessions: number }
}

interface Props {
  programs: Program[]
  total: number
  pages: number
  currentPage: number
  searchParams: { search?: string; type?: string; status?: string; sortBy?: string }
  stats: { status: string; _count: number }[]
  statsTotal: number
}

function getTypeLabel(type: string) {
  const types: Record<string, string> = {
    'BOOKCLUB': '독서모임',
    'SEMINAR': '강연/세미나',
    'KMOVE': 'K-Move',
    'DEBATE': '토론회',
    'WORKSHOP': '워크샵',
    'OTHER': '기타'
  }
  return types[type] || type
}

function getStatusLabel(status: string) {
  const statuses: Record<string, string> = {
    'DRAFT': '준비중',
    'UPCOMING': '모집예정',
    'RECRUITING': '모집중',
    'RECRUIT_CLOSED': '모집마감',
    'ONGOING': '진행중',
    'OPEN': '모집중',
    'CLOSED': '진행중',
    'COMPLETED': '완료'
  }
  return statuses[status] || status
}

function getStatusColor(status: string) {
  switch (status) {
    case 'RECRUITING':
    case 'OPEN': return 'bg-green-100 text-green-600'
    case 'RECRUIT_CLOSED': return 'bg-yellow-100 text-yellow-600'
    case 'ONGOING':
    case 'CLOSED': return 'bg-blue-100 text-blue-600'
    case 'COMPLETED': return 'bg-gray-100 text-gray-600'
    case 'UPCOMING': return 'bg-purple-100 text-purple-600'
    default: return 'bg-yellow-100 text-yellow-600'
  }
}

function formatFee(program: Program): string {
  if (program.feeType === 'FREE') return '무료'
  if (program.feeType === 'DEPOSIT') return `보증금 ${program.feeAmount?.toLocaleString()}원`
  return `${program.feeAmount?.toLocaleString()}원`
}

function isDeadlineSoon(program: Program): boolean {
  if (!program.recruitEndDate) return false
  const daysLeft = Math.ceil((new Date(program.recruitEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return daysLeft >= 0 && daysLeft <= 7
}

function formatDateRange(start: Date | null, end: Date | null): string {
  if (!start) return '-'
  const startStr = new Date(start).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
  const endStr = end ? new Date(end).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : ''
  return endStr ? `${startStr} ~ ${endStr}` : startStr
}

// 통계 카드 데이터
const statCards = [
  { label: '전체', status: 'all', icon: '📋', bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' },
  { label: '모집중', status: 'RECRUITING', icon: '🟢', bgColor: 'bg-green-50', textColor: 'text-green-600', borderColor: 'border-green-200' },
  { label: '진행중', status: 'ONGOING', icon: '🔵', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
  { label: '완료', status: 'COMPLETED', icon: '⚪', bgColor: 'bg-gray-50', textColor: 'text-gray-500', borderColor: 'border-gray-200' },
  { label: '준비중', status: 'DRAFT', icon: '🟡', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', borderColor: 'border-yellow-200' },
]

// 퀵필터 데이터
const quickFilters = [
  { label: '전체', status: '' },
  { label: '모집중', status: 'RECRUITING' },
  { label: '진행중', status: 'ONGOING' },
  { label: '완료', status: 'COMPLETED' },
]

export default function ProgramsGrid({ programs, total, pages, currentPage, searchParams, stats, statsTotal }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [type, setType] = useState(searchParams.type || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [sortBy, setSortBy] = useState(searchParams.sortBy || 'newest')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [deleting, setDeleting] = useState<string | null>(null)

  const getCountByStatus = (s: string) => {
    if (s === 'all') return statsTotal
    const found = stats.find(stat => stat.status === s)
    return found?._count || 0
  }

  const buildUrl = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams()
    const merged = { search, type, status, sortBy, ...params }
    if (merged.search) urlParams.set('search', merged.search)
    if (merged.type) urlParams.set('type', merged.type)
    if (merged.status) urlParams.set('status', merged.status)
    if (merged.sortBy && merged.sortBy !== 'newest') urlParams.set('sortBy', merged.sortBy)
    return `/admin/programs?${urlParams.toString()}`
  }

  const handleSearch = () => {
    router.push(buildUrl({ search, type, status, sortBy }))
  }

  const handleQuickFilter = (newStatus: string) => {
    setStatus(newStatus)
    router.push(buildUrl({ status: newStatus }))
  }

  const handleSort = (newSortBy: string) => {
    setSortBy(newSortBy)
    router.push(buildUrl({ sortBy: newSortBy }))
  }

  const handleStatCardClick = (s: string) => {
    const newStatus = s === 'all' ? '' : s
    setStatus(newStatus)
    router.push(buildUrl({ status: newStatus }))
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`정말 "${title}" 프로그램을 삭제하시겠습니까?`)) return
    setDeleting(id)
    try {
      await deleteProgram(id)
      router.refresh()
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">프로그램 관리</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/programs/order"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            순서 관리
          </Link>
          <Link
            href="/admin/programs/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 프로그램
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {statCards.map(item => {
          const count = getCountByStatus(item.status)
          const isActive = (item.status === 'all' && !status) || status === item.status
          return (
            <button
              key={item.status}
              onClick={() => handleStatCardClick(item.status)}
              className={`${item.bgColor} rounded-xl p-4 text-center cursor-pointer transition-all border-2 ${
                isActive ? `${item.borderColor} shadow-md` : 'border-transparent hover:shadow-md'
              }`}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className={`text-sm ${item.textColor}`}>{item.label}</div>
              <div className={`text-2xl font-bold ${item.textColor}`}>{count}</div>
            </button>
          )
        })}
      </div>

      {/* 검색 필터 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="프로그램 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 유형</option>
            <option value="BOOKCLUB">독서모임</option>
            <option value="SEMINAR">강연/세미나</option>
            <option value="KMOVE">K-Move</option>
            <option value="DEBATE">토론회</option>
            <option value="WORKSHOP">워크샵</option>
            <option value="OTHER">기타</option>
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); handleSearch() }}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="DRAFT">준비중</option>
            <option value="RECRUITING">모집중</option>
            <option value="RECRUIT_CLOSED">모집마감</option>
            <option value="ONGOING">진행중</option>
            <option value="COMPLETED">완료</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* 퀵필터 + 정렬 + 뷰모드 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* 퀵필터 */}
        <div className="flex gap-2">
          {quickFilters.map(filter => {
            const isActive = status === filter.status
            return (
              <button
                key={filter.label}
                onClick={() => handleQuickFilter(filter.status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* 정렬 + 뷰모드 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="name">이름순</option>
              <option value="startDate">시작일순</option>
              <option value="participants">참가자순</option>
            </select>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'card' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="카드 뷰"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="테이블 뷰"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 프로그램 목록 */}
      {programs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
          <p className="text-gray-500">
            {searchParams.search || searchParams.type || searchParams.status
              ? '검색 결과가 없습니다.'
              : '등록된 프로그램이 없습니다.'}
          </p>
          <Link
            href="/admin/programs/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 프로그램 만들기
          </Link>
        </div>
      ) : viewMode === 'card' ? (
        /* 카드 뷰 */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => {
            const participationRate = program.capacity
              ? Math.round((program._count.registrations / program.capacity) * 100)
              : 0

            return (
              <div key={program.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
                {/* 상단: 상태 + 형식 배지 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(program.status)}`}>
                    {getStatusLabel(program.status)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    program.isOnline ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {program.isOnline ? '🌐 온라인' : '📍 오프라인'}
                  </span>
                  {isDeadlineSoon(program) && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                      ⏰ 마감임박
                    </span>
                  )}
                </div>

                {/* 제목 */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{program.title}</h3>

                {/* 정보 그리드 */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{getTypeLabel(program.type)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{formatFee(program)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateRange(program.startDate, program.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{program._count.sessions || 0}회차</span>
                  </div>
                </div>

                {/* 참가자 현황 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">참가자</span>
                    <span className="font-medium">
                      {program._count.registrations}/{program.capacity || '∞'}명
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, participationRate)}%` }}
                    />
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100">
                  <Link
                    href={`/programs/${program.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="새 탭에서 보기"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/programs/${program.slug}/edit`}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                    title="수정"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(program.id, program.title)}
                    disabled={deleting === program.id}
                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* 테이블 뷰 */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">프로그램명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">형식</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기간</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">참가자</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비용</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">세션</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(program.status)}`}>
                          {getStatusLabel(program.status)}
                        </span>
                        {isDeadlineSoon(program) && (
                          <span className="text-red-500 text-xs">⏰</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate font-medium text-gray-900">
                        {program.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {getTypeLabel(program.type)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        program.isOnline ? 'text-purple-600' : 'text-orange-600'
                      }`}>
                        {program.isOnline ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {program.isOnline ? '온라인' : '오프라인'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDateRange(program.startDate, program.endDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="text-gray-900 font-medium">{program._count.registrations}</span>
                      <span className="text-gray-400">/{program.capacity || '∞'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatFee(program)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {program._count.sessions}회
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/programs/${program.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                          title="새 탭에서 보기"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/programs/${program.slug}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(program.id, program.title)}
                          disabled={deleting === program.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
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
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => {
                const params = new URLSearchParams()
                if (search) params.set('search', search)
                if (type) params.set('type', type)
                if (status) params.set('status', status)
                if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy)
                params.set('page', (i + 1).toString())
                router.push(`/admin/programs?${params.toString()}`)
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
      )}
    </div>
  )
}
