'use client'

import { useState } from 'react'
import {
  MIGRANT_CATEGORY_LIST,
  MIGRANT_BACKGROUND_CATEGORIES,
  getMigrantCategoryLabel,
  getCategoryColorClasses,
} from '@/lib/constants/migrant'
import { ChevronDown, Check } from 'lucide-react'

interface OriginCategorySelectProps {
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  multiple?: boolean
  includeKorean?: boolean
  placeholder?: string
  label?: string
  required?: boolean
  error?: string
  className?: string
}

export function OriginCategorySelect({
  value,
  onChange,
  multiple = false,
  includeKorean = false,
  placeholder = '카테고리 선택',
  label,
  required = false,
  error,
  className = '',
}: OriginCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const categories = includeKorean ? MIGRANT_CATEGORY_LIST : MIGRANT_BACKGROUND_CATEGORIES

  const selectedValues = multiple
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : []
  const singleValue = !multiple ? (Array.isArray(value) ? value[0] : value) : null

  const handleSelect = (categoryValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(categoryValue)
        ? selectedValues.filter((v) => v !== categoryValue)
        : [...selectedValues, categoryValue]
      onChange(newValues.length > 0 ? newValues : null)
    } else {
      onChange(categoryValue === singleValue ? null : categoryValue)
      setIsOpen(false)
    }
  }

  const getDisplayText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) return getMigrantCategoryLabel(selectedValues[0])
      return `${getMigrantCategoryLabel(selectedValues[0])} 외 ${selectedValues.length - 1}개`
    }
    return singleValue ? getMigrantCategoryLabel(singleValue) : placeholder
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-lg bg-white text-left transition-colors ${
          error ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
      >
        <span className={singleValue || selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {categories.map((category) => {
            const isSelected = multiple
              ? selectedValues.includes(category.value)
              : singleValue === category.value
            const colors = getCategoryColorClasses(category.value)

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => handleSelect(category.value)}
                className={`w-full flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                {multiple && (
                  <div
                    className={`w-5 h-5 mr-3 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${colors.bg} ${colors.text}`}
                >
                  {category.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
