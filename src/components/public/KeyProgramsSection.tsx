'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap, ScrollTrigger } from '@/hooks/useGSAP'
import { BookOpen, Mic, MapPin, MessageSquare, ArrowUpRight } from 'lucide-react'

const programs = [
  {
    title: '남Book북한걸음',
    description: '책을 통해 남북을 이해하는 독서모임. 매 시즌 8주간 진행되며, 남북 청년들이 함께 책을 읽고 토론합니다.',
    href: '/programs?type=BOOKCLUB',
    badge: '격주 1회',
    icon: BookOpen,
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
  },
  {
    title: '강연 및 세미나',
    description: '분단과 통일, 한반도 평화에 대한 다양한 주제의 전문가 강연과 토론을 진행합니다.',
    href: '/programs?type=SEMINAR',
    badge: '월 1회',
    icon: Mic,
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'K-Move',
    description: '한반도 관련 역사적 장소를 탐방하며 현장에서 배우는 체험 프로그램입니다.',
    href: '/programs?type=KMOVE',
    badge: '분기 1회',
    icon: MapPin,
    color: '#F97316',
    bgColor: 'bg-orange-50',
  },
  {
    title: '토론회',
    description: '남북한 관련 주제에 대해 다양한 관점으로 토론하며 생각을 나누는 프로그램입니다.',
    href: '/programs?type=DEBATE',
    badge: '월 1회',
    icon: MessageSquare,
    color: '#10B981',
    bgColor: 'bg-green-50',
  },
]

export function KeyProgramsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      // Stagger animation for cards
      gsap.from(cardsRef.current!.querySelectorAll('.program-card'), {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="programs"
      className="section-padding bg-light"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Programs
          </span>
          <h2 className="text-headline text-dark mb-6">
            핵심 프로그램
          </h2>
          <p className="text-body-lg max-w-2xl mx-auto">
            남북청년이 함께 성장하고 소통하는
            <br className="hidden md:block" />
            다양한 프로그램을 운영합니다
          </p>
        </motion.div>

        {/* Program Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-6"
        >
          {programs.map((program, index) => {
            const Icon = program.icon
            return (
              <Link
                key={program.href}
                href={program.href}
                className="program-card group"
              >
                <div className="relative bg-white rounded-3xl p-8 h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
                  {/* Background decoration */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-50"
                    style={{ backgroundColor: program.color }}
                  />

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 ${program.bgColor} rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110`}
                  >
                    <Icon className="w-7 h-7" style={{ color: program.color }} />
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-dark group-hover:text-primary transition-colors">
                        {program.title}
                      </h3>
                      <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>

                    <span
                      className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-4"
                      style={{
                        backgroundColor: `${program.color}15`,
                        color: program.color,
                      }}
                    >
                      {program.badge}
                    </span>

                    <p className="text-gray-600 leading-relaxed">
                      {program.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
