'use client'

import {
  MIGRANT_BACKGROUND_CATEGORIES,
  getMigrantCategoryLabel,
  getCategoryColorClasses,
} from '@/lib/constants/migrant'

interface OriginCategoryFilterProps {
  value: string | null
  onChange: (value: string | null) => void
  showAll?: boolean
  allLabel?: string
  className?: string
}

export function OriginCategoryFilter({
  value,
  onChange,
  showAll = true,
  allLabel = '전체',
  className = '',
}: OriginCategoryFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showAll && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === null
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {allLabel}
        </button>
      )}
      {MIGRANT_BACKGROUND_CATEGORIES.map((category) => {
        const isSelected = value === category.value
        const colors = getCategoryColorClasses(category.value)

        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(isSelected ? null : category.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.labelShort}
          </button>
        )
      })}
    </div>
  )
}

// 멀티 선택 필터
interface OriginCategoryMultiFilterProps {
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function OriginCategoryMultiFilter({
  value,
  onChange,
  className = '',
}: OriginCategoryMultiFilterProps) {
  const toggleCategory = (categoryValue: string) => {
    if (value.includes(categoryValue)) {
      onChange(value.filter((v) => v !== categoryValue))
    } else {
      onChange([...value, categoryValue])
    }
  }

  const selectAll = () => {
    onChange(MIGRANT_BACKGROUND_CATEGORIES.map((c) => c.value))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          전체 선택
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          선택 해제
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {MIGRANT_BACKGROUND_CATEGORIES.map((category) => {
          const isSelected = value.includes(category.value)
          const colors = getCategoryColorClasses(category.value)

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => toggleCategory(category.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isSelected
                  ? `${colors.bg} ${colors.text} ${colors.border}`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
