'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const periods = [
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: '90d', label: '90일' },
  { value: '1y', label: '1년' },
] as const

interface Props {
  currentPeriod: string
}

export default function PeriodFilter({ currentPeriod }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(period: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => handleChange(p.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            currentPeriod === p.value
              ? 'bg-white text-gray-900 font-medium shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
