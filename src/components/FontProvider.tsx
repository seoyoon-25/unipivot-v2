'use client'

import { useEffect, useState } from 'react'
import { loadFont, applyFontVariables } from '@/lib/utils/font-loader'
import { getFontById } from '@/lib/constants/korean-fonts'
import { safeDocumentBody, isBrowser, detectExtensionConflict } from '@/lib/utils/safe-dom'

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
    // 브라우저 환경 확인
    if (!isBrowser()) {
      console.warn('FontProvider: Not in browser environment')
      return
    }

    // 확장 프로그램 충돌 감지
    if (detectExtensionConflict()) {
      console.warn('FontProvider: Browser extension conflict detected')
    }

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

        // 기본 폰트 사이즈 적용 (안전한 접근)
        try {
          const root = document.documentElement
          if (root) {
            root.style.setProperty('--font-size-base', `${settings.baseFontSize}px`)
            root.style.setProperty('--font-heading-scale', String(settings.headingScale))

            // 계산된 제목 크기 적용
            const baseSize = settings.baseFontSize
            const scale = settings.headingScale
            root.style.setProperty('--font-size-h1', `${baseSize * Math.pow(scale, 4)}px`)
            root.style.setProperty('--font-size-h2', `${baseSize * Math.pow(scale, 3)}px`)
            root.style.setProperty('--font-size-h3', `${baseSize * Math.pow(scale, 2)}px`)
            root.style.setProperty('--font-size-h4', `${baseSize * scale}px`)
          }
        } catch (error) {
          console.warn('Failed to set CSS properties:', error)
        }

        // body 폰트 적용 (안전한 접근)
        try {
          const primaryFont = getFontById(settings.primaryFont)
          const body = safeDocumentBody()
          if (primaryFont && body) {
            body.style.fontFamily = primaryFont.cssFamily
          }
        } catch (error) {
          console.warn('Failed to set body font:', error)
        }

        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load font settings:', error)
        // 기본 폰트로 폴백
        await loadFont('pretendard').catch(() => {})
        applyFontVariables('pretendard', 'pretendard', null)
        setIsLoaded(true)
      }
    }

    loadFontSettings()

    // 5초 후에도 폰트가 로드되지 않으면 강제로 표시
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn('Font loading timeout, showing content with default fonts')
        setIsLoaded(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  // 폰트 로딩과 관계없이 항상 children을 렌더링
  return <>{children}</>
}
