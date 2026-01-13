'use client'

import { useState, useEffect } from 'react'
import { X, Heart, MessageSquare, Bell, BellOff, Users, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Interest {
  id: string
  content?: string
  nickname?: string
  visibility: string
  likeCount: number
  createdAt: string
  user?: {
    name: string
    image?: string
  }
}

interface RelatedProgram {
  id: string
  title: string
  slug: string
  status: string
}

interface KeywordDetail {
  id: string
  keyword: string
  category?: string
  totalCount: number
  monthlyCount: number
  likeCount: number
  isFixed: boolean
  isRecommended: boolean
}

interface KeywordDetailModalProps {
  keyword: string
  isOpen: boolean
  onClose: () => void
}

export function KeywordDetailModal({ keyword, isOpen, onClose }: KeywordDetailModalProps) {
  const [keywordDetail, setKeywordDetail] = useState<KeywordDetail | null>(null)
  const [interests, setInterests] = useState<Interest[]>([])
  const [relatedPrograms, setRelatedPrograms] = useState<RelatedProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [alertSubscribed, setAlertSubscribed] = useState(false)
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [alertName, setAlertName] = useState('')

  useEffect(() => {
    if (isOpen && keyword) {
      fetchKeywordDetail()
    }
  }, [isOpen, keyword])

  const fetchKeywordDetail = async () => {
    setLoading(true)
    try {
      // 키워드 정보 가져오기
      const keywordsRes = await fetch(`/api/interests/keywords?search=${encodeURIComponent(keyword)}&limit=1`)
      const keywordsData = await keywordsRes.json()

      if (keywordsData.keywords?.[0]) {
        const kw = keywordsData.keywords[0]
        setKeywordDetail(kw)

        // 해당 키워드의 관심사 목록 가져오기
        const interestsRes = await fetch(`/api/interests?keywordId=${kw.id}&limit=10`)
        const interestsData = await interestsRes.json()
        setInterests(interestsData.interests || [])

        // 관련 프로그램 가져오기 (추후 구현)
        // const programsRes = await fetch(`/api/programs?keyword=${encodeURIComponent(keyword)}`)
        // const programsData = await programsRes.json()
        // setRelatedPrograms(programsData.programs || [])
      }
    } catch (error) {
      console.error('Failed to fetch keyword detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!keywordDetail) return

    try {
      const res = await fetch('/api/interests/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywordId: keywordDetail.id,
          type: 'keyword',
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setLiked(data.liked)
        setKeywordDetail(prev => prev ? {
          ...prev,
          likeCount: prev.likeCount + (data.liked ? 1 : -1)
        } : null)
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const handleAlertSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keywordDetail || !alertEmail) return

    try {
      const res = await fetch('/api/interests/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywordId: keywordDetail.id,
          email: alertEmail,
          name: alertName || undefined,
        }),
      })

      if (res.ok) {
        setAlertSubscribed(true)
        setShowAlertForm(false)
      }
    } catch (error) {
      console.error('Alert subscription error:', error)
    }
  }

  const getDisplayName = (interest: Interest) => {
    if (interest.visibility === 'ANONYMOUS') return '익명'
    if (interest.visibility === 'NICKNAME' && interest.nickname) return interest.nickname
    if (interest.visibility === 'MEMBER' && interest.user?.name) return interest.user.name
    return '익명'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">#{keyword}</h2>
            {keywordDetail?.category && (
              <span className="text-sm text-gray-500">{keywordDetail.category}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* 통계 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {keywordDetail?.monthlyCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">이번달</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {keywordDetail?.totalCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">전체</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {keywordDetail?.likeCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">공감</div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                    liked
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  {liked ? '공감함' : '공감하기'}
                </button>
                <button
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                    alertSubscribed
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={alertSubscribed}
                >
                  {alertSubscribed ? (
                    <>
                      <BellOff className="w-5 h-5" />
                      알림 신청됨
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      알림 신청
                    </>
                  )}
                </button>
              </div>

              {/* 알림 신청 폼 */}
              {showAlertForm && !alertSubscribed && (
                <form onSubmit={handleAlertSubscribe} className="bg-blue-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-blue-800">
                    이 키워드와 관련된 프로그램이 열리면 알려드립니다!
                  </p>
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="이메일 주소"
                    required
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300"
                  />
                  <input
                    type="text"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                    placeholder="이름 (선택)"
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    알림 신청하기
                  </button>
                </form>
              )}

              {/* 관련 글 목록 */}
              {interests.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    관련 관심사 글
                  </h3>
                  <div className="space-y-2">
                    {interests.map((interest) => (
                      <div
                        key={interest.id}
                        className="bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{getDisplayName(interest)}</span>
                          <span>{new Date(interest.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                        {interest.content && (
                          <p className="text-sm text-gray-700">{interest.content}</p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <Heart className="w-3 h-3" />
                          {interest.likeCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 관련 프로그램 */}
              {relatedPrograms.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    관련 프로그램
                  </h3>
                  <div className="space-y-2">
                    {relatedPrograms.map((program) => (
                      <Link
                        key={program.id}
                        href={`/programs/${program.slug}`}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {program.title}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
