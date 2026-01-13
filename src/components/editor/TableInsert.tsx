'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Table } from 'lucide-react'

interface TableInsertProps {
  onSubmit: (rows: number, cols: number) => void
  onClose: () => void
}

export function TableInsert({ onSubmit, onClose }: TableInsertProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [hoverRow, setHoverRow] = useState(0)
  const [hoverCol, setHoverCol] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleGridClick = (r: number, c: number) => {
    onSubmit(r, c)
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">표 삽입</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 그리드 선택 */}
      <div className="mb-3">
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <div
                key={`${r}-${c}`}
                onMouseEnter={() => {
                  setHoverRow(r + 1)
                  setHoverCol(c + 1)
                }}
                onClick={() => handleGridClick(r + 1, c + 1)}
                className={`w-6 h-6 border cursor-pointer transition-colors ${
                  r < hoverRow && c < hoverCol
                    ? 'bg-primary/20 border-primary'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              />
            ))
          )}
        </div>
      </div>

      <p className="text-center text-sm text-gray-600">
        {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} x ${hoverCol}` : '크기 선택'}
      </p>

      {/* 직접 입력 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">직접 입력</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(e) => setRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center"
          />
          <span className="text-gray-400">x</span>
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => setCols(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center"
          />
          <button
            type="button"
            onClick={() => onSubmit(rows, cols)}
            className="flex-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            삽입
          </button>
        </div>
      </div>
    </div>
  )
}
