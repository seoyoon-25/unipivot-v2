'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Monitor, Users, ChevronRight } from 'lucide-react'
import {
  getProgramStatus,
  getStatusLabel,
  getStatusBadgeClass,
  getFeeDisplay,
  getProgramTypeLabel,
  getModeLabel,
  type ProgramStatus,
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
  if (programs.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Programs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              진행중인 프로그램
            </h2>
            <p className="text-gray-500 mt-2">다양한 프로그램에 참여해보세요</p>
          </div>
          <Link
            href="/programs"
            className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            전체 보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            전체 보기
            <ChevronRight className="w-4 h-4" />
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
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={thumbnail}
          alt={program.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status Badge */}
        <span
          className={`absolute top-3 left-3 ${getStatusBadgeBaseClass(cardSettings)} ${statusBadgeClass}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-xs text-gray-500 mb-1">
          {typeLabel}
        </span>

        {/* Title */}
        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {program.title}
        </h3>

        {/* Info Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`${getModeBadgeBaseClass(cardSettings)} ${
            program.isOnline ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {modeLabel}
          </span>
          {program.startDate && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(program.startDate).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
        </div>

        {/* Fee Display */}
        <div className="text-sm text-gray-700 mb-2">
          {program.feeType !== 'FREE' && program.feeAmount > 0 && '💰 '}
          {feeDisplay}
        </div>

        {/* Like Count */}
        {program.likeCount > 0 && (
          <div className="text-xs text-gray-400 mb-3">
            ♡ {program.likeCount}명이 관심있어해요
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Button */}
        <div
          className={`block w-full py-3 text-center font-semibold rounded-xl transition-colors ${
            isRecruiting
              ? 'bg-primary text-white group-hover:bg-primary-dark'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isRecruiting ? '신청하기' : '상세보기'}
        </div>
      </div>
    </Link>
  )
}
