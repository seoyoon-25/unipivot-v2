'use client'

import { useState, useCallback } from 'react'
import TimelineItemComponent from './TimelineItem'

interface TimelineItemData {
  id: string
  type: 'attendance' | 'report' | 'quote'
  title: string
  description?: string
  link?: string
  createdAt: string
}

interface Props {
  initialItems: TimelineItemData[]
  initialCursor: string | null
  type: string
}

export default function Timeline({ initialItems, initialCursor, type }: Props) {
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = useCallback(async () => {
    if (!cursor || isLoading) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ type, cursor })
      const res = await fetch(`/api/club/timeline?${params}`)
      const data = await res.json()

      setItems((prev) => [...prev, ...data.items.map((item: TimelineItemData & { createdAt: string }) => ({
        ...item,
        createdAt: item.createdAt,
      }))])
      setCursor(data.nextCursor)
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [cursor, type, isLoading])

  // Group by month
  const groupedItems = items.reduce(
    (acc, item) => {
      const date = new Date(item.createdAt)
      const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`
      if (!acc[monthKey]) acc[monthKey] = []
      acc[monthKey].push(item)
      return acc
    },
    {} as Record<string, TimelineItemData[]>
  )

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">아직 기록이 없습니다.</div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([month, monthItems]) => (
        <div key={month}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{month}</h2>
          <div className="relative pl-8 border-l-2 border-gray-200 space-y-6">
            {monthItems.map((item) => (
              <TimelineItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}

      {cursor && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
          >
            {isLoading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  )
}
