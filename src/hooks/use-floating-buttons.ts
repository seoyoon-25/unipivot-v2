'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface FloatingButton {
  id: string
  title: string
  icon?: string
  color: string
  hoverColor?: string
  textColor: string
  linkUrl: string
  openInNewTab: boolean
  position: 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'CUSTOM'
  offsetX: number
  offsetY: number
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
  showLabel: boolean
  animation: 'NONE' | 'PULSE' | 'BOUNCE' | 'SHAKE'
  animationDelay: number
  showOn: 'ALL' | 'DESKTOP' | 'MOBILE' | 'TABLET'
  scrollThreshold?: number
  maxDisplayCount?: number
}

interface UseFloatingButtonsOptions {
  position?: 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'CUSTOM'
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseFloatingButtonsReturn {
  buttons: FloatingButton[]
  loading: boolean
  error: string | null
  dismissedButtons: Set<string>
  dismissButton: (buttonId: string) => void
  refreshButtons: () => Promise<void>
  trackInteraction: (buttonId: string, action: 'impression' | 'click') => Promise<void>
}

// localStorage 유틸리티
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem('floating_button_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('floating_button_session_id', sessionId)
  }
  return sessionId
}

function getDismissedButtons(): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const dismissed = localStorage.getItem('dismissed_floating_buttons')
    return dismissed ? new Set(JSON.parse(dismissed)) : new Set()
  } catch {
    return new Set()
  }
}

function saveDismissedButtons(dismissedButtons: Set<string>) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('dismissed_floating_buttons', JSON.stringify(Array.from(dismissedButtons)))
  } catch (error) {
    console.error('Error saving dismissed floating buttons:', error)
  }
}

export function useFloatingButtons({
  position,
  autoRefresh = false,
  refreshInterval = 30000 // 30초
}: UseFloatingButtonsOptions = {}): UseFloatingButtonsReturn {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [buttons, setButtons] = useState<FloatingButton[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedButtons, setDismissedButtons] = useState<Set<string>>(new Set())
  const sessionIdRef = useRef<string>('')
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // 세션 ID 및 해제된 버튼 초기화
  useEffect(() => {
    sessionIdRef.current = getSessionId()
    setDismissedButtons(getDismissedButtons())
  }, [])

  // 상호작용 추적
  const trackInteraction = useCallback(async (buttonId: string, action: 'impression' | 'click') => {
    try {
      await fetch('/api/floating-buttons/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          buttonId,
          action,
          sessionId: !session?.user ? sessionIdRef.current : undefined,
          page: pathname,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
        })
      })
    } catch (error) {
      console.error('Error tracking floating button interaction:', error)
    }
  }, [session, pathname])

  // 버튼 해제
  const dismissButton = useCallback((buttonId: string) => {
    setDismissedButtons(prev => {
      const newDismissed = new Set(prev)
      newDismissed.add(buttonId)
      saveDismissedButtons(newDismissed)
      return newDismissed
    })

    // 해제는 별도 추적이 없음 (배너와 다름)
  }, [])

  // 버튼 목록 조회
  const fetchButtons = useCallback(async () => {
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

      const response = await fetch(`/api/floating-buttons?${params}`, {
        headers,
        cache: 'no-cache' // 항상 최신 데이터 가져오기
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setButtons(data.buttons || [])

    } catch (error) {
      console.error('Error fetching floating buttons:', error)
      setError(error instanceof Error ? error.message : '플로팅 버튼을 불러오는데 실패했습니다')
      setButtons([])
    } finally {
      setLoading(false)
    }
  }, [position, pathname, session])

  // 버튼 새로고침
  const refreshButtons = useCallback(async () => {
    setLoading(true)
    await fetchButtons()
  }, [fetchButtons])

  // 초기 로드
  useEffect(() => {
    fetchButtons()
  }, [fetchButtons])

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchButtons()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchButtons])

  // 세션 변경 시 재로드
  useEffect(() => {
    if (session !== undefined) { // 세션 로딩이 완료된 후
      fetchButtons()
    }
  }, [session, fetchButtons])

  return {
    buttons,
    loading,
    error,
    dismissedButtons,
    dismissButton,
    refreshButtons,
    trackInteraction
  }
}

// 특정 플로팅 버튼 조회 훅
export function useFloatingButton(buttonId: string) {
  const [button, setButton] = useState<FloatingButton | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!buttonId) {
      setLoading(false)
      return
    }

    const fetchButton = async () => {
      try {
        setError(null)
        const response = await fetch(`/api/admin/floating-buttons/${buttonId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setButton(data.button)

      } catch (error) {
        console.error('Error fetching floating button:', error)
        setError(error instanceof Error ? error.message : '플로팅 버튼을 불러오는데 실패했습니다')
        setButton(null)
      } finally {
        setLoading(false)
      }
    }

    fetchButton()
  }, [buttonId])

  return { button, loading, error }
}