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
  calculatedStatus: string
  isUrgent: boolean
}

interface Props {
  recruiting: Program[]
  ongoing: Program[]
  completed: Program[]
  other: Program[]
  total: number
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

export default function ProgramsGroupedView({ recruiting, ongoing, completed, other, total, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [type, setType] = useState(searchParams.type || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showAllCompleted, setShowAllCompleted] = useState(false)

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

  const ProgramCard = ({ program, statusColor }: { program: Program; statusColor: string }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${statusColor}`}>
              {program.calculatedStatus}
            </span>
            {program.isUrgent && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500 text-white animate-pulse">
                🔥 마감임박
              </span>
            )}
          </div>
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
            href={`/admin/programs/${program.id}/edit`}
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
            {program.capacity > 0 ? Math.round((program._count.registrations / program.capacity) * 100) : 0}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${program.capacity > 0 ? Math.min(100, (program._count.registrations / program.capacity) * 100) : 0}%` }}
          />
        </div>
      </div>
    </div>
  )

  const displayedCompleted = showAllCompleted ? completed : completed.slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      <div className="bg-white rounded-2xl p-4 shadow-sm">
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

      {/* 전체 통계 */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-500">전체</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600">{recruiting.length}</div>
          <div className="text-sm text-green-600">모집중</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600">{ongoing.length}</div>
          <div className="text-sm text-blue-600">진행중</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-600">{completed.length}</div>
          <div className="text-sm text-gray-600">완료</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-orange-600">{other.length}</div>
          <div className="text-sm text-orange-600">기타</div>
        </div>
      </div>

      {/* 모집중 섹션 */}
      {recruiting.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔥</span>
            <span>모집중</span>
            <span className="text-lg text-gray-500">({recruiting.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruiting.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-green-500" />
            ))}
          </div>
        </section>
      )}

      {/* 진행중 섹션 */}
      {ongoing.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔄</span>
            <span>진행중</span>
            <span className="text-lg text-gray-500">({ongoing.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoing.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-blue-500" />
            ))}
          </div>
        </section>
      )}

      {/* 완료 섹션 */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>완료</span>
            <span className="text-lg text-gray-500">({completed.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCompleted.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-gray-500" />
            ))}
          </div>
          {completed.length > 6 && !showAllCompleted && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllCompleted(true)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
              >
                더보기 ({completed.length - 6}개 더 있음)
              </button>
            </div>
          )}
          {showAllCompleted && completed.length > 6 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllCompleted(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
              >
                접기
              </button>
            </div>
          )}
        </section>
      )}

      {/* 기타 섹션 (정보없음/준비중/대기중) */}
      {other.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>기타 (날짜 미설정)</span>
            <span className="text-lg text-gray-500">({other.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {other.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-orange-500" />
            ))}
          </div>
        </section>
      )}

      {/* 빈 상태 */}
      {recruiting.length === 0 && ongoing.length === 0 && completed.length === 0 && other.length === 0 && (
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
      )}
    </div>
  )
}
