'use client'

import { useRef, useCallback, type TouchEvent } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipe(handlers: SwipeHandlers, threshold = 50) {
  const startRef = useRef({ x: 0, y: 0 })
  const deltaRef = useRef({ x: 0, y: 0 })
  const swipingRef = useRef(false)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY }
    deltaRef.current = { x: 0, y: 0 }
    swipingRef.current = true
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!swipingRef.current) return

    const touch = e.touches[0]
    deltaRef.current = {
      x: touch.clientX - startRef.current.x,
      y: touch.clientY - startRef.current.y,
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const { x: deltaX, y: deltaY } = deltaRef.current

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) {
        handlersRef.current.onSwipeRight?.()
      } else if (deltaX < -threshold) {
        handlersRef.current.onSwipeLeft?.()
      }
    } else {
      if (deltaY > threshold) {
        handlersRef.current.onSwipeDown?.()
      } else if (deltaY < -threshold) {
        handlersRef.current.onSwipeUp?.()
      }
    }

    swipingRef.current = false
    deltaRef.current = { x: 0, y: 0 }
  }, [threshold])

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    state: {
      deltaX: deltaRef.current.x,
      deltaY: deltaRef.current.y,
      isSwiping: swipingRef.current,
    },
  }
}
