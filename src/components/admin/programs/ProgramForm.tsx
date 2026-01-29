'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Image as ImageIcon, Move, GripVertical } from 'lucide-react'
import { RichTextEditor } from '@/components/editor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { DraftRestoreAlert, AutoSaveIndicator } from '@/components/common/DraftRestoreAlert'
import { SessionManager, type ProgramSession } from './SessionManager'

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

const programTypes = [
  { value: 'BOOKCLUB', label: '독서모임' },
  { value: 'SEMINAR', label: '강연 및 세미나' },
  { value: 'KMOVE', label: 'K-Move' },
  { value: 'DEBATE', label: '토론회' },
  { value: 'WORKSHOP', label: '워크샵' },
  { value: 'OTHER', label: '기타' },
]

export interface ProgramFormData {
  title: string
  type: string
  description: string
  content: string
  scheduleContent: string
  currentBookContent: string
  capacity: number
  feeType: string
  feeAmount: number
  location: string
  isOnline: boolean
  status: string
  image: string
  thumbnailSquare: string
  imagePosition: number
  recruitStartDate: string
  recruitEndDate: string
  startDate: string
  endDate: string
}

interface Program extends ProgramFormData {
  id: string
  slug: string
  sessions?: ProgramSession[]
}

interface ProgramFormProps {
  program?: Program
  backUrl?: string
}

const defaultFormData: ProgramFormData = {
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
  imagePosition: 0,
  recruitStartDate: '',
  recruitEndDate: '',
  startDate: '',
  endDate: '',
}

function formatDateForInput(date: string | Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function ProgramForm({ program, backUrl }: ProgramFormProps) {
  const router = useRouter()
  const isEditMode = !!program

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(!isEditMode)

  const [form, setForm] = useState<ProgramFormData>(() => {
    if (program) {
      return {
        title: program.title || '',
        type: program.type || 'BOOKCLUB',
        description: program.description || '',
        content: program.content || '',
        scheduleContent: program.scheduleContent || '',
        currentBookContent: program.currentBookContent || '',
        capacity: program.capacity || 30,
        feeType: program.feeType || 'FREE',
        feeAmount: program.feeAmount || 0,
        location: program.location || '',
        isOnline: program.isOnline || false,
        status: program.status || 'DRAFT',
        image: program.image || '',
        thumbnailSquare: program.thumbnailSquare || '',
        imagePosition: program.imagePosition ?? 0,
        recruitStartDate: formatDateForInput(program.recruitStartDate),
        recruitEndDate: formatDateForInput(program.recruitEndDate),
        startDate: formatDateForInput(program.startDate),
        endDate: formatDateForInput(program.endDate),
      }
    }
    return defaultFormData
  })

  const [sessions, setSessions] = useState<ProgramSession[]>(() => {
    if (program?.sessions) {
      return program.sessions.map((s: any) => ({
        id: s.id,
        sessionNo: s.sessionNo,
        date: formatDateForInput(s.date),
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        title: s.title || `${s.sessionNo}회차`,
        bookTitle: s.bookTitle || '',
        bookAuthor: s.bookAuthor || '',
        bookImage: s.bookImage || '',
        bookRange: s.bookRange || '',
      }))
    }
    return []
  })

  const draftKey = isEditMode ? `program-draft-edit-${program?.id}` : 'program-draft-new'

  const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
    key: draftKey,
    data: { form, sessions },
    enabled: dataLoaded,
  })

  useEffect(() => {
    if (isEditMode) {
      setDataLoaded(true)
    }
  }, [isEditMode])

  const handleRestore = () => {
    const restored = restoreDraft()
    if (restored) {
      if (restored.form) setForm(restored.form)
      if (restored.sessions) setSessions(restored.sessions)
      alert('임시저장된 내용을 복원했습니다.')
    }
  }

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
      const payload = {
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
      }

      let res: Response

      if (isEditMode && program) {
        res = await fetch(`/api/admin/programs/${program.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || (isEditMode ? '프로그램 수정 실패' : '프로그램 생성 실패'))
      }

      const data = await res.json()
      clearDraft()
      alert(isEditMode ? '프로그램이 수정되었습니다.' : '프로그램이 생성되었습니다.')
      router.push('/admin/programs')
    } catch (error: any) {
      alert(error.message || (isEditMode ? '프로그램 수정 중 오류가 발생했습니다.' : '프로그램 생성 중 오류가 발생했습니다.'))
    } finally {
      setSaving(false)
    }
  }

  const defaultBackUrl = backUrl || '/admin/programs'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href={defaultBackUrl}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? '프로그램 수정' : '새 프로그램'}
            </h1>
            {isEditMode && program && (
              <p className="text-sm text-gray-500 mt-1">ID: {program.id}</p>
            )}
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
                  {programTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
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
                    <ImageIcon className="w-5 h-5 text-gray-400" />
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

            {/* 이미지 위치 조정 */}
            {form.image && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Move className="w-4 h-4 inline mr-2" />
                  썸네일 미리보기 위치 조정
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  슬라이더를 조정하여 카드 목록에서 보여질 이미지 영역을 선택하세요
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 위치 조정 슬라이더 */}
                  <div className="space-y-4">
                    <div className="relative h-64 overflow-hidden rounded-xl bg-gray-100 border-2 border-dashed border-gray-300">
                      <img
                        src={form.image}
                        alt="위치 조정"
                        className="w-full h-auto absolute left-0"
                        style={{
                          top: `${-form.imagePosition}%`,
                          transform: 'translateY(0)',
                        }}
                        draggable={false}
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/30" />
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/30" />
                        <div className="absolute top-1/3 left-0 right-0 h-1/3 border-2 border-primary border-dashed" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg">
                        <GripVertical className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 w-8">상단</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.imagePosition}
                        onChange={(e) => setForm({ ...form, imagePosition: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xs text-gray-500 w-8 text-right">하단</span>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      현재 위치: {form.imagePosition}%
                    </div>
                  </div>

                  {/* 미리보기 */}
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">카드 미리보기</p>
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-xs">
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={form.image}
                          alt="미리보기"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: `center ${form.imagePosition}%` }}
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-green-500 text-white shadow-lg">
                          모집중
                        </span>
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-gray-500">독서모임</span>
                        <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">
                          {form.title || '프로그램 제목'}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                />
              </div>
            </div>
          </div>

          {/* 회차 정보 (독서모임 전용) */}
          {form.type === 'BOOKCLUB' && (
            <SessionManager sessions={sessions} onChange={setSessions} />
          )}

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4">
            <Link
              href={defaultBackUrl}
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
              {saving ? '저장 중...' : (isEditMode ? '변경사항 저장' : '프로그램 생성')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
