'use client'

import { useEffect, useState } from 'react'
import { loadFont, applyFontVariables } from '@/lib/utils/font-loader'
import { getFontById } from '@/lib/constants/korean-fonts'

interface FontSettings {
  primaryFont: string
  headingFont: string
  accentFont: string | null
  baseFontSize: number
  headingScale: number
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadFontSettings = async () => {
      try {
        // 폰트 설정 가져오기
        const response = await fetch('/api/admin/settings/fonts')
        if (!response.ok) {
          throw new Error('Failed to fetch font settings')
        }

        const settings: FontSettings = await response.json()

        // 폰트 로드
        const fontsToLoad = [
          settings.primaryFont,
          settings.headingFont,
          settings.accentFont,
        ].filter((f): f is string => !!f)

        await Promise.all(fontsToLoad.map(loadFont))

        // CSS 변수 적용
        applyFontVariables(settings.primaryFont, settings.headingFont, settings.accentFont)

        // 기본 폰트 사이즈 적용
        const root = document.documentElement
        root.style.setProperty('--font-size-base', `${settings.baseFontSize}px`)
        root.style.setProperty('--font-heading-scale', String(settings.headingScale))

        // 계산된 제목 크기 적용
        const baseSize = settings.baseFontSize
        const scale = settings.headingScale
        root.style.setProperty('--font-size-h1', `${baseSize * Math.pow(scale, 4)}px`)
        root.style.setProperty('--font-size-h2', `${baseSize * Math.pow(scale, 3)}px`)
        root.style.setProperty('--font-size-h3', `${baseSize * Math.pow(scale, 2)}px`)
        root.style.setProperty('--font-size-h4', `${baseSize * scale}px`)

        // body 폰트 적용
        const primaryFont = getFontById(settings.primaryFont)
        if (primaryFont) {
          document.body.style.fontFamily = primaryFont.cssFamily
        }

        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load font settings:', error)
        // 기본 폰트로 폴백
        await loadFont('pretendard')
        applyFontVariables('pretendard', 'pretendard', null)
        setIsLoaded(true)
      }
    }

    loadFontSettings()
  }, [])

  return <>{children}</>
}
