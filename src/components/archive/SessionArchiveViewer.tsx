'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Calendar,
  Users,
  BookOpen,
  Camera,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { getSessionArchive } from '@/lib/actions/archive'

interface Archive {
  id: string
  sessionId: string
  summary: string | null
  highlights: string[]
  photos: string[]
  topKeywords: string[]
  nextSessionPreview: string | null
  createdAt: Date
  session: {
    id: string
    sessionNo: number
    date: Date
    title: string | null
    bookTitle: string | null
    bookRange: string | null
    program: {
      id: string
      title: string
      type: string
    }
    attendances: any[]
    facilitators: any[]
    speakingStats: any | null
  }
}

interface Props {
  sessionId: string
}

export default function SessionArchiveViewer({ sessionId }: Props) {
  const [archive, setArchive] = useState<Archive | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    loadArchive()
  }, [sessionId])

  const loadArchive = async () => {
    setLoading(true)
    try {
      const data = await getSessionArchive(sessionId)
      setArchive(data as Archive | null)
    } catch (error) {
      console.error('아카이브 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!archive) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>아카이브를 찾을 수 없습니다</p>
      </div>
    )
  }

  const attendeeCount = archive.session.attendances.filter(
    (a: any) => a.status === 'PRESENT'
  ).length

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev =>
      prev === archive.photos.length - 1 ? 0 : prev + 1
    )
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev =>
      prev === 0 ? archive.photos.length - 1 : prev - 1
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
          <span>{archive.session.program.title}</span>
          <span>•</span>
          <span>{archive.session.sessionNo}회차</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {archive.session.title || archive.session.bookTitle || '모임 기록'}
        </h2>
        <div className="flex items-center gap-4 text-sm text-white/80">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(archive.session.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {attendeeCount}명 참석
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-6 space-y-6">
        {/* 사진 갤러리 */}
        {archive.photos.length > 0 && (
          <div className="relative">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              모임 사진
            </h3>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={archive.photos[currentPhotoIndex]}
                alt={`모임 사진 ${currentPhotoIndex + 1}`}
                fill
                className="object-cover"
              />
              {archive.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {archive.photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentPhotoIndex
                            ? 'bg-white'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 요약 */}
        {archive.summary && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              모임 요약
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
              {archive.summary}
            </p>
          </div>
        )}

        {/* 키워드 */}
        {archive.topKeywords.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">핵심 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {archive.topKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 하이라이트 */}
        {archive.highlights.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              주요 발언
            </h3>
            <div className="space-y-3">
              {archive.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-xl p-4"
                >
                  <p className="text-gray-700 italic">"{highlight}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 책 정보 */}
        {archive.session.bookTitle && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              이번 회차 책
            </h3>
            <p className="text-blue-800 font-medium">
              {archive.session.bookTitle}
            </p>
            {archive.session.bookRange && (
              <p className="text-blue-600 text-sm mt-1">
                읽은 범위: {archive.session.bookRange}
              </p>
            )}
          </div>
        )}

        {/* 다음 회차 예고 */}
        {archive.nextSessionPreview && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-2">다음 모임 예고</h3>
            <p className="text-gray-700">{archive.nextSessionPreview}</p>
          </div>
        )}

        {/* 진행자 */}
        {archive.session.facilitators.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">진행자</h3>
            <div className="flex gap-3">
              {archive.session.facilitators.map((f: any) => (
                <div key={f.user.id} className="flex items-center gap-2">
                  {f.user.image ? (
                    <Image
                      src={f.user.image}
                      alt={f.user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {f.user.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
