'use client'

import Link from 'next/link'

interface Props {
  currentPeriod: string
}

const periods = [
  { value: '3m', label: '3개월' },
  { value: '6m', label: '6개월' },
  { value: '1y', label: '1년' },
  { value: 'all', label: '전체' },
]

export default function StatsPeriodFilter({ currentPeriod }: Props) {
  return (
    <div className="flex gap-1">
      {periods.map((p) => (
        <Link
          key={p.value}
          href={`/club/my/stats?period=${p.value}`}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            currentPeriod === p.value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  )
}
