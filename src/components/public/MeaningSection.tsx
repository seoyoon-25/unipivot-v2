'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from '@/hooks/useGSAP'

export function MeaningSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Parallax for decorative elements
      gsap.to('.meaning-deco-1', {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to('.meaning-deco-2', {
        y: 100,
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
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center bg-dark overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="meaning-deco-1 absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="meaning-deco-2 absolute -bottom-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* UNI Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-sm font-semibold rounded-full mb-6">
              UNITE
            </span>

            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
              UNI
            </h2>

            <p className="text-xl md:text-2xl text-white/70 leading-relaxed mb-10">
              <span className="text-primary font-semibold">UNITE</span>는
              남과 북의 청년들이 <span className="text-white font-semibold">하나로 연결</span>된다는 의미입니다.
              분단의 경계를 넘어 함께 소통하고, 이해하며,
              새로운 한반도의 미래를 함께 그려갑니다.
            </p>

            {/* Visual element */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10"
              >
                <span className="text-primary font-bold text-2xl">N</span>
              </motion.div>
              <span className="text-white/30 text-3xl font-light">+</span>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10"
              >
                <span className="text-primary font-bold text-2xl">S</span>
              </motion.div>
              <span className="text-white/30 text-3xl font-light">=</span>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-2xl">1</span>
              </motion.div>
            </div>
          </motion.div>

          {/* PIVOT Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white text-sm font-semibold rounded-full mb-6">
              PIVOTING
            </span>

            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
              PIVOT
            </h2>

            <p className="text-xl md:text-2xl text-white/70 leading-relaxed mb-10">
              <span className="text-primary font-semibold">PIVOTING</span>은
              관점의 <span className="text-white font-semibold">전환과 변화</span>를 의미합니다.
              고정된 시각에서 벗어나 다양한 관점으로 한반도를 바라보며,
              새로운 가능성을 발견합니다.
            </p>

            {/* Visual element */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="px-5 py-3 bg-white/5 border border-white/10 rounded-full"
              >
                <span className="text-white/50">기존 관점</span>
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex-1 h-0.5 bg-gradient-to-r from-white/20 to-primary origin-left"
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="px-5 py-3 bg-primary rounded-full"
              >
                <span className="text-white font-medium">새로운 시각</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
