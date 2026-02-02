'use client'

import Link from 'next/link'
import type { TimelineItemType } from '@/lib/club/timeline-queries'

interface Props {
  currentType: TimelineItemType | 'all'
}

const filters = [
  { type: 'all', label: '전체' },
  { type: 'attendance', label: '출석' },
  { type: 'report', label: '독후감' },
  { type: 'quote', label: '명문장' },
]

export default function TimelineFilter({ currentType }: Props) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Link
          key={filter.type}
          href={`/club/my/timeline${filter.type === 'all' ? '' : `?type=${filter.type}`}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            currentType === filter.type
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  )
}
