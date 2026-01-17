'use client'

import { useState, useEffect } from 'react'

export interface CardSettings {
  statusBadge: {
    size: 'sm' | 'md' | 'lg'
    rounded: 'full' | 'lg' | 'md'
  }
  modeBadge: {
    size: 'sm' | 'md' | 'lg'
    rounded: 'full' | 'lg' | 'md'
  }
}

const defaultSettings: CardSettings = {
  statusBadge: { size: 'sm', rounded: 'full' },
  modeBadge: { size: 'sm', rounded: 'md' },
}

// 크기별 클래스
export const getSizeClass = (size: string) => {
  switch (size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs'
    case 'md':
      return 'px-3 py-1 text-sm font-medium'
    case 'lg':
      return 'px-4 py-1.5 text-base font-semibold'
    default:
      return 'px-2 py-0.5 text-xs'
  }
}

// 모서리 클래스
export const getRoundedClass = (rounded: string) => {
  switch (rounded) {
    case 'full':
      return 'rounded-full'
    case 'lg':
      return 'rounded-lg'
    case 'md':
      return 'rounded-md'
    default:
      return 'rounded-full'
  }
}

// 상태 배지 전체 클래스 (색상 제외)
export const getStatusBadgeBaseClass = (settings: CardSettings) => {
  return `${getSizeClass(settings.statusBadge.size)} ${getRoundedClass(settings.statusBadge.rounded)} font-semibold`
}

// 모드 배지 전체 클래스 (색상 제외)
export const getModeBadgeBaseClass = (settings: CardSettings) => {
  return `inline-block ${getSizeClass(settings.modeBadge.size)} ${getRoundedClass(settings.modeBadge.rounded)}`
}

// 전역 캐시
let cachedSettings: CardSettings | null = null
let fetchPromise: Promise<CardSettings | null> | null = null

export function useCardSettings() {
  const [settings, setSettings] = useState<CardSettings>(cachedSettings || defaultSettings)
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings)
      setLoading(false)
      return
    }

    if (!fetchPromise) {
      fetchPromise = fetch('/api/design/cards')
        .then((res) => res.json())
        .then((data) => {
          cachedSettings = data.settings || defaultSettings
          return cachedSettings
        })
        .catch(() => {
          cachedSettings = defaultSettings
          return defaultSettings
        })
    }

    fetchPromise.then((fetchedSettings) => {
      setSettings(fetchedSettings || defaultSettings)
      setLoading(false)
    })
  }, [])

  return { settings, loading }
}

// 서버 컴포넌트용 (직접 fetch)
export async function fetchCardSettings(): Promise<CardSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/design/cards`, {
      next: { revalidate: 60 }, // 60초 캐시
    })
    if (res.ok) {
      const data = await res.json()
      return data.settings || defaultSettings
    }
  } catch (error) {
    console.error('Failed to fetch card settings:', error)
  }
  return defaultSettings
}
