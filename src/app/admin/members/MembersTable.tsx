'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Download, Plus, MoreVertical, Trash2, Edit, Users, UserPlus } from 'lucide-react'
import { deleteMember } from '@/lib/actions/members'
import { MEMBER_GRADES, MEMBER_STATUS } from '@/lib/services/member-matching'

interface MemberStats {
  attendanceRate: number
  reportRate: number
  totalPrograms: number
  noShowCount: number
}

interface Member {
  id: string
  memberCode: string
  name: string
  email: string | null
  phone: string | null
  origin: string | null
  grade: string
  status: string
  joinedAt: Date
  stats: MemberStats | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Stats {
  total: number
  staff: number
  vvip: number
  vip: number
  watch: number
  warning: number
  blocked: number
}

interface Props {
  members: Member[]
  pagination: Pagination
  stats: Stats
  searchParams: {
    search?: string
    grade?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }
}

// 등급 배지
function GradeBadge({ grade }: { grade: string }) {
  const info = MEMBER_GRADES[grade as keyof typeof MEMBER_GRADES]
  if (!info) return <span className="text-gray-500">{grade}</span>

  const colors: Record<string, string> = {
    STAFF: 'bg-purple-100 text-purple-700',
    VVIP: 'bg-indigo-100 text-indigo-700',
    VIP: 'bg-amber-100 text-amber-700',
    MEMBER: 'bg-gray-100 text-gray-600',
    NEW: 'bg-blue-100 text-blue-600',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${colors[grade] || 'bg-gray-100 text-gray-600'}`}>
      {info.emoji} {info.label}
    </span>
  )
}

// 상태 배지
function StatusBadge({ status }: { status: string }) {
  const info = MEMBER_STATUS[status as keyof typeof MEMBER_STATUS]
  if (!info) return <span className="text-gray-500">{status}</span>

  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    WATCH: 'bg-yellow-100 text-yellow-700',
    WARNING: 'bg-orange-100 text-orange-700',
    BLOCKED: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {info.emoji} {info.label}
    </span>
  )
}

// 출신 라벨
function getOriginLabel(origin: string | null) {
  switch (origin) {
    case 'SOUTH': return '남한'
    case 'NORTH': return '북한'
    case 'OVERSEAS': return '해외'
    default: return '-'
  }
}

export default function MembersTable({ members, pagination, stats, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [grade, setGrade] = useState(searchParams.grade || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (grade) params.set('grade', grade)
    if (status) params.set('status', status)
    router.push(`/admin/members?${params.toString()}`)
  }

  const handleFilterClick = (key: 'grade' | 'status', value: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (key === 'grade') {
      if (value) params.set('grade', value)
      if (status) params.set('status', status)
      setGrade(value)
    } else {
      if (value) params.set('status', value)
      if (grade) params.set('grade', grade)
      setStatus(value)
    }
    router.push(`/admin/members?${params.toString()}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`정말 ${name}님을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return
    setDeleting(id)
    try {
      await deleteMember(id)
      router.refresh()
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (grade) params.set('grade', grade)
    if (status) params.set('status', status)
    params.set('page', page.toString())
    router.push(`/admin/members?${params.toString()}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7" />
            회원 관리
            <span className="text-gray-400 font-normal">({stats.total}명)</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            내보내기
          </button>
          <Link
            href="/admin/members/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            회원 등록
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleFilterClick('grade', '')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            !grade && !status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => handleFilterClick('grade', 'STAFF')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            grade === 'STAFF' ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          🌟 운영진 {stats.staff}
        </button>
        <button
          onClick={() => handleFilterClick('grade', 'VVIP')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            grade === 'VVIP' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          💎 VVIP {stats.vvip}
        </button>
        <button
          onClick={() => handleFilterClick('grade', 'VIP')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            grade === 'VIP' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          ⭐ VIP {stats.vip}
        </button>
        <div className="w-px h-8 bg-gray-200 mx-2" />
        <button
          onClick={() => handleFilterClick('status', 'WATCH')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            status === 'WATCH' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          🟡 관찰 {stats.watch}
        </button>
        <button
          onClick={() => handleFilterClick('status', 'WARNING')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            status === 'WARNING' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          }`}
        >
          🟠 경고 {stats.warning}
        </button>
        <button
          onClick={() => handleFilterClick('status', 'BLOCKED')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            status === 'BLOCKED' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          🔴 차단 {stats.blocked}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호, 고유번호로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={searchParams.grade || ''}
            onChange={(e) => handleFilterClick('grade', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 등급</option>
            <option value="STAFF">🌟 운영진</option>
            <option value="VVIP">💎 VVIP</option>
            <option value="VIP">⭐ VIP</option>
            <option value="MEMBER">👤 일반</option>
            <option value="NEW">🆕 신규</option>
          </select>
          <select
            value={searchParams.status || ''}
            onChange={(e) => handleFilterClick('status', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">✅ 정상</option>
            <option value="WATCH">🟡 관찰</option>
            <option value="WARNING">🟠 경고</option>
            <option value="BLOCKED">🔴 차단</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search || searchParams.grade || searchParams.status
              ? '검색 결과가 없습니다.'
              : '등록된 회원이 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">고유번호</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">회원</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">출신</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">등급</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">참여</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">출석률</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">{member.memberCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-medium">
                        {member.name?.[0] || '?'}
                      </div>
                      <div>
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="font-medium text-gray-900 hover:text-primary"
                        >
                          {member.name}
                        </Link>
                        <p className="text-sm text-gray-500">{member.email || member.phone || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{getOriginLabel(member.origin)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <GradeBadge grade={member.grade} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">{member.stats?.totalPrograms || 0}회</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm ${
                      (member.stats?.attendanceRate || 0) >= 80 ? 'text-green-600' :
                      (member.stats?.attendanceRate || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {member.stats?.attendanceRate ? `${Math.round(member.stats.attendanceRate)}%` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                        title="상세보기"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        disabled={deleting === member.id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 {pagination.total}명 중 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1
                if (pagination.totalPages > 5) {
                  if (pagination.page > 3) {
                    pageNum = pagination.page - 2 + i
                    if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - 4 + i
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
