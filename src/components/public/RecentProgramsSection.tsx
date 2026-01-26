'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from '@/hooks/useGSAP'
import { Calendar, ArrowRight } from 'lucide-react'
import {
  getProgramStatus,
  getStatusLabel,
  getStatusBadgeClass,
  getFeeDisplay,
  getProgramTypeLabel,
  getModeLabel,
} from '@/lib/program/status-calculator'
import { useCardSettings, getStatusBadgeBaseClass, getModeBadgeBaseClass } from '@/hooks/useCardSettings'

interface Program {
  id: string
  title: string
  slug: string
  type: string
  description: string | null
  image: string | null
  thumbnailSquare: string | null
  isOnline: boolean
  feeType: string
  feeAmount: number
  status: string | null
  recruitStartDate: Date | null
  recruitEndDate: Date | null
  startDate: Date | null
  endDate: Date | null
  likeCount: number
  applicationCount: number
  capacity: number
  location: string | null
  _count: { registrations: number; applications: number }
}

interface Props {
  programs: Program[]
}

export function RecentProgramsSection({ programs }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current || programs.length === 0) return

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current!.querySelectorAll('.recent-program-card'), {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [programs.length])

  if (programs.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 bg-dark/5 text-dark text-sm font-semibold rounded-full mb-4">
              Recent
            </span>
            <h2 className="text-headline text-dark">
              진행중인 프로그램
            </h2>
            <p className="text-gray-500 mt-3">다양한 프로그램에 참여해보세요</p>
          </div>
          <Link
            href="/programs"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-dark text-white rounded-full font-medium hover:bg-dark-secondary transition-colors"
          >
            전체 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Program Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dark text-white rounded-full font-medium hover:bg-dark-secondary transition-colors"
          >
            전체 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProgramCard({ program }: { program: Program }) {
  const { settings: cardSettings } = useCardSettings()
  const programStatus = getProgramStatus({
    status: program.status ?? undefined,
    recruitStartDate: program.recruitStartDate,
    recruitEndDate: program.recruitEndDate,
    startDate: program.startDate,
    endDate: program.endDate,
  })

  const statusLabel = getStatusLabel(programStatus)
  const statusBadgeClass = getStatusBadgeClass(programStatus)
  const typeLabel = getProgramTypeLabel(program.type)
  const feeDisplay = getFeeDisplay(program.feeType, program.feeAmount)
  const modeLabel = getModeLabel(program.isOnline)
  const thumbnail = program.thumbnailSquare || program.image || '/images/default-program.svg'

  const isRecruiting = programStatus === 'RECRUITING'

  return (
    <Link
      href={`/programs/${program.slug}`}
      className="recent-program-card group"
    >
      <div className="bg-light rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={thumbnail}
            alt={program.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-500" />

          {/* Status Badge */}
          <span
            className={`absolute top-4 left-4 ${getStatusBadgeBaseClass(cardSettings)} ${statusBadgeClass}`}
          >
            {statusLabel}
          </span>

          {/* Quick Info on Hover */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex gap-2">
              <span className={`${getModeBadgeBaseClass(cardSettings)} bg-white/90 text-dark`}>
                {modeLabel}
              </span>
              {program.startDate && (
                <span className="px-3 py-1 bg-white/90 text-dark text-xs font-medium rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(program.startDate).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <span className="text-xs text-gray-500 font-medium">{typeLabel}</span>

          {/* Title */}
          <h3 className="font-bold text-dark text-lg mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {program.title}
          </h3>

          {/* Fee */}
          <p className="text-sm text-gray-600 mb-4">{feeDisplay}</p>

          {/* CTA Button */}
          <div
            className={`w-full py-3 text-center font-semibold rounded-xl transition-all duration-300 ${
              isRecruiting
                ? 'bg-primary text-white group-hover:bg-primary-dark'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {isRecruiting ? '신청하기' : '상세보기'}
          </div>
        </div>
      </div>
    </Link>
  )
}
