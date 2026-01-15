'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface Banner {
  id: string
  title: string
  content?: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'MAINTENANCE'
  backgroundColor?: string
  textColor?: string
  icon?: string
  linkUrl?: string
  linkText?: string
  openInNewTab: boolean
  position: 'TOP' | 'BOTTOM'
  isSticky: boolean
  showCloseButton: boolean
  autoDismiss: boolean
  autoDismissDelay?: number
  maxDisplayCount?: number
}

interface UseBannersOptions {
  position?: 'TOP' | 'BOTTOM'
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseBannersReturn {
  banners: Banner[]
  loading: boolean
  error: string | null
  dismissedBanners: Set<string>
  dismissBanner: (bannerId: string) => void
  refreshBanners: () => Promise<void>
  trackInteraction: (bannerId: string, action: 'impression' | 'click' | 'dismiss') => Promise<void>
}

// localStorage 유틸리티
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem('banner_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('banner_session_id', sessionId)
  }
  return sessionId
}

function getDismissedBanners(): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const dismissed = localStorage.getItem('dismissed_banners')
    return dismissed ? new Set(JSON.parse(dismissed)) : new Set()
  } catch {
    return new Set()
  }
}

function saveDismissedBanners(dismissedBanners: Set<string>) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('dismissed_banners', JSON.stringify(Array.from(dismissedBanners)))
  } catch (error) {
    console.error('Error saving dismissed banners:', error)
  }
}

export function useBanners({
  position,
  autoRefresh = false,
  refreshInterval = 30000 // 30초
}: UseBannersOptions = {}): UseBannersReturn {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set())
  const sessionIdRef = useRef<string>('')
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // 세션 ID 및 해제된 배너 초기화
  useEffect(() => {
    sessionIdRef.current = getSessionId()
    setDismissedBanners(getDismissedBanners())
  }, [])

  // 상호작용 추적
  const trackInteraction = useCallback(async (bannerId: string, action: 'impression' | 'click' | 'dismiss') => {
    try {
      await fetch('/api/banners/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bannerId,
          action,
          sessionId: !session?.user ? sessionIdRef.current : undefined,
          page: pathname,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
        })
      })
    } catch (error) {
      console.error('Error tracking banner interaction:', error)
    }
  }, [session, pathname])

  // 배너 해제
  const dismissBanner = useCallback((bannerId: string) => {
    setDismissedBanners(prev => {
      const newDismissed = new Set(prev)
      newDismissed.add(bannerId)
      saveDismissedBanners(newDismissed)
      return newDismissed
    })

    // 해제 추적
    trackInteraction(bannerId, 'dismiss')
  }, [trackInteraction])

  // 배너 목록 조회
  const fetchBanners = useCallback(async () => {
    try {
      setError(null)

      const params = new URLSearchParams({
        page: pathname
      })

      if (position) {
        params.set('position', position)
      }

      const headers: Record<string, string> = {}
      if (!session?.user && sessionIdRef.current) {
        headers['x-session-id'] = sessionIdRef.current
      }

      const response = await fetch(`/api/banners?${params}`, {
        headers,
        cache: 'no-cache' // 항상 최신 데이터 가져오기
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setBanners(data.banners || [])

    } catch (error) {
      console.error('Error fetching banners:', error)
      setError(error instanceof Error ? error.message : '배너를 불러오는데 실패했습니다')
      setBanners([])
    } finally {
      setLoading(false)
    }
  }, [position, pathname, session])

  // 배너 새로고침
  const refreshBanners = useCallback(async () => {
    setLoading(true)
    await fetchBanners()
  }, [fetchBanners])

  // 초기 로드
  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchBanners()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchBanners])

  // 세션 변경 시 재로드
  useEffect(() => {
    if (session !== undefined) { // 세션 로딩이 완료된 후
      fetchBanners()
    }
  }, [session, fetchBanners])

  return {
    banners,
    loading,
    error,
    dismissedBanners,
    dismissBanner,
    refreshBanners,
    trackInteraction
  }
}

// 특정 배너 조회 훅
export function useBanner(bannerId: string) {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bannerId) {
      setLoading(false)
      return
    }

    const fetchBanner = async () => {
      try {
        setError(null)
        const response = await fetch(`/api/admin/banners/${bannerId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setBanner(data.banner)

      } catch (error) {
        console.error('Error fetching banner:', error)
        setError(error instanceof Error ? error.message : '배너를 불러오는데 실패했습니다')
        setBanner(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [bannerId])

  return { banner, loading, error }
}