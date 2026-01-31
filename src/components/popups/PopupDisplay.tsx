'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize'

interface PopupTemplate {
  id: string
  name: string
  category: string
  width: number
  height: number
  borderRadius: number
  shadow: string
  backgroundColor: string
  borderColor: string
  textColor: string
  animation: string
  duration: number
  overlayColor: string
  blurBackground: boolean
}

interface PopupButton {
  text: string
  action: string
  url?: string
  style?: string
}

interface Popup {
  id: string
  title: string
  content?: string
  trigger: string
  triggerValue?: string
  triggerSelector?: string
  showCloseButton: boolean
  closeOnOverlay: boolean
  closeOnEscape: boolean
  autoClose: boolean
  autoCloseDelay?: number
  primaryButton?: PopupButton
  secondaryButton?: PopupButton
  template?: PopupTemplate
  customCss?: string
  priority: number
  showOncePerSession: boolean
  showOncePerUser: boolean
  maxDisplayPerDay?: number
  delayBetweenShows?: number
}

interface PopupDisplayProps {
  page?: string
  device?: string
  userId?: string
  onInteraction?: (popupId: string, type: string, data?: any) => void
}

export default function PopupDisplay({
  page = '/',
  device = 'desktop',
  userId,
  onInteraction
}: PopupDisplayProps) {
  const [popups, setPopups] = useState<Popup[]>([])
  const [activePopups, setActivePopups] = useState<Set<string>>(new Set())
  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set())
  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const scrollTriggeredRef = useRef<Set<string>>(new Set())
  const timeTriggeredRef = useRef<Set<string>>(new Set())
  const exitTriggeredRef = useRef<Set<string>>(new Set())

  // 세션 ID 초기화
  useEffect(() => {
    let storedSessionId = localStorage.getItem('popup-session-id')
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID()
      localStorage.setItem('popup-session-id', storedSessionId)
    }
    setSessionId(storedSessionId)

    // 세션별 해제된 팝업 로드
    const sessionDismissed = localStorage.getItem(`dismissed-popups-${storedSessionId}`)
    if (sessionDismissed) {
      setDismissedPopups(new Set(JSON.parse(sessionDismissed)))
    }
  }, [])

  // 팝업 목록 로드
  useEffect(() => {
    if (!sessionId) return

    loadActivePopups()
  }, [page, device, sessionId])

  // 트리거 이벤트 설정
  useEffect(() => {
    if (popups.length === 0) return

    // 스크롤 트리거 설정
    const scrollHandler = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100

      popups.forEach(popup => {
        if (
          popup.trigger === 'scroll' &&
          popup.triggerValue &&
          !scrollTriggeredRef.current.has(popup.id) &&
          !dismissedPopups.has(popup.id)
        ) {
          const targetPercent = parseInt(popup.triggerValue)
          if (scrollPercent >= targetPercent) {
            scrollTriggeredRef.current.add(popup.id)
            showPopup(popup)
          }
        }
      })
    }

    // 시간 트리거 설정
    const timeTimers: NodeJS.Timeout[] = []
    popups.forEach(popup => {
      if (
        popup.trigger === 'time' &&
        popup.triggerValue &&
        !timeTriggeredRef.current.has(popup.id) &&
        !dismissedPopups.has(popup.id)
      ) {
        const delay = parseInt(popup.triggerValue) * 1000
        const timer = setTimeout(() => {
          timeTriggeredRef.current.add(popup.id)
          showPopup(popup)
        }, delay)
        timeTimers.push(timer)
      }
    })

    // 페이지 로드 트리거
    popups.forEach(popup => {
      if (
        popup.trigger === 'pageload' &&
        !dismissedPopups.has(popup.id)
      ) {
        const delay = popup.triggerValue ? parseInt(popup.triggerValue) * 1000 : 1000
        setTimeout(() => showPopup(popup), delay)
      }
    })

    // 클릭 트리거 설정
    const clickHandlers: Array<{ element: Element; handler: () => void }> = []
    popups.forEach(popup => {
      if (
        popup.trigger === 'click' &&
        popup.triggerSelector &&
        !dismissedPopups.has(popup.id)
      ) {
        const elements = document.querySelectorAll(popup.triggerSelector)
        elements.forEach(element => {
          const handler = () => showPopup(popup)
          element.addEventListener('click', handler)
          clickHandlers.push({ element, handler })
        })
      }
    })

    // 종료 트리거 설정
    const exitHandler = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        popups.forEach(popup => {
          if (
            popup.trigger === 'exit' &&
            !exitTriggeredRef.current.has(popup.id) &&
            !dismissedPopups.has(popup.id)
          ) {
            exitTriggeredRef.current.add(popup.id)
            showPopup(popup)
          }
        })
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('scroll', scrollHandler)
    document.addEventListener('mouseleave', exitHandler)

    // ESC 키 핸들러
    const escapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        activePopups.forEach(popupId => {
          const popup = popups.find(p => p.id === popupId)
          if (popup?.closeOnEscape) {
            closePopup(popupId, 'escape')
          }
        })
      }
    }

    document.addEventListener('keydown', escapeHandler)

    // 클린업
    return () => {
      window.removeEventListener('scroll', scrollHandler)
      document.removeEventListener('mouseleave', exitHandler)
      document.removeEventListener('keydown', escapeHandler)
      timeTimers.forEach(timer => clearTimeout(timer))
      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler)
      })
    }
  }, [popups, dismissedPopups, activePopups])

  const loadActivePopups = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/popups/active?page=${encodeURIComponent(page)}&device=${device}`, {
        headers: {
          'x-session-id': sessionId
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPopups(data.popups || [])
      }
    } catch (error) {
      console.error('Error loading active popups:', error)
    } finally {
      setLoading(false)
    }
  }

  const showPopup = async (popup: Popup) => {
    // 중복 표시 방지
    if (activePopups.has(popup.id) || dismissedPopups.has(popup.id)) {
      return
    }

    // 세션별 제한 확인
    if (popup.showOncePerSession && dismissedPopups.has(popup.id)) {
      return
    }

    // 하루 최대 표시 횟수 확인 (구현 가능)
    // if (popup.maxDisplayPerDay) {
    //   // 로컬스토리지에서 오늘 표시 횟수 확인
    // }

    setActivePopups(prev => new Set([...Array.from(prev), popup.id]))

    // 표시 추적
    await trackInteraction(popup.id, 'show')

    // 자동 닫기 설정
    if (popup.autoClose && popup.autoCloseDelay) {
      setTimeout(() => {
        closePopup(popup.id, 'auto')
      }, popup.autoCloseDelay * 1000)
    }

    onInteraction?.(popup.id, 'show')
  }

  const closePopup = async (popupId: string, reason: 'close_button' | 'overlay' | 'escape' | 'auto') => {
    setActivePopups(prev => {
      const newSet = new Set(prev)
      newSet.delete(popupId)
      return newSet
    })

    // 해제 추적
    await trackInteraction(popupId, 'close', { reason })

    // 세션별 해제 기록
    const newDismissed = new Set([...Array.from(dismissedPopups), popupId])
    setDismissedPopups(newDismissed)

    localStorage.setItem(
      `dismissed-popups-${sessionId}`,
      JSON.stringify([...Array.from(newDismissed)])
    )

    onInteraction?.(popupId, 'close', { reason })
  }

  const handleButtonClick = async (popup: Popup, buttonType: 'primary' | 'secondary') => {
    const button = buttonType === 'primary' ? popup.primaryButton : popup.secondaryButton
    if (!button) return

    // 클릭 추적
    await trackInteraction(popup.id, 'click', { buttonType, action: button.action })

    // 액션 실행
    switch (button.action) {
      case 'url':
        if (button.url) {
          window.open(button.url, '_blank')
        }
        break
      case 'conversion':
        await trackInteraction(popup.id, 'conversion', { buttonType })
        break
    }

    onInteraction?.(popup.id, 'click', { buttonType, button })

    // 팝업 닫기
    closePopup(popup.id, 'close_button')
  }

  const trackInteraction = async (popupId: string, interactionType: string, data?: any) => {
    try {
      await fetch('/api/popups/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          popupId,
          interactionType,
          ...data
        })
      })
    } catch (error) {
      console.error('Error tracking interaction:', error)
    }
  }

  const renderPopup = (popup: Popup) => {
    if (!activePopups.has(popup.id)) return null

    const template = popup.template
    const styles: React.CSSProperties = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: template?.width || 600,
      height: template?.height || 400,
      backgroundColor: template?.backgroundColor || '#ffffff',
      borderRadius: template?.borderRadius || 12,
      border: `1px solid ${template?.borderColor || '#e2e8f0'}`,
      color: template?.textColor || '#1e293b',
      zIndex: 1000,
      boxShadow: getBoxShadow(template?.shadow || 'large'),
      padding: '24px',
      overflow: 'auto'
    }

    const overlayStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: template?.overlayColor || 'rgba(0,0,0,0.5)',
      backdropFilter: template?.blurBackground ? 'blur(4px)' : 'none',
      zIndex: 999
    }

    return (
      <>
        {/* 오버레이 */}
        <div
          style={overlayStyles}
          onClick={() => popup.closeOnOverlay && closePopup(popup.id, 'overlay')}
        />

        {/* 팝업 */}
        <div style={styles} className="popup-container">
          {/* 닫기 버튼 */}
          {popup.showCloseButton && (
            <button
              onClick={() => closePopup(popup.id, 'close_button')}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X className="w-5 h-5" style={{ color: template?.textColor || '#1e293b' }} />
            </button>
          )}

          {/* 제목 */}
          <h2 className="text-xl font-bold mb-4" style={{ color: template?.textColor || '#1e293b' }}>
            {popup.title}
          </h2>

          {/* 내용 */}
          {popup.content && (
            <div
              className="mb-6"
              style={{ color: template?.textColor || '#1e293b' }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(popup.content) }}
            />
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-3 justify-end">
            {popup.secondaryButton && (
              <Button
                variant="outline"
                onClick={() => handleButtonClick(popup, 'secondary')}
              >
                {popup.secondaryButton.text}
              </Button>
            )}
            {popup.primaryButton && (
              <Button
                onClick={() => handleButtonClick(popup, 'primary')}
              >
                {popup.primaryButton.text}
              </Button>
            )}
          </div>

          {/* 커스텀 CSS */}
          {popup.customCss && (
            <style>
              {popup.customCss}
            </style>
          )}
        </div>
      </>
    )
  }

  const getBoxShadow = (shadow: string) => {
    switch (shadow) {
      case 'small':
        return '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
      case 'medium':
        return '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
      case 'large':
        return '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
      default:
        return 'none'
    }
  }

  return (
    <div>
      {popups.map(popup => renderPopup(popup))}
    </div>
  )
}