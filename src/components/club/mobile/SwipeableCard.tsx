'use client'

import { type ReactNode } from 'react'
import { useSwipe } from '@/hooks/useSwipe'

interface Props {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight }: Props) {
  const { handlers, state } = useSwipe({ onSwipeLeft, onSwipeRight })

  return (
    <div
      {...handlers}
      style={{
        transform: state.isSwiping ? `translateX(${state.deltaX}px)` : 'translateX(0)',
        transition: state.isSwiping ? 'none' : 'transform 0.3s ease',
      }}
    >
      {children}
    </div>
  )
}
