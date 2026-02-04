'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Calendar, MapPin, Users, Clock, ArrowLeft, BookOpen, FileText, Edit3 } from 'lucide-react'
import { ShareButton } from '@/components/common/ShareButton'
import { LegacyProgramContent } from '@/components/programs/LegacyProgramContent'
import { sanitizeHtml } from '@/lib/sanitize'
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
  userRole?: string
}

export function ProgramDetailContent({
  program,
  isLiked: initialLiked,
  hasApplied,
  application,
  isLoggedIn,
  userRole,
}: ProgramDetailContentProps) {
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
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

  // ═══════════════════════════════════════════════════════════
  // 레거시 프로그램인 경우 별도 렌더링
  // ═══════════════════════════════════════════════════════════
  if (program.isLegacy && program.legacyHtml) {
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

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 제목 영역 */}
          <div className="bg-white rounded-2xl p-6 mb-6 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                {typeLabel}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${statusBadgeClass}`}>
                {statusLabel}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{program.title}</h1>
            {program.description && (
              <p className="text-gray-600 mt-2">{program.description}</p>
            )}
          </div>

          {/* 레거시 콘텐츠 */}
          <div className="bg-white rounded-2xl p-6 border">
            <LegacyProgramContent
              html={program.legacyHtml}
              title={program.title}
              originalUrl={program.originalUrl}
              migratedAt={program.migratedAt}
            />
          </div>
        </div>
      </div>
    )
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
                  {isAdmin && (
                    <Link
                      href={`/programs/${program.slug}/edit`}
                      className="p-3 rounded-full border border-gray-200 bg-white hover:border-primary hover:bg-primary/5 transition-colors text-gray-400 hover:text-primary"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Link>
                  )}
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
                <div className="rich-text-content prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.content) }} />
              </div>
            )}

            {/* Schedule Content */}
            {program.scheduleContent && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">일정 안내</h2>
                <div className="rich-text-content prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.scheduleContent) }} />
              </div>
            )}

            {/* Current Book Content (for BOOKCLUB) */}
            {program.type === 'BOOKCLUB' && program.currentBookContent && (
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  현재 진행 도서
                </h2>
                <div className="rich-text-content prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.currentBookContent) }} />
              </div>
            )}

            {/* Sessions */}
            {program.sessions && program.sessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {program.type === 'BOOKCLUB' ? '회차별 도서 안내' : '진행 일정'}
                </h2>
                <div className="space-y-4">
                  {program.sessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                    >
                      <div className="flex gap-4">
                        {/* 도서 이미지 (독서모임인 경우) */}
                        {program.type === 'BOOKCLUB' && session.bookImage && (
                          <div className="flex-shrink-0">
                            <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-md">
                              <Image
                                src={session.bookImage}
                                alt={session.bookTitle || '도서 이미지'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-semibold rounded-full text-sm flex-shrink-0">
                              {session.sessionNo}
                            </span>
                            <div className="flex-1 min-w-0">
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

                          {/* 도서 정보 (독서모임인 경우) */}
                          {program.type === 'BOOKCLUB' && session.bookTitle && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="font-medium text-gray-900">
                                📚 {session.bookTitle}
                              </p>
                              {session.bookAuthor && (
                                <p className="text-sm text-gray-600 mt-1">
                                  저자: {session.bookAuthor}
                                </p>
                              )}
                              {session.bookRange && (
                                <p className="text-sm text-gray-500 mt-1">
                                  범위: {session.bookRange}
                                </p>
                              )}
                            </div>
                          )}

                          {/* 일반 프로그램 도서 정보 */}
                          {program.type !== 'BOOKCLUB' && session.bookTitle && (
                            <p className="text-sm text-gray-600 mt-2 ml-11">
                              📚 {session.bookTitle}
                              {session.bookRange && ` (${session.bookRange})`}
                            </p>
                          )}
                        </div>

                        {/* 독후감 작성 버튼 (독서모임인 경우) */}
                        {program.type === 'BOOKCLUB' && isLoggedIn && (
                          <div className="flex-shrink-0 self-center">
                            <Link
                              href={`/my/reports/new?programId=${program.id}&sessionId=${session.id}${session.bookTitle ? `&bookTitle=${encodeURIComponent(session.bookTitle)}` : ''}`}
                              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                            >
                              <FileText className="w-4 h-4" />
                              독후감
                            </Link>
                          </div>
                        )}
                      </div>
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
                    <p className="text-sm text-gray-500">모집인원</p>
                    <p className="font-medium">{program.capacity}명</p>
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
