'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Calendar, MapPin, Users, Clock, ArrowLeft, BookOpen } from 'lucide-react'
import { ShareButton } from '@/components/common/ShareButton'
import '@/components/editor/editor.css'
import {
  getProgramStatus,
  getStatusLabel,
  getStatusBadgeClass,
  getFeeDisplay,
  getProgramTypeLabel,
  getModeLabel,
} from '@/lib/program/status-calculator'

interface ProgramDetailContentProps {
  program: any
  isLiked: boolean
  hasApplied: boolean
  application: any
  isLoggedIn: boolean
}

export function ProgramDetailContent({
  program,
  isLiked: initialLiked,
  hasApplied,
  application,
  isLoggedIn,
}: ProgramDetailContentProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(program.likeCount)
  const [isPending, startTransition] = useTransition()

  const programStatus = getProgramStatus({
    status: program.status,
    recruitStartDate: program.recruitStartDate,
    recruitEndDate: program.recruitEndDate,
    startDate: program.startDate,
    endDate: program.endDate,
  })

  const statusLabel = getStatusLabel(programStatus)
  const statusBadgeClass = getStatusBadgeClass(programStatus)
  const feeDisplay = getFeeDisplay(program.feeType, program.feeAmount)
  const typeLabel = getProgramTypeLabel(program.type)
  const modeLabel = getModeLabel(program.isOnline)

  const isRecruiting = programStatus === 'RECRUITING'
  const canApply = isRecruiting && !hasApplied

  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      window.location.href = `/login?callbackUrl=/programs/${program.slug}`
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/programs/${program.id}/like`, {
          method: 'POST',
        })

        if (res.ok) {
          const data = await res.json()
          setLiked(data.liked)
          setLikeCount(data.likeCount)
        }
      } catch (error) {
        console.error('Like error:', error)
      }
    })
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            프로그램 목록
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
              <Image
                src={program.image || '/images/default-program.jpg'}
                alt={program.title}
                fill
                className="object-cover"
              />
              <span
                className={`absolute top-4 left-4 px-3 py-1.5 text-sm font-semibold rounded-full ${statusBadgeClass}`}
              >
                {statusLabel}
              </span>
            </div>

            {/* Title & Actions */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm text-gray-500 mb-1 block">{typeLabel}</span>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {program.title}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLikeClick}
                    disabled={isPending}
                    className={`p-3 rounded-full border transition-all ${
                      liked
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200 hover:border-red-200'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        liked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <ShareButton
                    title={program.title}
                    description={program.description}
                    imageUrl={program.thumbnailSquare || program.image}
                    className="p-3 rounded-full border border-gray-200 bg-white hover:border-gray-300 transition-colors text-gray-400"
                  />
                </div>
              </div>
              {likeCount > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  ♡ {likeCount}명이 관심있어해요
                </p>
              )}
            </div>

            {/* Description */}
            {program.description && (
              <div className="mb-8">
                <p className="text-gray-700 whitespace-pre-line">{program.description}</p>
              </div>
            )}

            {/* Content */}
            {program.content && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">프로그램 소개</h2>
                <div className="rich-text-content prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: program.content }} />
              </div>
            )}

            {/* Schedule Content */}
            {program.scheduleContent && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">일정 안내</h2>
                <div className="rich-text-content prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: program.scheduleContent }} />
              </div>
            )}

            {/* Current Book Content (for BOOKCLUB) */}
            {program.type === 'BOOKCLUB' && program.currentBookContent && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  현재 진행 도서
                </h2>
                <div className="rich-text-content prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: program.currentBookContent }} />
              </div>
            )}

            {/* Sessions */}
            {program.sessions && program.sessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">진행 일정</h2>
                <div className="space-y-3">
                  {program.sessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="bg-white rounded-xl p-4 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-semibold rounded-full text-sm">
                          {session.sessionNo}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {session.title || `${session.sessionNo}회차`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(session.date)}
                            {session.startTime && ` ${session.startTime}`}
                            {session.endTime && ` ~ ${session.endTime}`}
                          </p>
                        </div>
                      </div>
                      {session.bookTitle && (
                        <p className="text-sm text-gray-600 mt-2 ml-11">
                          📚 {session.bookTitle}
                          {session.bookRange && ` (${session.bookRange})`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {program.gallery && program.gallery.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">갤러리</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {program.gallery.map((item: any) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.caption || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
              {/* Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">진행 기간</p>
                    <p className="font-medium">
                      {formatDate(program.startDate)} ~ {formatDate(program.endDate)}
                    </p>
                  </div>
                </div>

                {program.recruitStartDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">모집 기간</p>
                      <p className="font-medium">
                        {formatDate(program.recruitStartDate)} ~ {formatDate(program.recruitEndDate)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">진행 방식</p>
                    <p className="font-medium">
                      {modeLabel}
                      {program.location && ` · ${program.location}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">정원</p>
                    <p className="font-medium">
                      {program.capacity}명
                      {program.applicationCount > 0 && ` (${program.applicationCount}명 신청)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee */}
              <div className="border-t pt-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">참가 비용</p>
                <p className="text-2xl font-bold text-primary">
                  {program.feeType !== 'FREE' && program.feeAmount > 0 && '💰 '}
                  {feeDisplay}
                </p>
                {program.depositSetting && (
                  <p className="text-sm text-gray-600 mt-1">
                    *보증금은 조건 충족 시 환급됩니다.
                  </p>
                )}
              </div>

              {/* Apply Button */}
              {hasApplied ? (
                <div className="space-y-3">
                  <div className="bg-gray-100 text-center py-3 rounded-xl">
                    <p className="font-semibold text-gray-500">신청완료</p>
                    {application && (
                      <p className="text-sm text-gray-400 mt-1">
                        {application.status === 'PENDING' && '심사 중입니다'}
                        {application.status === 'ACCEPTED' && '합격되었습니다'}
                        {application.status === 'ADDITIONAL' && '추가합격되었습니다'}
                        {application.status === 'REJECTED' && '불합격되었습니다'}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/my/applications"
                    className="block text-center text-primary text-sm hover:underline"
                  >
                    내 신청 내역 보기
                  </Link>
                </div>
              ) : canApply ? (
                <Link
                  href={`/programs/${program.slug}/apply`}
                  className="block w-full py-4 bg-primary hover:bg-primary-dark text-white text-center font-semibold rounded-xl transition-colors"
                >
                  신청하기
                </Link>
              ) : (
                <div className="bg-gray-100 text-center py-4 rounded-xl">
                  <p className="font-semibold text-gray-500">
                    {programStatus === 'UPCOMING' && '모집 예정'}
                    {programStatus === 'RECRUIT_CLOSED' && '모집 마감'}
                    {programStatus === 'ONGOING' && '진행 중'}
                    {programStatus === 'COMPLETED' && '종료된 프로그램'}
                    {programStatus === 'DRAFT' && '준비 중'}
                  </p>
                </div>
              )}

              {/* Login prompt */}
              {!isLoggedIn && canApply && (
                <p className="text-sm text-center text-gray-500 mt-3">
                  <Link href={`/login?callbackUrl=/programs/${program.slug}`} className="text-primary hover:underline">
                    로그인
                  </Link>
                  하고 신청하세요
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
