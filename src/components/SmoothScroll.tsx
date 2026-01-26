'use client'

import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

interface SmoothScrollProps {
  children: React.ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Expose lenis to window for GSAP ScrollTrigger integration
    if (typeof window !== 'undefined') {
      (window as Window & { lenis?: Lenis }).lenis = lenis
    }

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}

// Hook to access Lenis instance
export function useLenis() {
  if (typeof window !== 'undefined') {
    return (window as Window & { lenis?: Lenis }).lenis
  }
  return null
}
