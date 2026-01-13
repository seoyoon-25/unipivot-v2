'use client'

import { useEffect, useState } from 'react'
import { getFontById } from '@/lib/constants/korean-fonts'

interface FontPreloaderProps {
  fontIds?: string[]
}

/**
 * 폰트 프리로더 컴포넌트
 * - 관리자가 설정한 폰트를 미리 로드
 * - SSR에서 link 태그로 프리로드 힌트 제공
 */
export function FontPreloader({ fontIds }: FontPreloaderProps) {
  const [fonts, setFonts] = useState<string[]>(fontIds || [])

  useEffect(() => {
    // 설정된 폰트 ID가 없으면 API에서 가져오기
    if (!fontIds || fontIds.length === 0) {
      fetch('/api/admin/settings/fonts')
        .then((res) => res.json())
        .then((data) => {
          const ids = [data.primaryFont, data.headingFont, data.accentFont].filter(Boolean)
          setFonts(ids)
        })
        .catch(() => {
          // 기본 폰트 사용
          setFonts(['pretendard'])
        })
    }
  }, [fontIds])

  return (
    <>
      {fonts.map((fontId) => {
        const font = getFontById(fontId)
        if (!font) return null

        return (
          <link
            key={fontId}
            rel="preload"
            href={font.cdn}
            as="style"
            // @ts-ignore - onLoad is valid for preload
            onLoad={(e: React.SyntheticEvent<HTMLLinkElement>) => {
              ;(e.target as HTMLLinkElement).rel = 'stylesheet'
            }}
          />
        )
      })}
      {/* Fallback: noscript에서 직접 로드 */}
      <noscript>
        {fonts.map((fontId) => {
          const font = getFontById(fontId)
          if (!font) return null
          return <link key={fontId} rel="stylesheet" href={font.cdn} />
        })}
      </noscript>
    </>
  )
}

/**
 * 서버 사이드에서 폰트 프리로드 링크 생성
 */
export function generateFontPreloadLinks(fontIds: string[]): string {
  return fontIds
    .map((id) => getFontById(id))
    .filter((font): font is NonNullable<typeof font> => !!font)
    .map(
      (font) =>
        `<link rel="preload" href="${font.cdn}" as="style" onload="this.rel='stylesheet'">`
    )
    .join('\n')
}
