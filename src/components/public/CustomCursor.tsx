'use client'

import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    if (typeof window === 'undefined' || window.innerWidth <= 1024) {
      return () => window.removeEventListener('resize', checkMobile)
    }

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let animationFrameId: number

    const cursor = cursorRef.current
    const dot = dotRef.current

    if (!cursor || !dot) return

    // Smooth following (Lerp)
    const speed = 0.15

    function updateCursor() {
      cursorX += (mouseX - cursorX) * speed
      cursorY += (mouseY - cursorY) * speed

      if (cursor) {
        cursor.style.left = `${cursorX}px`
        cursor.style.top = `${cursorY}px`
      }

      if (dot) {
        dot.style.left = `${mouseX}px`
        dot.style.top = `${mouseY}px`
      }

      animationFrameId = requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    const handleElementEnter = () => cursor?.classList.add('hover')
    const handleElementLeave = () => cursor?.classList.remove('hover')

    // Add cursor-enabled class to body
    document.body.classList.add('cursor-enabled')

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    // Add hover listeners to interactive elements
    const addInteractiveListeners = () => {
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], input[type="submit"], .interactive')
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', handleElementEnter)
        el.addEventListener('mouseleave', handleElementLeave)
      })
    }

    addInteractiveListeners()

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      addInteractiveListeners()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    updateCursor()

    return () => {
      cancelAnimationFrame(animationFrameId)
      document.body.classList.remove('cursor-enabled')
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('resize', checkMobile)
      observer.disconnect()
    }
  }, [])

  // Don't render on mobile or before hydration
  if (!mounted || isMobile) return null

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease, width 0.15s ease, height 0.15s ease, background 0.15s ease',
        }}
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </>
  )
}

export default CustomCursor
