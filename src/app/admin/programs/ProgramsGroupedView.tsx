'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Search, Calendar, Users, Edit3, Trash2, ExternalLink, ArrowUpDown, Clock, MapPin, Monitor, ClipboardList, UserCheck, BookOpen, BarChart3, AlertCircle } from 'lucide-react'
import { deleteProgram } from '@/lib/actions/admin'

interface Program {
  id: string
  slug: string
  title: string
  type: string
  status: string
  capacity: number
  startDate: Date | null
  endDate: Date | null
  recruitStartDate: Date | null
  recruitEndDate: Date | null
  image: string | null
  imagePosition: number
  isOnline: boolean
  _count: { registrations: number }
  calculatedStatus: string
  isUrgent: boolean
}

// 날짜 포맷 함수
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 짧은 날짜 포맷 (년도 제외)
function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

// D-Day 계산 함수
function getDaysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// D-Day 텍스트
function getDDayText(days: number | null): string {
  if (days === null) return ''
  if (days === 0) return 'D-Day'
  if (days === 1) return '내일 마감!'
  if (days < 0) return '마감됨'
  return `D-${days}`
}

interface Props {
  recruiting: Program[]
  ongoing: Program[]
  completed: Program[]
  other: Program[]
  total: number
  searchParams: { search?: string; type?: string; status?: string; delivery?: string }
}

function getTypeLabel(type: string) {
  const types: Record<string, string> = {
    'BOOKCLUB': '독서모임',
    'SEMINAR': '강연/세미나',
    'KMOVE': 'K-Move',
    'DEBATE': '토론회'
  }
  return types[type] || type
}

export default function ProgramsGroupedView({ recruiting, ongoing, completed, other, total, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [type, setType] = useState(searchParams.type || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [delivery, setDelivery] = useState(searchParams.delivery || '')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showAllCompleted, setShowAllCompleted] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (status) params.set('status', status)
    if (delivery) params.set('delivery', delivery)
    router.push(`/admin/programs?${params.toString()}`)
  }

  // 필터링 함수
  const filterPrograms = (programs: Program[]) => {
    return programs.filter(p => {
      // 배송 방식 필터
      if (delivery === 'online' && !p.isOnline) return false
      if (delivery === 'offline' && p.isOnline) return false
      return true
    })
  }

  // 필터링된 프로그램 목록
  const filteredRecruiting = filterPrograms(recruiting)
  const filteredOngoing = filterPrograms(ongoing)
  const filteredCompleted = filterPrograms(completed)
  const filteredOther = filterPrograms(other)

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

  const ProgramCard = ({ program, statusColor }: { program: Program; statusColor: string }) => {
    const isFull = program.capacity > 0 && program._count.registrations >= program.capacity
    const participationRate = program.capacity > 0 ? Math.round((program._count.registrations / program.capacity) * 100) : 0
    const daysUntilDeadline = getDaysUntil(program.recruitEndDate)
    const dDayText = getDDayText(daysUntilDeadline)

    return (
      <div className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group ${
        program.isUrgent ? 'ring-2 ring-red-500 ring-offset-2' : ''
      }`}>
        {/* 썸네일 영역 */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          {program.image ? (
            <img
              src={program.image}
              alt={program.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ objectPosition: `center ${program.imagePosition ?? 0}%` }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-30">
                {program.type === 'BOOKCLUB' && '📚'}
                {program.type === 'SEMINAR' && '🎤'}
                {program.type === 'KMOVE' && '🌏'}
                {program.type === 'DEBATE' && '💬'}
                {!['BOOKCLUB', 'SEMINAR', 'KMOVE', 'DEBATE'].includes(program.type) && '📋'}
              </span>
            </div>
          )}

          {/* 상태 배지 (썸네일 위 왼쪽) */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className={`px-3 py-1 text-xs font-bold rounded-full text-white shadow-lg ${statusColor}`}>
              {program.calculatedStatus}
            </span>
            {program.isUrgent && daysUntilDeadline !== null && daysUntilDeadline >= 0 && (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white shadow-lg animate-pulse">
                🔥 {dDayText}
              </span>
            )}
          </div>

          {/* 온/오프라인 배지 (썸네일 위 오른쪽) */}
          <div className="absolute top-3 right-3">
            <span className={`
              inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full shadow-lg
              ${program.isOnline
                ? 'bg-blue-500 text-white'
                : 'bg-orange-500 text-white'}
            `}>
              {program.isOnline ? (
                <>
                  <Monitor className="w-3 h-3" />
                  온라인
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3" />
                  오프라인
                </>
              )}
            </span>
          </div>

          {/* 정원 마감 오버레이 */}
          {isFull && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-xl bg-red-500 px-4 py-2 rounded-lg">
                정원 마감
              </span>
            </div>
          )}
        </div>

        {/* 카드 본문 */}
        <div className="p-5">
          {/* 유형 */}
          <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full mb-2">
            {getTypeLabel(program.type)}
          </span>

          {/* 제목 */}
          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
            {program.title}
          </h3>

          {/* 날짜 정보 */}
          <div className="space-y-2 mb-4 text-sm">
            {/* 모집 기간 */}
            {(program.calculatedStatus === '모집중' || program.calculatedStatus === '모집마감') && program.recruitStartDate && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                <span className="truncate">
                  모집: {formatShortDate(program.recruitStartDate)} ~ {formatShortDate(program.recruitEndDate)}
                </span>
              </div>
            )}

            {/* 진행 기간 */}
            {program.startDate && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                <span className="truncate">
                  진행: {formatShortDate(program.startDate)} ~ {formatShortDate(program.endDate)}
                </span>
              </div>
            )}

            {/* 참가자 수 */}
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
              <span>
                참가자: {program._count.registrations}/{program.capacity}명
              </span>
              {isFull && (
                <span className="ml-2 text-xs text-red-600 font-bold">FULL</span>
              )}
            </div>
          </div>

          {/* 참여율 프로그레스 바 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">참여율</span>
              <span className={`font-bold ${participationRate >= 100 ? 'text-red-500' : participationRate >= 80 ? 'text-orange-500' : 'text-primary'}`}>
                {participationRate}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  participationRate >= 100 ? 'bg-red-500' : participationRate >= 80 ? 'bg-orange-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, participationRate)}%` }}
              />
            </div>
          </div>

          {/* 상태별 액션 버튼 */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            {/* 공통 버튼: 새 탭에서 보기, 수정, 삭제 */}
            <div className="flex items-center gap-1">
              <Link
                href={`/programs/${program.slug}`}
                target="_blank"
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="새 탭에서 보기"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/programs/${program.id}/edit`}
                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="수정"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(program.id, program.title)}
                disabled={deleting === program.id}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* 상태별 버튼 */}
            <div className="flex-1 flex justify-end gap-2">
              {/* 모집중/모집마감: 신청 관리 */}
              {(program.calculatedStatus === '모집중' || program.calculatedStatus === '모집마감') && (
                <Link
                  href={`/admin/programs/${program.id}/registrations`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  신청 관리
                </Link>
              )}

              {/* 진행중: 세션/출석/독후감 관리 */}
              {program.calculatedStatus === '진행중' && (
                <>
                  <Link
                    href={`/admin/programs/${program.id}/sessions`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    세션
                  </Link>
                  <Link
                    href={`/admin/programs/${program.id}/attendance`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    출석
                  </Link>
                  <Link
                    href={`/admin/programs/${program.id}/reports`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    독후감
                  </Link>
                </>
              )}

              {/* 완료: 통계 보기 */}
              {program.calculatedStatus === '완료' && (
                <Link
                  href={`/admin/programs/${program.id}/statistics`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  통계 보기
                </Link>
              )}

              {/* 정보없음/준비중: 날짜 설정 알림 */}
              {(program.calculatedStatus === '정보없음' || program.calculatedStatus === '준비중') && (
                <Link
                  href={`/admin/programs/${program.id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  날짜 설정
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayedCompleted = showAllCompleted ? filteredCompleted : filteredCompleted.slice(0, 6)

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
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 방식</option>
            <option value="online">💻 온라인</option>
            <option value="offline">📍 오프라인</option>
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
      {filteredRecruiting.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔥</span>
            <span>모집중</span>
            <span className="text-lg text-gray-500">({filteredRecruiting.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecruiting.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-green-500" />
            ))}
          </div>
        </section>
      )}

      {/* 진행중 섹션 */}
      {filteredOngoing.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔄</span>
            <span>진행중</span>
            <span className="text-lg text-gray-500">({filteredOngoing.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOngoing.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-blue-500" />
            ))}
          </div>
        </section>
      )}

      {/* 완료 섹션 */}
      {filteredCompleted.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>완료</span>
            <span className="text-lg text-gray-500">({filteredCompleted.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCompleted.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-gray-500" />
            ))}
          </div>
          {filteredCompleted.length > 6 && !showAllCompleted && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllCompleted(true)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
              >
                더보기 ({filteredCompleted.length - 6}개 더 있음)
              </button>
            </div>
          )}
          {showAllCompleted && filteredCompleted.length > 6 && (
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
      {filteredOther.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>기타 (날짜 미설정)</span>
            <span className="text-lg text-gray-500">({filteredOther.length}개)</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOther.map((program) => (
              <ProgramCard key={program.id} program={program} statusColor="bg-orange-500" />
            ))}
          </div>
        </section>
      )}

      {/* 빈 상태 */}
      {filteredRecruiting.length === 0 && filteredOngoing.length === 0 && filteredCompleted.length === 0 && filteredOther.length === 0 && (
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
