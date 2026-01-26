'use client'

import { useEffect, useRef, RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Hook for basic GSAP animations
export function useGSAP<T extends HTMLElement = HTMLDivElement>(
  animation: (element: T, gsapInstance: typeof gsap) => gsap.core.Timeline | gsap.core.Tween | void,
  deps: React.DependencyList = []
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      animation(ref.current!, gsap)
    }, ref)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

// Hook for scroll-triggered animations
export function useScrollTrigger<T extends HTMLElement = HTMLDivElement>(
  options: {
    animation?: gsap.TweenVars
    trigger?: ScrollTrigger.Vars
    from?: gsap.TweenVars
    to?: gsap.TweenVars
  } = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const { animation, trigger, from, to } = options

    const ctx = gsap.context(() => {
      if (from && to) {
        gsap.fromTo(ref.current!, from, {
          ...to,
          scrollTrigger: {
            trigger: ref.current!,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            ...trigger,
          },
        })
      } else {
        gsap.from(ref.current!, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power3.out',
          ...animation,
          scrollTrigger: {
            trigger: ref.current!,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            ...trigger,
          },
        })
      }
    }, ref)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}

// Hook for parallax effect
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.5
) {
  const ref = useRef<T>(null)

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

  return ref
}

// Hook for text reveal animation
export function useTextReveal<T extends HTMLElement = HTMLDivElement>(
  options: {
    stagger?: number
    duration?: number
    delay?: number
  } = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const { stagger = 0.02, duration = 0.8, delay = 0 } = options

    const ctx = gsap.context(() => {
      const text = ref.current!.textContent || ''
      const chars = text.split('')
      ref.current!.innerHTML = chars
        .map((char) => `<span class="split-char">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('')

      gsap.from(ref.current!.querySelectorAll('.split-char'), {
        opacity: 0,
        y: 50,
        rotateX: -90,
        stagger: stagger,
        duration: duration,
        delay: delay,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}

// Hook for counter animation
export function useCountUp(
  end: number,
  options: {
    duration?: number
    start?: number
    suffix?: string
    prefix?: string
  } = {}
) {
  const ref = useRef<HTMLElement>(null)
  const countRef = useRef({ value: options.start || 0 })

  useEffect(() => {
    if (!ref.current) return

    const { duration = 2, start = 0, suffix = '', prefix = '' } = options

    const ctx = gsap.context(() => {
      gsap.to(countRef.current, {
        value: end,
        duration: duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 80%',
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end])

  return ref
}

// Hook for stagger animations
export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options: {
    from?: gsap.TweenVars
    stagger?: number | gsap.StaggerVars
    duration?: number
  } = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const { from = { opacity: 0, y: 30 }, stagger = 0.1, duration = 0.6 } = options

    const ctx = gsap.context(() => {
      gsap.from(selector, {
        ...from,
        stagger: stagger,
        duration: duration,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}

// Export GSAP and ScrollTrigger for direct use
export { gsap, ScrollTrigger }
