'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/hooks/useGSAP'

interface ScrollTriggerWrapperProps {
  children: ReactNode
  className?: string
  animation?: 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scaleIn' | 'slideUp'
  delay?: number
  duration?: number
  distance?: number
  start?: string
  end?: string
  scrub?: boolean | number
  markers?: boolean
  once?: boolean
}

const animations = {
  fadeUp: { y: 50, opacity: 0 },
  fadeIn: { opacity: 0 },
  fadeLeft: { x: -50, opacity: 0 },
  fadeRight: { x: 50, opacity: 0 },
  scaleIn: { scale: 0.9, opacity: 0 },
  slideUp: { y: '100%', opacity: 0 },
}

export function ScrollTriggerWrapper({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  duration = 0.8,
  start = 'top 85%',
  end = 'bottom 15%',
  scrub = false,
  markers = false,
  once = false,
}: ScrollTriggerWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const fromVars = animations[animation]

    const ctx = gsap.context(() => {
      gsap.from(ref.current!, {
        ...fromVars,
        duration: scrub ? undefined : duration,
        delay: scrub ? undefined : delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current!,
          start,
          end,
          scrub,
          markers,
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [animation, delay, duration, start, end, scrub, markers, once])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Pin section wrapper
interface PinSectionProps {
  children: ReactNode
  className?: string
  pinSpacing?: boolean
  endOffset?: string
}

export function PinSection({
  children,
  className = '',
  pinSpacing = true,
  endOffset = '+=100%',
}: PinSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current!,
        start: 'top top',
        end: endOffset,
        pin: true,
        pinSpacing,
      })
    }, ref)

    return () => ctx.revert()
  }, [pinSpacing, endOffset])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Progress bar on scroll
interface ScrollProgressProps {
  className?: string
  color?: string
}

export function ScrollProgress({
  className = '',
  color = '#FF5E10',
}: ScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.to(ref.current!, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={ref}
      className={`fixed top-0 left-0 right-0 h-1 z-[100] origin-left scale-x-0 ${className}`}
      style={{ backgroundColor: color }}
    />
  )
}

// Reveal on scroll with mask
interface MaskRevealProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}

export function MaskReveal({
  children,
  className = '',
  direction = 'up',
  duration = 1,
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !maskRef.current) return

    const directions = {
      up: { y: '100%' },
      down: { y: '-100%' },
      left: { x: '100%' },
      right: { x: '-100%' },
    }

    const ctx = gsap.context(() => {
      gsap.to(maskRef.current!, {
        ...directions[direction],
        duration,
        ease: 'power4.inOut',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [direction, duration])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {children}
      <div
        ref={maskRef}
        className="absolute inset-0 bg-white"
        style={{ zIndex: 10 }}
      />
    </div>
  )
}
