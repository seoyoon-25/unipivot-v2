'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const PRESET_COLORS = [
  // 기본 색상
  ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff'],
  // 색상 팔레트
  ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff'],
  ['#9900ff', '#ff00ff', '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3'],
  ['#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc', '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599'],
]

interface ColorPickerProps {
  onSelect: (color: string) => void
  onClose: () => void
  showClear?: boolean
  onClear?: () => void
}

export function ColorPicker({ onSelect, onClose, showClear, onClear }: ColorPickerProps) {
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

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">색상 선택</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {PRESET_COLORS.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onSelect(color)}
                className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        ))}
      </div>

      {showClear && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 w-full py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          색상 제거
        </button>
      )}

      <div className="mt-2 pt-2 border-t border-gray-100">
        <label className="text-xs text-gray-500">직접 입력</label>
        <input
          type="color"
          onChange={(e) => onSelect(e.target.value)}
          className="w-full h-8 mt-1 rounded cursor-pointer"
        />
      </div>
    </div>
  )
}
