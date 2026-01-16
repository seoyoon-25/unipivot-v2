'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Calendar, Users, Edit3, Trash2, ExternalLink, ArrowUpDown } from 'lucide-react'
import { deleteProgram } from '@/lib/actions/admin'

interface Program {
  id: string
  slug: string
  title: string
  type: string
  status: string
  capacity: number
  startDate: Date | null
  _count: { registrations: number }
}

interface Props {
  programs: Program[]
  total: number
  pages: number
  currentPage: number
  searchParams: { search?: string; type?: string; status?: string }
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

export default function ProgramsGrid({ programs, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [type, setType] = useState(searchParams.type || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (status) params.set('status', status)
    router.push(`/admin/programs?${params.toString()}`)
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
      <div className="flex items-center justify-between mb-8">
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
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
            onChange={(e) => setStatus(e.target.value)}
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

      {/* Programs Grid */}
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
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(program.status)}`}>
                    {getStatusLabel(program.status)}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">{program.title}</h3>
                  <p className="text-gray-500 text-sm">{getTypeLabel(program.type)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/programs/${program.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-500"
                    title="새 탭에서 보기"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/programs/${program.slug}/edit`}
                    className="p-2 text-gray-400 hover:text-primary"
                    title="수정"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(program.id, program.title)}
                    disabled={deleting === program.id}
                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {program.startDate
                    ? new Date(program.startDate).toLocaleDateString('ko-KR')
                    : '미정'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {program._count.registrations}/{program.capacity}명
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">참여율</span>
                  <span className="text-primary font-medium">
                    {Math.round((program._count.registrations / program.capacity) * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (program._count.registrations / program.capacity) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
