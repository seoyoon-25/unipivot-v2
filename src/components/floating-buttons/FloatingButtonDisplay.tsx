'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink, MousePointer } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  safeInnerWidth,
  safeScrollY,
  safeAddEventListener,
  safeRemoveEventListener,
  safeWindowOpen,
  safeLocation,
  isBrowser
} from '@/lib/utils/safe-dom'

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

interface FloatingButtonDisplayProps {
  position?: 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'CUSTOM'
  currentPage?: string
  className?: string
}

// 버튼 크기 매핑
const BUTTON_SIZES = {
  SMALL: { size: 40, iconSize: 16 },
  MEDIUM: { size: 56, iconSize: 20 },
  LARGE: { size: 72, iconSize: 24 }
}

// 애니메이션 클래스 매핑
const ANIMATION_CLASSES = {
  NONE: '',
  PULSE: 'animate-pulse',
  BOUNCE: 'animate-bounce',
  SHAKE: 'animate-pulse' // shake 애니메이션은 커스텀 CSS 필요
}

// 클라이언트 세션 ID 생성
function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// localStorage에서 세션 ID 가져오기 또는 생성
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem('floating_button_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('floating_button_session_id', sessionId)
  }
  return sessionId
}

// 디바이스 타입 감지 (안전한 접근)
function getDeviceType(): 'DESKTOP' | 'MOBILE' | 'TABLET' {
  if (!isBrowser()) return 'DESKTOP'

  const width = safeInnerWidth()
  if (width < 768) return 'MOBILE'
  if (width < 1024) return 'TABLET'
  return 'DESKTOP'
}

export function FloatingButtonDisplay({ position, currentPage = '/', className }: FloatingButtonDisplayProps) {
  const { data: session } = useSession()
  const [buttons, setButtons] = useState<FloatingButton[]>([])
  const [dismissedButtons, setDismissedButtons] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [deviceType, setDeviceType] = useState<'DESKTOP' | 'MOBILE' | 'TABLET'>('DESKTOP')
  const sessionId = useRef<string>('')
  const trackingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // 세션 ID 및 디바이스 타입 초기화 (안전한 접근)
  useEffect(() => {
    if (!isBrowser()) return

    sessionId.current = getSessionId()
    setDeviceType(getDeviceType())

    const handleResize = () => setDeviceType(getDeviceType())
    const handleScroll = () => setScrollY(safeScrollY())

    const resizeAdded = safeAddEventListener('resize', handleResize)
    const scrollAdded = safeAddEventListener('scroll', handleScroll)

    return () => {
      if (resizeAdded) safeRemoveEventListener('resize', handleResize)
      if (scrollAdded) safeRemoveEventListener('scroll', handleScroll)
    }
  }, [])

  // 플로팅 버튼 목록 조회
  const fetchButtons = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage
      })

      if (position) {
        params.set('position', position)
      }

      const headers: Record<string, string> = {}
      if (!session?.user && sessionId.current) {
        headers['x-session-id'] = sessionId.current
      }

      const response = await fetch(`/api/floating-buttons?${params}`, { headers })

      if (response.ok) {
        const data = await response.json()
        setButtons(data.buttons || [])
      }
    } catch (error) {
      console.error('Error fetching floating buttons:', error)
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchButtons()
  }, [position, currentPage, session])

  // 버튼 상호작용 추적
  const trackButtonInteraction = async (buttonId: string, action: 'impression' | 'click') => {
    try {
      await fetch('/api/floating-buttons/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          buttonId,
          action,
          sessionId: !session?.user ? sessionId.current : undefined,
          page: currentPage,
          userAgent: navigator.userAgent
        })
      })
    } catch (error) {
      console.error('Error tracking floating button interaction:', error)
    }
  }

  // 노출 추적 (화면에 보이는 버튼)
  useEffect(() => {
    const visibleButtons = getVisibleButtons()

    visibleButtons.forEach(button => {
      if (!dismissedButtons.has(button.id)) {
        // 노출 추적 (약간의 지연 후)
        const timeout = setTimeout(() => {
          trackButtonInteraction(button.id, 'impression')
        }, button.animationDelay + 1000)

        trackingTimeouts.current.set(button.id, timeout)
      }
    })

    // 컴포넌트 언마운트 또는 버튼 변경 시 타임아웃 정리
    return () => {
      trackingTimeouts.current.forEach(timeout => clearTimeout(timeout))
      trackingTimeouts.current.clear()
    }
  }, [buttons, dismissedButtons, scrollY, deviceType])

  // 표시할 버튼 필터링
  const getVisibleButtons = () => {
    return buttons.filter(button => {
      // 해제된 버튼 제외
      if (dismissedButtons.has(button.id)) return false

      // 디바이스 타입 확인
      if (button.showOn !== 'ALL' && button.showOn !== deviceType) return false

      // 스크롤 임계값 확인
      if (button.scrollThreshold !== undefined && scrollY < button.scrollThreshold) return false

      return true
    })
  }

  // 버튼 클릭 처리 (안전한 접근)
  const handleButtonClick = (button: FloatingButton) => {
    trackButtonInteraction(button.id, 'click')

    if (button.openInNewTab) {
      const opened = safeWindowOpen(button.linkUrl, '_blank', 'noopener,noreferrer')
      if (!opened) {
        console.warn('Failed to open new window, falling back to current window')
        const location = safeLocation()
        if (location) {
          location.href = button.linkUrl
        }
      }
    } else {
      const location = safeLocation()
      if (location) {
        location.href = button.linkUrl
      } else {
        console.warn('Failed to access window.location')
      }
    }
  }

  // 버튼 위치 스타일 계산
  const getButtonPositionStyle = (button: FloatingButton) => {
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000
    }

    switch (button.position) {
      case 'BOTTOM_RIGHT':
        style.bottom = `${button.offsetY}px`
        style.right = `${button.offsetX}px`
        break
      case 'BOTTOM_LEFT':
        style.bottom = `${button.offsetY}px`
        style.left = `${button.offsetX}px`
        break
      case 'TOP_RIGHT':
        style.top = `${button.offsetY}px`
        style.right = `${button.offsetX}px`
        break
      case 'TOP_LEFT':
        style.top = `${button.offsetY}px`
        style.left = `${button.offsetX}px`
        break
      case 'CUSTOM':
        style.bottom = `${button.offsetY}px`
        style.right = `${button.offsetX}px`
        break
    }

    return style
  }

  // 버튼 렌더링
  const renderButton = (button: FloatingButton, index: number) => {
    const buttonSize = BUTTON_SIZES[button.size]
    const animationClass = ANIMATION_CLASSES[button.animation]

    return (
      <div
        key={button.id}
        style={{
          ...getButtonPositionStyle(button),
          animationDelay: `${button.animationDelay}ms`
        }}
        className="group"
      >
        <button
          onClick={() => handleButtonClick(button)}
          className={cn(
            'relative flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50',
            animationClass,
            className
          )}
          style={{
            backgroundColor: button.color,
            color: button.textColor,
            width: `${buttonSize.size}px`,
            height: `${buttonSize.size}px`
          }}
          onMouseEnter={(e) => {
            if (button.hoverColor) {
              e.currentTarget.style.backgroundColor = button.hoverColor
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = button.color
          }}
          title={button.title}
        >
          {button.icon ? (
            <span style={{ fontSize: `${buttonSize.iconSize}px` }}>
              {button.icon}
            </span>
          ) : (
            <MousePointer size={buttonSize.iconSize} />
          )}

          {button.openInNewTab && (
            <ExternalLink
              size={buttonSize.iconSize * 0.6}
              className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-gray-600"
            />
          )}
        </button>

        {/* 라벨 표시 */}
        {button.showLabel && button.title && (
          <div
            className={cn(
              'absolute bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              button.position === 'BOTTOM_RIGHT' || button.position === 'TOP_RIGHT'
                ? 'right-full mr-2'
                : 'left-full ml-2',
              button.position === 'TOP_RIGHT' || button.position === 'TOP_LEFT'
                ? 'top-1/2 -translate-y-1/2'
                : 'bottom-1/2 translate-y-1/2'
            )}
          >
            {button.title}
          </div>
        )}
      </div>
    )
  }

  // 로딩 상태
  if (loading) {
    return null
  }

  // 표시할 버튼 필터링
  const visibleButtons = getVisibleButtons()

  if (visibleButtons.length === 0) {
    return null
  }

  return (
    <div className="floating-buttons-container">
      {visibleButtons.map(renderButton)}
    </div>
  )
}

// 특정 위치의 플로팅 버튼만 표시하는 편의 컴포넌트
export function BottomRightFloatingButtons({ currentPage, className }: Omit<FloatingButtonDisplayProps, 'position'>) {
  return <FloatingButtonDisplay position="BOTTOM_RIGHT" currentPage={currentPage} className={className} />
}

export function BottomLeftFloatingButtons({ currentPage, className }: Omit<FloatingButtonDisplayProps, 'position'>) {
  return <FloatingButtonDisplay position="BOTTOM_LEFT" currentPage={currentPage} className={className} />
}

export function TopRightFloatingButtons({ currentPage, className }: Omit<FloatingButtonDisplayProps, 'position'>) {
  return <FloatingButtonDisplay position="TOP_RIGHT" currentPage={currentPage} className={className} />
}

export function TopLeftFloatingButtons({ currentPage, className }: Omit<FloatingButtonDisplayProps, 'position'>) {
  return <FloatingButtonDisplay position="TOP_LEFT" currentPage={currentPage} className={className} />
}