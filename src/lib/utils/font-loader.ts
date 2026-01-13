import { KOREAN_FONTS, getFontById } from '@/lib/constants/korean-fonts'

// 로드된 폰트 추적
const loadedFonts = new Set<string>()

// 단일 폰트 로드
export const loadFont = (fontId: string): Promise<void> => {
  return new Promise((resolve) => {
    // 이미 로드된 폰트인지 확인
    if (loadedFonts.has(fontId)) {
      resolve()
      return
    }

    const font = getFontById(fontId)
    if (!font) {
      console.warn(`Font not found: ${fontId}`)
      resolve()
      return
    }

    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    // 이미 DOM에 로드된 폰트인지 확인
    const existingLink = document.querySelector(`link[data-font="${fontId}"]`)
    if (existingLink) {
      loadedFonts.add(fontId)
      resolve()
      return
    }

    // CSS 링크 추가
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = font.cdn
    link.setAttribute('data-font', fontId)

    link.onload = () => {
      loadedFonts.add(fontId)
      resolve()
    }

    link.onerror = () => {
      console.error(`Failed to load font: ${fontId}`)
      resolve()
    }

    document.head.appendChild(link)
  })
}

// 여러 폰트 동시 로드
export const loadMultipleFonts = async (fontIds: string[]): Promise<void> => {
  await Promise.all(fontIds.map(loadFont))
}

// 로드된 폰트 목록 가져오기
export const getLoadedFonts = (): string[] => {
  if (typeof window === 'undefined') return []

  return Array.from(document.querySelectorAll('link[data-font]'))
    .map((el) => el.getAttribute('data-font'))
    .filter((id): id is string => id !== null)
}

// 폰트가 로드되었는지 확인
export const isFontLoaded = (fontId: string): boolean => {
  return loadedFonts.has(fontId)
}

// 폰트 언로드 (필요 시)
export const unloadFont = (fontId: string): void => {
  if (typeof window === 'undefined') return

  const link = document.querySelector(`link[data-font="${fontId}"]`)
  if (link) {
    link.remove()
    loadedFonts.delete(fontId)
  }
}

// 폰트 CSS 변수 적용
export const applyFontVariables = (
  primaryFontId: string,
  headingFontId: string,
  accentFontId?: string | null
): void => {
  if (typeof window === 'undefined') return

  const primaryFont = getFontById(primaryFontId)
  const headingFont = getFontById(headingFontId)
  const accentFont = accentFontId ? getFontById(accentFontId) : null

  const root = document.documentElement

  if (primaryFont) {
    root.style.setProperty('--font-primary', primaryFont.cssFamily)
  }

  if (headingFont) {
    root.style.setProperty('--font-heading', headingFont.cssFamily)
  }

  if (accentFont) {
    root.style.setProperty('--font-accent', accentFont.cssFamily)
  } else {
    root.style.setProperty('--font-accent', 'inherit')
  }
}

// 기본 폰트 프리로드 (SSR용)
export const getPreloadFontLinks = (fontIds: string[]): string[] => {
  return fontIds
    .map((id) => getFontById(id))
    .filter((font): font is NonNullable<typeof font> => font !== undefined)
    .map((font) => font.cdn)
}

// 폰트 선택 옵션 생성 (Select 컴포넌트용)
export const getFontOptions = () => {
  const categories = ['고딕', '명조', '손글씨', '디스플레이'] as const

  return categories.map((category) => ({
    label: category,
    options: KOREAN_FONTS.filter((f) => f.category === category).map((f) => ({
      value: f.id,
      label: f.nameKo,
      name: f.name,
      cssFamily: f.cssFamily,
    })),
  }))
}
