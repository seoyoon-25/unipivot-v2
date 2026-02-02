'use client'

import { useIsMobile } from '@/hooks/useMediaQuery'
import { type ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  mobileHidden?: boolean
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  renderMobileCard: (item: T) => ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

export default function ResponsiveTable<T>({
  data,
  columns,
  renderMobileCard,
  keyExtractor,
  emptyMessage = '데이터가 없습니다.',
}: Props<T>) {
  const isMobile = useIsMobile()

  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        {emptyMessage}
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div key={keyExtractor(item)}>{renderMobileCard(item)}</div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns
              .filter((col) => !col.mobileHidden)
              .map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                >
                  {col.header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50">
              {columns
                .filter((col) => !col.mobileHidden)
                .map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    {col.render(item)}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
