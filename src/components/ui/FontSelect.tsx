'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { KOREAN_FONTS, FONT_CATEGORIES, getFontById } from '@/lib/constants/korean-fonts'
import { loadFont } from '@/lib/utils/font-loader'

interface FontSelectProps {
  value: string
  onChange: (fontId: string) => void
  showPreview?: boolean
  category?: string
  label?: string
  placeholder?: string
  className?: string
}

export function FontSelect({
  value,
  onChange,
  showPreview = true,
  category,
  label,
  placeholder = '폰트 선택',
  className = '',
}: FontSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 필터링된 폰트 목록
  const filteredFonts = category
    ? KOREAN_FONTS.filter((f) => f.category === category)
    : KOREAN_FONTS

  // 카테고리별 그룹핑
  const groupedFonts = category
    ? null
    : FONT_CATEGORIES.map((cat) => ({
        ...cat,
        fonts: KOREAN_FONTS.filter((f) => f.category === cat.value),
      }))

  // 선택된 폰트
  const selectedFont = getFontById(value)

  // 드롭다운 열릴 때 폰트 로드
  useEffect(() => {
    if (isOpen) {
      const fontsToLoad = filteredFonts.filter((f) => !loadedFonts.has(f.id))
      fontsToLoad.forEach((font) => {
        loadFont(font.id).then(() => {
          setLoadedFonts((prev) => new Set(Array.from(prev).concat(font.id)))
        })
      })
    }
  }, [isOpen, filteredFonts, loadedFonts])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (fontId: string) => {
    onChange(fontId)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      {/* 선택 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-lg bg-white text-left transition-colors hover:border-gray-400 ${
          isOpen ? 'ring-2 ring-primary border-primary' : 'border-gray-300'
        }`}
      >
        <span
          className={selectedFont ? 'text-gray-900' : 'text-gray-500'}
          style={selectedFont ? { fontFamily: selectedFont.cssFamily } : undefined}
        >
          {selectedFont ? selectedFont.nameKo : placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 미리보기 */}
      {showPreview && selectedFont && (
        <div
          className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-600"
          style={{ fontFamily: selectedFont.cssFamily }}
        >
          다람쥐 헌 쳇바퀴에 타고파 1234567890
        </div>
      )}

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
          {groupedFonts ? (
            // 카테고리별 그룹핑
            groupedFonts.map((group) => (
              <div key={group.id}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                  {group.label}
                </div>
                {group.fonts.map((font) => (
                  <FontOption
                    key={font.id}
                    font={font}
                    isSelected={value === font.id}
                    isLoaded={loadedFonts.has(font.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ))
          ) : (
            // 단일 카테고리
            filteredFonts.map((font) => (
              <FontOption
                key={font.id}
                font={font}
                isSelected={value === font.id}
                isLoaded={loadedFonts.has(font.id)}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// 폰트 옵션 컴포넌트
function FontOption({
  font,
  isSelected,
  isLoaded,
  onSelect,
}: {
  font: (typeof KOREAN_FONTS)[0]
  isSelected: boolean
  isLoaded: boolean
  onSelect: (fontId: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(font.id)}
      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{font.nameKo}</span>
          {font.recommended && (
            <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded">
              추천
            </span>
          )}
        </div>
        <div
          className="text-sm text-gray-500 truncate mt-0.5"
          style={isLoaded ? { fontFamily: font.cssFamily } : undefined}
        >
          {isLoaded ? '다람쥐 헌 쳇바퀴에 타고파' : font.name}
        </div>
      </div>
      {isSelected && <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />}
    </button>
  )
}
