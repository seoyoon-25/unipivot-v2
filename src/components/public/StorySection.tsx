'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from '@/hooks/useGSAP'
import { ArrowRight } from 'lucide-react'

// Counter animation component
function AnimatedCounter({
  end,
  suffix = '',
  duration = 2,
}: {
  end: number | string
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  const numericEnd = typeof end === 'string' ? parseInt(end) : end

  useEffect(() => {
    if (!ref.current || hasAnimated.current || isNaN(numericEnd)) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / (duration * 1000), 1)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentValue = Math.round(numericEnd * easeOutQuart)

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
  }, [numericEnd, duration])

  if (isNaN(numericEnd)) {
    return <span>{end}</span>
  }

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export function StorySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return

    const ctx = gsap.context(() => {
      // Parallax for image
      gsap.to(imageRef.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding bg-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <div
                ref={imageRef}
                className="absolute inset-0 scale-125"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <span className="text-6xl font-bold text-primary">U</span>
                    </div>
                    <p className="text-gray-600 font-medium">유니피벗 스토리</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-6 -right-6 lg:right-auto lg:-left-6 bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-dark">
                    <AnimatedCounter end={2019} />
                  </p>
                  <p className="text-sm text-gray-500 mt-1">창립연도</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">
                    <AnimatedCounter end={500} suffix="+" />
                  </p>
                  <p className="text-sm text-gray-500 mt-1">참여 청년</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
              Our Story
            </span>

            <h2 className="text-headline text-dark mb-8">
              왜 유니피벗인가요?
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed mb-10">
              <p>
                2019년, 남과 북에서 온 청년들이 처음 만났습니다.
                서로 다른 환경에서 자랐지만, 같은 꿈을 꾸고 있었습니다.
              </p>
              <p className="text-2xl font-semibold text-dark">
                하나의 한반도, 함께하는 미래.
              </p>
              <p>
                유니피벗은 그 꿈을 향해 나아가는 청년들의 커뮤니티입니다.
                독서모임, 세미나, 현장 탐방 등 다양한 프로그램을 통해
                남북 청년들이 서로를 이해하고 함께 성장합니다.
              </p>
              <p>
                분단 70년, 이제 우리 세대가 변화를 만들어갈 때입니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-dark text-white rounded-full font-semibold hover:bg-dark-secondary transition-colors"
              >
                더 알아보기
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/notice"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-full font-medium hover:border-primary hover:text-primary transition-colors"
              >
                활동 소식
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
