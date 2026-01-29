'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Pencil } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
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

interface ProgramCardProps {
  id: string
  title: string
  slug: string
  type: string
  description?: string | null
  image?: string | null
  thumbnailSquare?: string | null
  imagePosition?: number
  isOnline: boolean
  feeType: string
  feeAmount: number
  recruitStartDate?: Date | string | null
  recruitEndDate?: Date | string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  status?: string
  likeCount?: number
  applicationCount?: number
  isLiked?: boolean
  hasApplied?: boolean
}

export function ProgramCard({
  id,
  title,
  slug,
  type,
  description,
  image,
  thumbnailSquare,
  imagePosition = 0,
  isOnline,
  feeType,
  feeAmount,
  recruitStartDate,
  recruitEndDate,
  startDate,
  endDate,
  status: manualStatus,
  likeCount = 0,
  isLiked = false,
  hasApplied = false,
}: ProgramCardProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(isLiked)
  const [likes, setLikes] = useState(likeCount)
  const [isPending, startTransition] = useTransition()
  const { settings: cardSettings } = useCardSettings()

  const programStatus = getProgramStatus({
    status: manualStatus,
    recruitStartDate,
    recruitEndDate,
    startDate,
    endDate,
  })

  const statusLabel = getStatusLabel(programStatus)
  const statusBadgeClass = getStatusBadgeClass(programStatus)
  const feeDisplay = getFeeDisplay(feeType, feeAmount)
  const typeLabel = getProgramTypeLabel(type)
  const modeLabel = getModeLabel(isOnline)
  const thumbnail = thumbnailSquare || image || '/images/default-program.svg'

  const isRecruiting = programStatus === 'RECRUITING'
  const canApply = isRecruiting && !hasApplied
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      // Redirect to login
      window.location.href = `/login?callbackUrl=/programs/${slug}`
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/programs/${id}/like`, {
          method: 'POST',
        })

        if (res.ok) {
          const data = await res.json()
          setLiked(data.liked)
          setLikes(data.likeCount)
        }
      } catch (error) {
        console.error('Like error:', error)
      }
    })
  }

  const getButtonText = () => {
    if (hasApplied) return '신청완료'
    if (isRecruiting) return '신청하기'
    if (programStatus === 'RECRUIT_CLOSED' || programStatus === 'UPCOMING') return '상세보기'
    return '상세보기'
  }

  const getButtonStyle = () => {
    if (hasApplied) {
      return 'bg-gray-400 text-white cursor-default'
    }
    if (canApply) {
      return 'bg-primary hover:bg-primary-dark text-white'
    }
    return 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <Link href={`/programs/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ objectPosition: `center ${imagePosition}%` }}
          />
          {/* Status Badge - Top Left */}
          <span
            className={`absolute top-3 left-3 ${getStatusBadgeBaseClass(cardSettings)} ${statusBadgeClass}`}
          >
            {statusLabel}
          </span>
          {/* Heart Button - Top Right */}
          <div className="absolute top-3 right-3 flex gap-1">
            {isAdmin && (
              <Link
                href={`/admin/programs/${id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                title="프로그램 수정"
              >
                <Pencil className="w-5 h-5 text-gray-500 hover:text-primary" />
              </Link>
            )}
            <button
              onClick={handleLikeClick}
              disabled={isPending}
              className={`p-2 rounded-full bg-white/80 backdrop-blur-sm transition-all ${
                isPending ? 'opacity-50' : 'hover:bg-white hover:scale-110'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  liked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              />
            </button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-xs text-gray-500 mb-1">
          {typeLabel} &gt;
        </span>

        {/* Title */}
        <Link href={`/programs/${slug}`}>
          <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Mode Badge */}
        <div className="mb-2">
          <span className={`${getModeBadgeBaseClass(cardSettings)} ${
            isOnline ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {modeLabel}
          </span>
        </div>

        {/* Fee Display */}
        <div className="text-sm text-gray-700 mb-4">
          {feeType !== 'FREE' && feeAmount > 0 && (
            <span className="mr-1">💰</span>
          )}
          {feeDisplay}
        </div>

        {/* Like Count */}
        {likes > 0 && (
          <div className="text-xs text-gray-400 mb-3">
            ♡ {likes}명이 관심있어해요
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Apply Button */}
        <Link
          href={canApply ? `/programs/${slug}/apply` : `/programs/${slug}`}
          className={`block w-full py-3 text-center font-semibold rounded-xl transition-colors ${getButtonStyle()}`}
          onClick={(e) => {
            if (hasApplied) {
              e.preventDefault()
            }
          }}
        >
          {getButtonText()}
        </Link>
      </div>
    </div>
  )
}

// Simple version for homepage
interface SimpleProgramCardProps {
  title: string
  description: string
  image: string
  href: string
  badge?: string
}

export function SimpleProgramCard({ title, description, image, href, badge }: SimpleProgramCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {badge && (
          <span className="absolute bottom-4 left-4 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3">
          {title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        <Link
          href={href}
          className="text-primary font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
        >
          자세히 보기
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
