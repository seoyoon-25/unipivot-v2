'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { programStatusConfig, programTypeConfig } from '@/lib/program/status-calculator'

interface ProgramFiltersProps {
  currentStatus: string
  currentType: string
  currentMode: string
}

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'RECRUITING', label: '모집중' },
  { value: 'RECRUIT_CLOSED', label: '모집마감' },
  { value: 'ONGOING', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
]

const typeOptions = [
  { value: 'all', label: '전체' },
  { value: 'BOOKCLUB', label: '독서모임' },
  { value: 'SEMINAR', label: '강연 및 세미나' },
  { value: 'KMOVE', label: 'K-Move' },
  { value: 'DEBATE', label: '토론회' },
  { value: 'WORKSHOP', label: '워크숍' },
  { value: 'OTHER', label: '기타' },
]

const modeOptions = [
  { value: 'all', label: '전체' },
  { value: 'offline', label: '오프라인' },
  { value: 'online', label: '온라인' },
]

export function ProgramFilters({
  currentStatus,
  currentType,
  currentMode,
}: ProgramFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/programs?${params.toString()}`)
  }

  return (
    <div className="mb-8 flex flex-wrap gap-4">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상태
        </label>
        <select
          value={currentStatus}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          카테고리
        </label>
        <select
          value={currentType}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mode Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          진행방식
        </label>
        <select
          value={currentMode}
          onChange={(e) => updateFilter('mode', e.target.value)}
          className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
        >
          {modeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex items-end">
        <div className="flex gap-2">
          <button
            onClick={() => updateFilter('status', 'RECRUITING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStatus === 'RECRUITING'
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            모집중만 보기
          </button>
          <button
            onClick={() => {
              const params = new URLSearchParams()
              router.push('/programs')
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      </div>
    </div>
  )
}
