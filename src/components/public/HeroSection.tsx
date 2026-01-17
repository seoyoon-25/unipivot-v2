'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { SocialIcons } from './SocialIcons'
import { ArrowDown, Users, BookOpen, Award } from 'lucide-react'

interface Props {
  stats?: {
    members: number
    completedPrograms: number
    totalParticipations: number
  }
}

// 애니메이션 variants
const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.25, 0.4, 0.25, 1]
    }
  })
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4
    }
  }
}

const statItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
}

export function HeroSection({ stats }: Props) {
  const scrollToContent = () => {
    const element = document.getElementById('programs')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://cdn.imweb.me/thumbnail/20230721/83853103377f0.jpg)' }}
        />
        {/* 그래디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-primary/30" />
        <div className="absolute inset-0 opacity-40">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/60 rounded-full blur-[150px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
        {/* Social Links */}
        <motion.div
          className="flex justify-center mb-8"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
        >
          <SocialIcons variant="dark" size="md" />
        </motion.div>

        {/* Title */}
        <motion.p
          className="text-primary tracking-[0.3em] text-sm md:text-base uppercase mb-4"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
        >
          UNIPIVOT
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
        >
          유 니 피 벗
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          남북청년이 함께 새로운 한반도를 만들어갑니다.
        </motion.p>

        {/* Stats */}
        {stats && (
          <motion.div
            className="flex justify-center gap-8 md:gap-16 mb-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="text-center" variants={statItem}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-3xl md:text-4xl font-bold text-white">{stats.members}</span>
              </div>
              <p className="text-white/60 text-sm">회원</p>
            </motion.div>
            <motion.div className="text-center" variants={statItem}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-3xl md:text-4xl font-bold text-white">{stats.completedPrograms}</span>
              </div>
              <p className="text-white/60 text-sm">완료된 프로그램</p>
            </motion.div>
            <motion.div className="text-center" variants={statItem}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-3xl md:text-4xl font-bold text-white">{stats.totalParticipations}</span>
              </div>
              <p className="text-white/60 text-sm">총 참여</p>
            </motion.div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
        >
          <Link
            href="#programs"
            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            프로그램 둘러보기
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-medium transition-all duration-200 hover:bg-white/20"
          >
            유니피벗 소개
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </section>
  )
}
