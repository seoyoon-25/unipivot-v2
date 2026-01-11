'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Download, MoreVertical, Trash2, Edit } from 'lucide-react'
import { deleteMember } from '@/lib/actions/admin'

interface Member {
  id: string
  name: string | null
  email: string
  origin: string | null
  status: string
  createdAt: Date
  _count: { registrations: number }
}

interface Props {
  members: Member[]
  total: number
  pages: number
  currentPage: number
  searchParams: { search?: string; origin?: string; status?: string }
}

function getOriginLabel(origin: string | null) {
  switch (origin) {
    case 'SOUTH': return '남한'
    case 'NORTH': return '북한'
    case 'OVERSEAS': return '해외'
    default: return '미설정'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'ACTIVE': return '활성'
    case 'INACTIVE': return '비활성'
    case 'BANNED': return '정지'
    default: return status
  }
}

export default function MembersTable({ members, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [origin, setOrigin] = useState(searchParams.origin || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (origin) params.set('origin', origin)
    if (status) params.set('status', status)
    router.push(`/admin/members?${params.toString()}`)
  }

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`정말 ${name || '이 회원'}을(를) 삭제하시겠습니까?`)) return
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
    if (origin) params.set('origin', origin)
    if (status) params.set('status', status)
    params.set('page', page.toString())
    router.push(`/admin/members?${params.toString()}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
          <Download className="w-4 h-4" />
          내보내기
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
                placeholder="이름, 이메일로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 출신</option>
            <option value="SOUTH">남한</option>
            <option value="NORTH">북한</option>
            <option value="OVERSEAS">해외</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
            <option value="BANNED">정지</option>
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
        {members.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search || searchParams.origin || searchParams.status
              ? '검색 결과가 없습니다.'
              : '등록된 회원이 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">회원</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">출신</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">가입일</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">참여 프로그램</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-medium">
                        {member.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name || '이름 없음'}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                      {getOriginLabel(member.origin)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-sm rounded ${
                      member.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                      member.status === 'BANNED' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getStatusLabel(member.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{member._count.registrations}개</td>
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
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 {total}명 중 {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pageNum = i + 1
                if (pages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i
                    if (pageNum > pages) pageNum = pages - 4 + i
                  }
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
