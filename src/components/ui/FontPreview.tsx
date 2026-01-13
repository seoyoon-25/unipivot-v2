'use client'

import { useEffect, useState } from 'react'
import { getFontById } from '@/lib/constants/korean-fonts'
import { loadFont } from '@/lib/utils/font-loader'

interface FontPreviewProps {
  fontId: string
  text?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  weight?: number
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

const defaultText = '다람쥐 헌 쳇바퀴에 타고파 1234567890'

export function FontPreview({
  fontId,
  text = defaultText,
  size = 'md',
  weight = 400,
  className = '',
}: FontPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const font = getFontById(fontId)

  useEffect(() => {
    if (font) {
      loadFont(fontId).then(() => setIsLoaded(true))
    }
  }, [fontId, font])

  if (!font) {
    return <span className={`text-gray-400 ${sizeClasses[size]} ${className}`}>폰트 없음</span>
  }

  return (
    <span
      className={`${sizeClasses[size]} ${className} transition-opacity ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      }`}
      style={{
        fontFamily: font.cssFamily,
        fontWeight: weight,
      }}
    >
      {text}
    </span>
  )
}

// 전체 폰트 미리보기 카드
interface FontPreviewCardProps {
  fontId: string
  showWeights?: boolean
  className?: string
}

export function FontPreviewCard({
  fontId,
  showWeights = false,
  className = '',
}: FontPreviewCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const font = getFontById(fontId)

  useEffect(() => {
    if (font) {
      loadFont(fontId).then(() => setIsLoaded(true))
    }
  }, [fontId, font])

  if (!font) return null

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{font.nameKo}</h4>
          <p className="text-sm text-gray-500">{font.name}</p>
        </div>
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
          {font.category}
        </span>
      </div>

      <div
        className={`text-lg transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-50'}`}
        style={{ fontFamily: font.cssFamily }}
      >
        다람쥐 헌 쳇바퀴에 타고파
      </div>

      {showWeights && isLoaded && (
        <div className="mt-3 space-y-1">
          {font.weights.map((w) => (
            <div
              key={w}
              className="text-sm text-gray-600"
              style={{ fontFamily: font.cssFamily, fontWeight: w }}
            >
              Weight {w}: 가나다라마바사 ABCDEFG 1234567
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-400">{font.description}</p>
    </div>
  )
}

// 사이트 폰트 설정 미리보기
interface SiteFontPreviewProps {
  primaryFontId: string
  headingFontId: string
  accentFontId?: string | null
  baseFontSize?: number
  className?: string
}

export function SiteFontPreview({
  primaryFontId,
  headingFontId,
  accentFontId,
  baseFontSize = 16,
  className = '',
}: SiteFontPreviewProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const primaryFont = getFontById(primaryFontId)
  const headingFont = getFontById(headingFontId)
  const accentFont = accentFontId ? getFontById(accentFontId) : null

  useEffect(() => {
    const fontIds = [primaryFontId, headingFontId, accentFontId].filter(
      (id): id is string => !!id
    )

    Promise.all(fontIds.map(loadFont)).then(() => setFontsLoaded(true))
  }, [primaryFontId, headingFontId, accentFontId])

  if (!primaryFont || !headingFont) return null

  return (
    <div
      className={`p-6 border rounded-lg bg-white ${className} transition-opacity ${
        fontsLoaded ? 'opacity-100' : 'opacity-50'
      }`}
      style={{ fontSize: baseFontSize }}
    >
      <h2
        className="text-2xl font-bold text-gray-900 mb-2"
        style={{ fontFamily: headingFont.cssFamily }}
      >
        제목 스타일 미리보기
      </h2>

      <div className="w-16 h-1 bg-primary mb-4" />

      <p className="text-gray-600 mb-4" style={{ fontFamily: primaryFont.cssFamily }}>
        본문 텍스트 스타일입니다. 이 텍스트는 선택한 본문 폰트로 표시됩니다. 다양한 한글
        문장을 통해 폰트가 어떻게 보이는지 확인해보세요.
      </p>

      <p className="text-gray-600 mb-4" style={{ fontFamily: primaryFont.cssFamily }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 영문과 한글이 조화롭게
        어우러지는지 확인할 수 있습니다.
      </p>

      {accentFont && (
        <blockquote
          className="border-l-4 border-primary pl-4 italic text-gray-700"
          style={{ fontFamily: accentFont.cssFamily }}
        >
          강조 텍스트 스타일입니다. 특별한 인용구나 강조가 필요한 곳에 사용됩니다.
        </blockquote>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
        <p>본문: {primaryFont.nameKo} ({primaryFont.name})</p>
        <p>제목: {headingFont.nameKo} ({headingFont.name})</p>
        {accentFont && <p>강조: {accentFont.nameKo} ({accentFont.name})</p>}
        <p>기본 크기: {baseFontSize}px</p>
      </div>
    </div>
  )
}
