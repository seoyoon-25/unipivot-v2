'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { safeWindowOpen, safeLocation, isBrowser } from '@/lib/utils/safe-dom'

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

interface BannerDisplayProps {
  position?: 'TOP' | 'BOTTOM'
  currentPage?: string
  className?: string
}

// 배너 타입별 기본 색상
const BANNER_TYPE_COLORS = {
  INFO: { bg: '#3b82f6', text: '#ffffff' },
  WARNING: { bg: '#f59e0b', text: '#ffffff' },
  SUCCESS: { bg: '#10b981', text: '#ffffff' },
  ERROR: { bg: '#ef4444', text: '#ffffff' },
  MAINTENANCE: { bg: '#6b7280', text: '#ffffff' }
}

// 클라이언트 세션 ID 생성
function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// localStorage에서 세션 ID 가져오기 또는 생성
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem('banner_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('banner_session_id', sessionId)
  }
  return sessionId
}

export function BannerDisplay({ position = 'TOP', currentPage = '/', className }: BannerDisplayProps) {
  const { data: session } = useSession()
  const [banners, setBanners] = useState<Banner[]>([])
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const sessionId = useRef<string>('')
  const trackingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // 세션 ID 초기화
  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  // 배너 목록 조회
  const fetchBanners = async () => {
    try {
      const params = new URLSearchParams({
        position,
        page: currentPage
      })

      const headers: Record<string, string> = {}
      if (!session?.user && sessionId.current) {
        headers['x-session-id'] = sessionId.current
      }

      const response = await fetch(`/api/banners?${params}`, { headers })

      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchBanners()
  }, [position, currentPage, session])

  // 배너 상호작용 추적
  const trackBannerInteraction = async (bannerId: string, action: 'impression' | 'click' | 'dismiss') => {
    try {
      await fetch('/api/banners/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bannerId,
          action,
          sessionId: !session?.user ? sessionId.current : undefined,
          page: currentPage,
          userAgent: navigator.userAgent
        })
      })
    } catch (error) {
      console.error('Error tracking banner interaction:', error)
    }
  }

  // 노출 추적 (화면에 보이는 배너)
  useEffect(() => {
    banners.forEach(banner => {
      if (!dismissedBanners.has(banner.id)) {
        // 노출 추적 (약간의 지연 후)
        const timeout = setTimeout(() => {
          trackBannerInteraction(banner.id, 'impression')
        }, 1000)

        trackingTimeouts.current.set(banner.id, timeout)
      }
    })

    // 컴포넌트 언마운트 또는 배너 변경 시 타임아웃 정리
    return () => {
      trackingTimeouts.current.forEach(timeout => clearTimeout(timeout))
      trackingTimeouts.current.clear()
    }
  }, [banners, dismissedBanners])

  // 배너 해제
  const dismissBanner = (bannerId: string) => {
    setDismissedBanners(prev => {
      const newSet = new Set(prev)
      newSet.add(bannerId)
      return newSet
    })
    trackBannerInteraction(bannerId, 'dismiss')

    // 타임아웃 정리
    const timeout = trackingTimeouts.current.get(bannerId)
    if (timeout) {
      clearTimeout(timeout)
      trackingTimeouts.current.delete(bannerId)
    }
  }

  // 배너 클릭 (안전한 접근)
  const handleBannerClick = (banner: Banner) => {
    if (!banner.linkUrl) return

    trackBannerInteraction(banner.id, 'click')

    if (banner.openInNewTab) {
      const opened = safeWindowOpen(banner.linkUrl, '_blank', 'noopener,noreferrer')
      if (!opened) {
        console.warn('Failed to open new window, falling back to current window')
        const location = safeLocation()
        if (location) {
          location.href = banner.linkUrl
        }
      }
    } else {
      const location = safeLocation()
      if (location) {
        location.href = banner.linkUrl
      } else {
        console.warn('Failed to access window.location')
      }
    }
  }

  // 자동 해제 설정
  useEffect(() => {
    banners.forEach(banner => {
      if (banner.autoDismiss && banner.autoDismissDelay && !dismissedBanners.has(banner.id)) {
        const timeout = setTimeout(() => {
          dismissBanner(banner.id)
        }, banner.autoDismissDelay * 1000)

        return () => clearTimeout(timeout)
      }
    })
  }, [banners, dismissedBanners])

  // 배너 렌더링
  const renderBanner = (banner: Banner) => {
    const typeColors = BANNER_TYPE_COLORS[banner.type]
    const backgroundColor = banner.backgroundColor || typeColors.bg
    const textColor = banner.textColor || typeColors.text

    const hasLink = banner.linkUrl && banner.linkText
    const isClickable = !!banner.linkUrl

    return (
      <div
        key={banner.id}
        className={cn(
          'relative flex items-center justify-between px-4 py-3 text-sm shadow-sm',
          banner.isSticky && 'sticky top-0 z-50',
          isClickable && 'cursor-pointer hover:opacity-90 transition-opacity',
          className
        )}
        style={{ backgroundColor, color: textColor }}
        onClick={() => isClickable && handleBannerClick(banner)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 아이콘 */}
          {banner.icon && (
            <span className="text-lg flex-shrink-0" aria-hidden="true">
              {banner.icon}
            </span>
          )}

          {/* 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <div className="font-medium">{banner.title}</div>
            {banner.content && (
              <div className="text-sm opacity-90 mt-1 line-clamp-2">
                {banner.content}
              </div>
            )}
          </div>
        </div>

        {/* 액션 영역 */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* 링크 버튼 */}
          {hasLink && (
            <Button
              variant="ghost"
              size="sm"
              className="text-current hover:bg-white/10 border-current border"
              onClick={(e) => {
                e.stopPropagation()
                handleBannerClick(banner)
              }}
            >
              {banner.linkText}
              {banner.openInNewTab && <ExternalLink className="h-3 w-3 ml-1" />}
            </Button>
          )}

          {/* 닫기 버튼 */}
          {banner.showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              className="text-current hover:bg-white/10 p-1 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                dismissBanner(banner.id)
              }}
              aria-label="배너 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (loading) {
    return null // 또는 로딩 스피너
  }

  // 표시할 배너 필터링
  const visibleBanners = banners.filter(banner => !dismissedBanners.has(banner.id))

  if (visibleBanners.length === 0) {
    return null
  }

  return (
    <div className={cn(
      'relative z-40',
      position === 'BOTTOM' && 'order-last'
    )}>
      {visibleBanners.map(renderBanner)}
    </div>
  )
}

// 특정 위치의 배너만 표시하는 편의 컴포넌트
export function TopBanners({ currentPage, className }: Omit<BannerDisplayProps, 'position'>) {
  return <BannerDisplay position="TOP" currentPage={currentPage} className={className} />
}

export function BottomBanners({ currentPage, className }: Omit<BannerDisplayProps, 'position'>) {
  return <BannerDisplay position="BOTTOM" currentPage={currentPage} className={className} />
}