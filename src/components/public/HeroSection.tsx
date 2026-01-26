'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from '@/hooks/useGSAP'
import { ArrowDown, ArrowRight } from 'lucide-react'

interface Props {
  stats?: {
    members: number
    completedPrograms: number
    totalParticipations: number
  }
}

// Counter animation component
function AnimatedCounter({
  end,
  suffix = '',
  duration = 2,
}: {
  end: number
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()
          const startValue = 0

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / (duration * 1000), 1)

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentValue = Math.round(startValue + (end - startValue) * easeOutQuart)

            setCount(currentValue)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export function HeroSection({ stats }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2,
      })

      // Subtitle animation
      gsap.from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
      })

      // Parallax effect on scroll
      gsap.to('.hero-bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Title scale on scroll
      gsap.to(titleRef.current, {
        scale: 0.8,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '50% top',
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const scrollToContent = () => {
    const element = document.getElementById('programs')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark"
    >
      {/* Background */}
      <div className="hero-bg absolute inset-0">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: 'url(https://cdn.imweb.me/thumbnail/20230721/83853103377f0.jpg)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/50 to-dark" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[150px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/15 rounded-full blur-[150px]"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        {/* Pre-title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-primary tracking-[0.3em] text-sm uppercase mb-8 font-medium"
        >
          Unite & Pivoting
        </motion.p>

        {/* Main Title */}
        <h1
          ref={titleRef}
          className="text-display text-white mb-8 leading-tight"
        >
          남북청년이 함께
          <br />
          <span className="text-gradient-primary">새로운 한반도</span>를
          <br />
          만들어갑니다
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-white/70 mb-16 max-w-2xl mx-auto leading-relaxed"
        >
          분단의 경계를 넘어 함께 소통하고, 이해하며,
          <br className="hidden md:block" />
          미래를 함께 그려가는 청년 커뮤니티
        </p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-24"
        >
          <Link
            href="/programs"
            className="group px-8 py-4 bg-white text-dark rounded-full font-semibold text-lg transition-all duration-300 hover:bg-primary hover:text-white flex items-center justify-center gap-2"
          >
            프로그램 둘러보기
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-medium text-lg transition-all duration-300 hover:bg-white/20"
          >
            유니피벗 소개
          </Link>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-3 gap-8 md:gap-16 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={stats.members} suffix="+" />
              </p>
              <p className="text-white/60 text-sm md:text-base">회원</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={stats.completedPrograms} suffix="+" />
              </p>
              <p className="text-white/60 text-sm md:text-base">완료된 프로그램</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={stats.totalParticipations} suffix="+" />
              </p>
              <p className="text-white/60 text-sm md:text-base">총 참여</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-light to-transparent" />
    </section>
  )
}
