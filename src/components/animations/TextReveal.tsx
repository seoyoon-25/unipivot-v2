'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/hooks/useGSAP'

interface TextRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  splitType?: 'chars' | 'words' | 'lines'
}

export function TextReveal({
  children,
  className = '',
  delay = 0,
  stagger = 0.02,
  duration = 0.8,
  as: Tag = 'div',
  splitType = 'chars',
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const text = element.textContent || ''

    let items: string[]
    if (splitType === 'chars') {
      items = text.split('')
    } else if (splitType === 'words') {
      items = text.split(' ')
    } else {
      items = text.split('\n')
    }

    element.innerHTML = items
      .map((item, index) => {
        const content = item === ' ' || item === '' ? '&nbsp;' : item
        const separator = splitType === 'words' && index < items.length - 1 ? ' ' : ''
        return `<span class="split-item inline-block overflow-hidden"><span class="split-inner inline-block">${content}</span></span>${separator}`
      })
      .join('')

    const ctx = gsap.context(() => {
      gsap.from(element.querySelectorAll('.split-inner'), {
        y: '100%',
        opacity: 0,
        duration: duration,
        delay: delay,
        stagger: stagger,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    }, element)

    return () => ctx.revert()
  }, [delay, stagger, duration, splitType])

  // Use a wrapper div for the ref, render Tag inside
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Fade up animation
interface FadeUpProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
}

export function FadeUp({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  distance = 50,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.from(ref.current!, {
        y: distance,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [delay, duration, distance])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Scale in animation
interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  scale?: number
}

export function ScaleIn({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  scale = 0.8,
}: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.from(ref.current!, {
        scale: scale,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [delay, duration, scale])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Stagger children animation
interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  childSelector?: string
}

export function StaggerChildren({
  children,
  className = '',
  delay = 0,
  stagger = 0.1,
  duration = 0.6,
  childSelector = ':scope > *',
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelectorAll(childSelector), {
        y: 30,
        opacity: 0,
        duration: duration,
        delay: delay,
        stagger: stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [delay, stagger, duration, childSelector])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Parallax wrapper
interface ParallaxProps {
  children: ReactNode
  className?: string
  speed?: number
}

export function Parallax({
  children,
  className = '',
  speed = 0.5,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.to(ref.current!, {
        yPercent: -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [speed])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Counter animation
interface CounterProps {
  end: number
  start?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function Counter({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const countRef = useRef({ value: start })

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.to(countRef.current, {
        value: end,
        duration: duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${Math.round(countRef.current.value)}${suffix}`
          }
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [end, start, duration, prefix, suffix])

  return <span ref={ref} className={className}>{prefix}{start}{suffix}</span>
}

// Horizontal scroll section
interface HorizontalScrollProps {
  children: ReactNode
  className?: string
}

export function HorizontalScroll({
  children,
  className = '',
}: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return

    const ctx = gsap.context(() => {
      const wrapper = wrapperRef.current!
      const totalWidth = wrapper.scrollWidth - wrapper.clientWidth

      gsap.to(wrapper, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current!,
          start: 'top top',
          end: `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={wrapperRef} className="flex">
        {children}
      </div>
    </div>
  )
}
