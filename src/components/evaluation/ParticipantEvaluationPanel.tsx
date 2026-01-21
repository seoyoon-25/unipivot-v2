'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  User,
  AlertTriangle,
  ThumbsUp,
  Calendar,
  BookOpen,
  Clock,
  Mic,
  StickyNote,
  Plus,
  Star,
  X,
  Loader2,
  Check
} from 'lucide-react'
import {
  getParticipantEvaluation,
  createNote,
  deleteNote,
  createSeasonEvaluation
} from '@/lib/actions/evaluation'
import ParticipantCardIssuer from './ParticipantCardIssuer'

interface EvaluationData {
  user: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  } | null
  cards: {
    warnings: any[]
    praises: any[]
  }
  notes: any[]
  evaluation: any
  stats: {
    attendanceRate: number
    reportCount: number
    facilitatedCount: number
    averageSpeakingTime: number
  }
}

interface Props {
  programId: string
  userId: string
  onClose: () => void
}

export default function ParticipantEvaluationPanel({
  programId,
  userId,
  onClose
}: Props) {
  const [data, setData] = useState<EvaluationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'notes' | 'evaluation'>('overview')
  const [showCardIssuer, setShowCardIssuer] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [showEvaluationForm, setShowEvaluationForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [programId, userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getParticipantEvaluation(programId, userId)
      if ('error' in result) {
        console.error(result.error)
      } else {
        setData(result as EvaluationData)
      }
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!newNote.trim()) return

    setSavingNote(true)
    try {
      await createNote(programId, userId, newNote)
      setNewNote('')
      await loadData()
    } catch (error) {
      console.error('메모 저장 오류:', error)
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('이 메모를 삭제하시겠습니까?')) return

    try {
      await deleteNote(noteId)
      await loadData()
    } catch (error) {
      console.error('메모 삭제 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!data || !data.user) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-gray-500">데이터를 불러올 수 없습니다</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">참가자 평가</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 프로필 */}
          <div className="flex items-center gap-4">
            {data.user.image ? (
              <Image
                src={data.user.image}
                alt={data.user.name || ''}
                width={56}
                height={56}
                className="rounded-full border-2 border-white/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold">{data.user.name || '익명'}</h4>
              {data.user.email && (
                <p className="text-white/70 text-sm">{data.user.email}</p>
              )}
            </div>
          </div>

          {/* 카드 요약 */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                칭찬 {data.cards.praises.length}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                경고 {data.cards.warnings.length}
              </span>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          {[
            { key: 'overview', label: '개요' },
            { key: 'cards', label: '카드' },
            { key: 'notes', label: '메모' },
            { key: 'evaluation', label: '종합평가' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">활동 통계</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">출석률</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {data.stats.attendanceRate}%
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">독후감</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {data.stats.reportCount}편
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Mic className="w-4 h-4" />
                    <span className="text-sm">진행 횟수</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {data.stats.facilitatedCount}회
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">평균 발언</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    {Math.floor(data.stats.averageSpeakingTime / 60)}분
                  </p>
                </div>
              </div>

              {/* 빠른 액션 */}
              <div className="mt-6">
                <h4 className="font-bold text-gray-800 mb-3">빠른 액션</h4>
                <button
                  onClick={() => setShowCardIssuer(true)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  카드 발급하기
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-6">
              {/* 칭찬 카드 */}
              <div>
                <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  칭찬 카드 ({data.cards.praises.length})
                </h4>
                {data.cards.praises.length === 0 ? (
                  <p className="text-gray-500 text-sm">아직 없음</p>
                ) : (
                  <div className="space-y-2">
                    {data.cards.praises.map((card: any) => (
                      <div
                        key={card.id}
                        className="bg-green-50 border border-green-200 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs">
                              {card.category}
                            </span>
                            <h5 className="font-medium text-gray-800 mt-2">
                              {card.title}
                            </h5>
                            {card.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {card.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {card.issuer?.name} •{' '}
                          {new Date(card.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 경고 카드 */}
              <div>
                <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  경고 카드 ({data.cards.warnings.length})
                </h4>
                {data.cards.warnings.length === 0 ? (
                  <p className="text-gray-500 text-sm">아직 없음</p>
                ) : (
                  <div className="space-y-2">
                    {data.cards.warnings.map((card: any) => (
                      <div
                        key={card.id}
                        className="bg-red-50 border border-red-200 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs">
                              {card.category}
                            </span>
                            <h5 className="font-medium text-gray-800 mt-2">
                              {card.title}
                            </h5>
                            {card.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {card.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {card.issuer?.name} •{' '}
                          {new Date(card.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {data.cards.warnings.length >= 3 && (
                  <div className="mt-4 bg-red-100 border border-red-300 rounded-xl p-4 text-red-800 text-sm">
                    <strong>주의:</strong> 경고 3회 이상으로 보증금 환급이 제한됩니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* 메모 작성 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="운영진 메모를 작성하세요..."
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote || !newNote.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {savingNote ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StickyNote className="w-4 h-4" />
                  )}
                  메모 저장
                </button>
              </div>

              {/* 메모 목록 */}
              <div className="space-y-3">
                {data.notes.map((note: any) => (
                  <div
                    key={note.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                  >
                    <p className="text-gray-800">{note.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-400">
                        {note.creator?.name} •{' '}
                        {new Date(note.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}

                {data.notes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    아직 메모가 없습니다
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="space-y-4">
              {data.evaluation ? (
                <div className="space-y-4">
                  {/* 종합 점수 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">종합 평가</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-8 h-8 ${
                            i < data.evaluation.overallRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                      {data.evaluation.overallRating}/5
                    </p>
                  </div>

                  {/* 세부 점수 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">참여도</p>
                      <p className="text-xl font-bold text-gray-800">
                        {data.evaluation.participationScore}/5
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">준비성</p>
                      <p className="text-xl font-bold text-gray-800">
                        {data.evaluation.preparationScore}/5
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">협조성</p>
                      <p className="text-xl font-bold text-gray-800">
                        {data.evaluation.cooperationScore}/5
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">기여도</p>
                      <p className="text-xl font-bold text-gray-800">
                        {data.evaluation.contributionScore}/5
                      </p>
                    </div>
                  </div>

                  {/* 재참여 권장 */}
                  <div
                    className={`rounded-xl p-4 ${
                      data.evaluation.recommendation === 'PRIORITY'
                        ? 'bg-green-100 text-green-800'
                        : data.evaluation.recommendation === 'WELCOME'
                        ? 'bg-blue-100 text-blue-800'
                        : data.evaluation.recommendation === 'HOLD'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <p className="font-bold">재참여 권장:</p>
                    <p>
                      {data.evaluation.recommendation === 'PRIORITY'
                        ? '우선 승인 🌟'
                        : data.evaluation.recommendation === 'WELCOME'
                        ? '환영 ✅'
                        : data.evaluation.recommendation === 'HOLD'
                        ? '보류 ⏸️'
                        : '제한 ❌'}
                    </p>
                  </div>

                  {/* 코멘트 */}
                  {data.evaluation.strengths && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="font-bold text-green-800 mb-2">강점</p>
                      <p className="text-gray-700">{data.evaluation.strengths}</p>
                    </div>
                  )}
                  {data.evaluation.improvements && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="font-bold text-orange-800 mb-2">개선점</p>
                      <p className="text-gray-700">
                        {data.evaluation.improvements}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">
                    아직 종합 평가가 작성되지 않았습니다
                  </p>
                  <button
                    onClick={() => setShowEvaluationForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    평가 작성하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 카드 발급 모달 */}
      {showCardIssuer && (
        <ParticipantCardIssuer
          programId={programId}
          userId={userId}
          userName={data.user.name || '익명'}
          onClose={() => setShowCardIssuer(false)}
          onSuccess={loadData}
        />
      )}
    </>
  )
}
