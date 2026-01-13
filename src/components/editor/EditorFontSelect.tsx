'use client'

import { useState, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { ChevronDown, Check } from 'lucide-react'
import { KOREAN_FONTS, FONT_CATEGORIES, getFontById } from '@/lib/constants/korean-fonts'
import { loadFont } from '@/lib/utils/font-loader'

interface EditorFontSelectProps {
  editor: Editor
}

export function EditorFontSelect({ editor }: EditorFontSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  // 현재 선택된 폰트 가져오기
  const currentFontFamily = editor.getAttributes('textStyle').fontFamily
  const currentFont = KOREAN_FONTS.find((f) => f.cssFamily === currentFontFamily)

  // 드롭다운 열릴 때 폰트 로드
  useEffect(() => {
    if (isOpen) {
      KOREAN_FONTS.forEach((font) => {
        if (!loadedFonts.has(font.id)) {
          loadFont(font.id).then(() => {
            setLoadedFonts((prev) => new Set(Array.from(prev).concat(font.id)))
          })
        }
      })
    }
  }, [isOpen, loadedFonts])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (fontId: string) => {
    const font = getFontById(fontId)
    if (font) {
      loadFont(fontId).then(() => {
        editor.chain().focus().setFontFamily(font.cssFamily).run()
        setIsOpen(false)
      })
    }
  }

  const handleClear = () => {
    editor.chain().focus().unsetFontFamily().run()
    setIsOpen(false)
  }

  // 카테고리별 그룹핑
  const groupedFonts = FONT_CATEGORIES.map((cat) => ({
    ...cat,
    fonts: KOREAN_FONTS.filter((f) => f.category === cat.value),
  }))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm transition-colors ${
          isOpen ? 'bg-gray-200' : 'hover:bg-gray-100'
        }`}
      >
        <span
          className="min-w-[80px] text-left truncate"
          style={currentFont ? { fontFamily: currentFont.cssFamily } : undefined}
        >
          {currentFont?.nameKo || '폰트'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-64 max-h-80 overflow-auto">
          {/* 기본 폰트 */}
          <button
            type="button"
            onClick={handleClear}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
              !currentFont ? 'bg-primary/5' : ''
            }`}
          >
            <span>기본 폰트</span>
            {!currentFont && <Check className="w-4 h-4 text-primary" />}
          </button>

          {/* 카테고리별 폰트 */}
          {groupedFonts.map((group) => (
            <div key={group.id}>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                {group.label}
              </div>
              {group.fonts.map((font) => {
                const isSelected = currentFont?.id === font.id
                const isLoaded = loadedFonts.has(font.id)

                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleSelect(font.id)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{font.nameKo}</span>
                        {font.recommended && (
                          <span className="px-1 py-0.5 text-[10px] bg-primary/10 text-primary rounded">
                            추천
                          </span>
                        )}
                      </div>
                      <div
                        className="text-xs text-gray-500 truncate"
                        style={isLoaded ? { fontFamily: font.cssFamily } : undefined}
                      >
                        {isLoaded ? '다람쥐 헌 쳇바퀴' : font.name}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
