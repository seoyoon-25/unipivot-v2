'use client'

import { useEffect } from 'react'
import { loadFont, applyFontVariables } from '@/lib/utils/font-loader'
import { isBrowser } from '@/lib/utils/safe-dom'

interface FontSettings {
  primaryFont: string
  headingFont: string
  accentFont: string | null
  baseFontSize: number
  headingScale: number
}

function isDefaultFont(font: string | null | undefined): boolean {
  return !font || font === 'pretendard' || font === 'Pretendard'
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isBrowser()) return

    const loadFontSettings = async () => {
      try {
        const response = await fetch('/api/settings/fonts')
        if (!response.ok) throw new Error('Failed to fetch font settings')

        const settings: FontSettings = await response.json()

        // CLS 방지: 기본 Pretendard 설정이면 CSS 변수 변경 없이 즉시 리턴
        const allFontsDefault =
          isDefaultFont(settings.primaryFont) &&
          isDefaultFont(settings.headingFont) &&
          isDefaultFont(settings.accentFont) &&
          settings.baseFontSize === 16 &&
          settings.headingScale === 1.25

        if (allFontsDefault) return

        // 추가 폰트만 로드 (Pretendard는 이미 <link>로 로드됨)
        const fontsToLoad = [
          settings.primaryFont,
          settings.headingFont,
          settings.accentFont,
        ].filter((f): f is string => !!f && !isDefaultFont(f))

        if (fontsToLoad.length > 0) {
          await Promise.all(fontsToLoad.map(loadFont))
        }

        // requestAnimationFrame으로 CSS 변수 일괄 적용 (reflow 최소화)
        requestAnimationFrame(() => {
          const root = document.documentElement
          if (!root) return

          // 비기본 폰트일 때만 CSS 변수 업데이트
          if (!isDefaultFont(settings.primaryFont) || !isDefaultFont(settings.headingFont) || !isDefaultFont(settings.accentFont)) {
            applyFontVariables(settings.primaryFont, settings.headingFont, settings.accentFont)
          }

          if (settings.baseFontSize !== 16) {
            root.style.setProperty('--font-size-base', `${settings.baseFontSize}px`)
          }
          if (settings.headingScale !== 1.25) {
            const baseSize = settings.baseFontSize
            const scale = settings.headingScale
            root.style.setProperty('--font-heading-scale', String(scale))
            root.style.setProperty('--font-size-h1', `${baseSize * Math.pow(scale, 4)}px`)
            root.style.setProperty('--font-size-h2', `${baseSize * Math.pow(scale, 3)}px`)
            root.style.setProperty('--font-size-h3', `${baseSize * Math.pow(scale, 2)}px`)
            root.style.setProperty('--font-size-h4', `${baseSize * scale}px`)
          }
        })
      } catch (error) {
        console.error('Failed to load font settings:', error)
      }
    }

    loadFontSettings()
  }, [])

  return <>{children}</>
}
