'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Users,
  BookOpen,
  Calendar,
  Camera,
  Award,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { getGraduationAlbumData } from '@/lib/actions/archive'

interface AlbumData {
  program: {
    id: string
    title: string
    startDate: Date | null
    endDate: Date | null
  }
  stats: {
    totalSessions: number
    totalParticipants: number
    totalReports: number
    totalPhotos: number
  }
  participantStats: Array<{
    user: {
      id: string
      name: string | null
      image: string | null
    }
    attendanceCount: number
    attendanceRate: number
  }>
  sessions: Array<{
    id: string
    sessionNo: number
    date: Date
    title: string | null
    bookTitle: string | null
    attendanceCount: number
    archive: {
      summary: string | null
      photos: string[]
    } | null
  }>
  allPhotos: string[]
}

interface Props {
  programId: string
}

export default function GraduationAlbum({ programId }: Props) {
  const [albumData, setAlbumData] = useState<AlbumData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    loadAlbumData()
  }, [programId])

  const loadAlbumData = async () => {
    setLoading(true)
    try {
      const data = await getGraduationAlbumData(programId)
      setAlbumData(data)
    } catch (error) {
      console.error('앨범 데이터 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!albumData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
        <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>앨범 데이터를 찾을 수 없습니다</p>
      </div>
    )
  }

  const formatDateRange = () => {
    if (!albumData.program.startDate) return ''
    const start = new Date(albumData.program.startDate)
    const end = albumData.program.endDate
      ? new Date(albumData.program.endDate)
      : new Date()
    return `${start.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    })} ~ ${end.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}`
  }

  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl shadow-lg overflow-hidden">
      {/* 타이틀 헤더 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }}
          />
        </div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">졸업 앨범</h1>
          <h2 className="text-xl opacity-90">{albumData.program.title}</h2>
          <p className="text-sm opacity-80 mt-2">{formatDateRange()}</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="p-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {albumData.stats.totalSessions}
            </p>
            <p className="text-sm text-gray-600">총 모임</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {albumData.stats.totalParticipants}
            </p>
            <p className="text-sm text-gray-600">참가자</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {albumData.stats.totalReports}
            </p>
            <p className="text-sm text-gray-600">독후감</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-2">
              <Camera className="w-6 h-6 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {albumData.stats.totalPhotos}
            </p>
            <p className="text-sm text-gray-600">사진</p>
          </div>
        </div>
      </div>

      {/* 참가자 섹션 */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          함께한 사람들
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {albumData.participantStats.map(p => (
            <div key={p.user.id} className="text-center">
              {p.user.image ? (
                <Image
                  src={p.user.image}
                  alt={p.user.name || ''}
                  width={64}
                  height={64}
                  className="rounded-full mx-auto mb-2 border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2 border-2 border-white shadow-md">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <p className="text-sm font-medium text-gray-800 truncate">
                {p.user.name || '익명'}
              </p>
              <p className="text-xs text-gray-500">출석률 {p.attendanceRate}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* 회차별 기록 */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          모임 기록
        </h3>
        <div className="space-y-3">
          {albumData.sessions.map(session => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedSession(
                    expandedSession === session.id ? null : session.id
                  )
                }
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-700">
                    {session.sessionNo}
                  </span>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">
                      {session.title || session.bookTitle || `${session.sessionNo}회차`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString('ko-KR')} •{' '}
                      {session.attendanceCount}명 참석
                    </p>
                  </div>
                </div>
                {expandedSession === session.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSession === session.id && session.archive && (
                <div className="p-4 pt-0 border-t border-gray-100">
                  {session.archive.summary && (
                    <p className="text-gray-700 text-sm mb-4">
                      {session.archive.summary}
                    </p>
                  )}
                  {session.archive.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {session.archive.photos.slice(0, 3).map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPhoto(photo)}
                          className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <Image
                            src={photo}
                            alt={`${session.sessionNo}회차 사진 ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 전체 사진 갤러리 */}
      {albumData.allPhotos.length > 0 && (
        <div className="p-6 bg-white/50">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-6 h-6 text-pink-600" />
            추억 갤러리
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {albumData.allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <Image
                  src={photo}
                  alt={`추억 사진 ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 사진 뷰어 모달 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedPhoto}
              alt="확대 사진"
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 푸터 */}
      <div className="p-6 text-center text-gray-600 text-sm bg-white/50">
        <p>함께 해주셔서 감사합니다 💛</p>
        <p className="mt-1 text-xs text-gray-400">
          Generated by UniPivot
        </p>
      </div>
    </div>
  )
}
