'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Image, Loader2, Plus, Trash2, BookOpen, Copy } from 'lucide-react'
import { RichTextEditor } from '@/components/editor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { DraftRestoreAlert, AutoSaveIndicator } from '@/components/common/DraftRestoreAlert'

const DRAFT_KEY = 'program-draft-new'

const feeTypes = [
  { value: 'FREE', label: '무료' },
  { value: 'DEPOSIT', label: '보증금' },
  { value: 'FEE', label: '참가비' },
  { value: 'TUITION', label: '수강료' },
]

const programStatuses = [
  { value: 'DRAFT', label: '준비중' },
  { value: 'RECRUITING', label: '모집중' },
  { value: 'RECRUIT_CLOSED', label: '모집마감' },
  { value: 'ONGOING', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
]

interface Session {
  sessionNo: number
  date: string
  startTime: string
  endTime: string
  title: string
  bookTitle: string
  bookAuthor: string
  bookImage: string
  bookRange: string
}

export default function WriteProgramPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'BOOKCLUB',
    description: '',
    content: '',
    scheduleContent: '',
    currentBookContent: '',
    capacity: 30,
    feeType: 'FREE',
    feeAmount: 0,
    location: '',
    isOnline: false,
    status: 'DRAFT',
    image: '',
    thumbnailSquare: '',
    recruitStartDate: '',
    recruitEndDate: '',
    startDate: '',
    endDate: '',
  })
  const [uploading, setUploading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionImageUploading, setSessionImageUploading] = useState<number | null>(null)

  const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
    key: DRAFT_KEY,
    data: { form, sessions },
  })

  const handleRestore = () => {
    const restored = restoreDraft()
    if (restored) {
      if (restored.form) setForm(restored.form)
      if (restored.sessions) setSessions(restored.sessions)
      alert('임시저장된 내용을 복원했습니다.')
    }
  }

  // 회차 추가
  const addSession = () => {
    const nextNo = sessions.length + 1
    setSessions([
      ...sessions,
      {
        sessionNo: nextNo,
        date: '',
        startTime: '',
        endTime: '',
        title: `${nextNo}회차`,
        bookTitle: '',
        bookAuthor: '',
        bookImage: '',
        bookRange: '',
      },
    ])
  }

  // 회차 복제
  const duplicateSession = (index: number) => {
    const source = sessions[index]
    const nextNo = sessions.length + 1
    setSessions([
      ...sessions,
      {
        sessionNo: nextNo,
        date: '',  // 날짜는 비워둠 (새로 입력 필요)
        startTime: source.startTime,
        endTime: source.endTime,
        title: `${nextNo}회차`,
        bookTitle: source.bookTitle,
        bookAuthor: source.bookAuthor,
        bookImage: source.bookImage,
        bookRange: source.bookRange,
      },
    ])
  }

  // 회차 삭제
  const removeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      sessionNo: i + 1,
      title: s.title === `${s.sessionNo}회차` ? `${i + 1}회차` : s.title,
    }))
    setSessions(updated)
  }

  // 회차 정보 수정
  const updateSession = (index: number, field: keyof Session, value: string | number) => {
    const updated = [...sessions]
    updated[index] = { ...updated[index], [field]: value }
    setSessions(updated)
  }

  // 회차 도서 이미지 업로드
  const handleSessionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSessionImageUploading(index)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '업로드 실패')
      }

      const data = await res.json()
      updateSession(index, 'bookImage', data.url)
    } catch (error: any) {
      alert(error.message || '이미지 업로드에 실패했습니다.')
    } finally {
      setSessionImageUploading(null)
    }
  }

  // 관리자 권한 체크
  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      alert('관리자만 프로그램을 등록할 수 있습니다.')
      router.push('/programs')
    }
  }, [session, status, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'thumbnailSquare') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '업로드 실패')
      }

      const data = await res.json()
      setForm({ ...form, [field]: data.url })
    } catch (error: any) {
      alert(error.message || '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) {
      alert('프로그램 제목을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          feeAmount: form.feeType === 'FREE' ? 0 : form.feeAmount,
          recruitStartDate: form.recruitStartDate || null,
          recruitEndDate: form.recruitEndDate || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          sessions: sessions.filter(s => s.date).map(s => ({
            ...s,
            date: s.date || null,
          })),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '프로그램 생성 실패')
      }

      const data = await res.json()
      clearDraft()
      alert('프로그램이 등록되었습니다.')
      router.push(`/programs/${data.slug}`)
    } catch (error: any) {
      alert(error.message || '프로그램 등록 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 로딩 또는 권한 없음
  if (status === 'loading' || !session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/programs"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 프로그램 등록</h1>
              <p className="text-sm text-gray-500 mt-1">관리자 전용</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} />
        </div>

        {hasDraft && (
          <DraftRestoreAlert onRestore={handleRestore} onDiscard={clearDraft} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로그램 제목 *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="예: 16기 역사 독서모임"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로그램 유형
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="BOOKCLUB">독서모임</option>
                    <option value="SEMINAR">강연 및 세미나</option>
                    <option value="KMOVE">K-Move</option>
                    <option value="DEBATE">토론회</option>
                    <option value="WORKSHOP">워크샵</option>
                    <option value="OTHER">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {programStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정원</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">장소</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="오프라인 장소 또는 온라인 링크"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="block text-sm font-medium text-gray-700">진행 방식</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!form.isOnline}
                        onChange={() => setForm({ ...form, isOnline: false })}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">오프라인</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.isOnline}
                        onChange={() => setForm({ ...form, isOnline: true })}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">온라인</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 비용 설정 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">비용 설정</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비용 유형</label>
                  <div className="flex flex-wrap gap-4">
                    {feeTypes.map((type) => (
                      <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.feeType === type.value}
                          onChange={() =>
                            setForm({
                              ...form,
                              feeType: type.value,
                              feeAmount: type.value === 'FREE' ? 0 : form.feeAmount,
                            })
                          }
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    금액 (원)
                  </label>
                  <input
                    type="number"
                    value={form.feeAmount}
                    onChange={(e) => setForm({ ...form, feeAmount: parseInt(e.target.value) || 0 })}
                    min="0"
                    step="1000"
                    disabled={form.feeType === 'FREE'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* 기간 설정 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기간 설정</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    모집 시작일
                  </label>
                  <input
                    type="date"
                    value={form.recruitStartDate}
                    onChange={(e) => setForm({ ...form, recruitStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    모집 마감일
                  </label>
                  <input
                    type="date"
                    value={form.recruitEndDate}
                    onChange={(e) => setForm({ ...form, recruitEndDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    진행 시작일
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    진행 종료일
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* 이미지 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">이미지</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 이미지
                  </label>
                  <div className="space-y-2">
                    {form.image && (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                        <img src={form.image} alt="대표 이미지" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: '' })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{uploading ? '업로드 중...' : '이미지 업로드'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image')}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    프로그램 상세 페이지에 표시됩니다
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정사각형 썸네일
                  </label>
                  <div className="space-y-2">
                    {form.thumbnailSquare && (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                        <img src={form.thumbnailSquare} alt="썸네일" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, thumbnailSquare: '' })}
                          className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <Image className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{uploading ? '업로드 중...' : '썸네일 업로드'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'thumbnailSquare')}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    카드 목록에 표시됩니다 (1:1 비율 권장)
                  </p>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">설명</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    간단 설명
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="프로그램에 대한 간단한 설명 (검색 결과와 목록에 표시됩니다)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 내용
                  </label>
                  <RichTextEditor
                    content={form.content}
                    onChange={(html) => setForm({ ...form, content: html })}
                    placeholder="프로그램 상세 내용을 입력하세요..."
                    minHeight="300px"
                    autoSaveKey={`program-write-content`}
                  />
                </div>

              </div>
            </div>

            {/* 회차 정보 (독서모임 전용) */}
            {form.type === 'BOOKCLUB' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-gray-900">회차 정보</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addSession}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    회차 추가
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>회차 정보가 없습니다.</p>
                    <p className="text-sm">위의 "회차 추가" 버튼을 클릭하여 추가하세요.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((s, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-semibold rounded-full text-sm">
                              {s.sessionNo}
                            </span>
                            <span className="font-medium text-gray-900">{s.sessionNo}회차</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateSession(index)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="이 회차 복제"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSession(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              날짜 *
                            </label>
                            <input
                              type="date"
                              value={s.date}
                              onChange={(e) => updateSession(index, 'date', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                시작 시간
                              </label>
                              <input
                                type="time"
                                value={s.startTime}
                                onChange={(e) => updateSession(index, 'startTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                종료 시간
                              </label>
                              <input
                                type="time"
                                value={s.endTime}
                                onChange={(e) => updateSession(index, 'endTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              회차 제목
                            </label>
                            <input
                              type="text"
                              value={s.title}
                              onChange={(e) => updateSession(index, 'title', e.target.value)}
                              placeholder="예: 오리엔테이션, 3장 토론 등"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              도서명
                            </label>
                            <input
                              type="text"
                              value={s.bookTitle}
                              onChange={(e) => updateSession(index, 'bookTitle', e.target.value)}
                              placeholder="예: 역사란 무엇인가"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              저자
                            </label>
                            <input
                              type="text"
                              value={s.bookAuthor}
                              onChange={(e) => updateSession(index, 'bookAuthor', e.target.value)}
                              placeholder="예: E.H. 카"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              읽기 범위
                            </label>
                            <input
                              type="text"
                              value={s.bookRange}
                              onChange={(e) => updateSession(index, 'bookRange', e.target.value)}
                              placeholder="예: 1장~3장 (p.1~89)"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              도서 표지 이미지
                            </label>
                            <div className="flex items-center gap-3">
                              {s.bookImage ? (
                                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
                                  <img src={s.bookImage} alt="도서 표지" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => updateSession(index, 'bookImage', '')}
                                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : null}
                              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                <Upload className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {sessionImageUploading === index ? '업로드 중...' : '이미지 업로드'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSessionImageUpload(e, index)}
                                  className="hidden"
                                  disabled={sessionImageUploading === index}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-4">
              <Link
                href="/programs"
                className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '등록 중...' : '프로그램 등록'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
