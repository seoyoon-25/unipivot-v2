'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Image, RotateCcw } from 'lucide-react'
import { createProgram } from '@/lib/actions/admin'
import { RichTextEditor } from '@/components/editor'
import { ReportStructureSelector } from '@/components/program/ReportStructureSelector'
import type { ReportStructureCode } from '@/types/report'

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

export default function NewProgramPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'BOOKCLUB',
    description: '',
    content: '',
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
    reportStructure: 'FREE' as ReportStructureCode,
  })
  const [uploading, setUploading] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // 페이지 로드 시 임시저장 데이터 확인
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (parsed.data && parsed.timestamp) {
          setHasDraft(true)
        }
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [])

  // 자동 저장 (3초마다 변경사항 저장)
  useEffect(() => {
    const hasContent = form.title || form.description || form.content
    if (!hasContent) return

    const timer = setTimeout(() => {
      const draftData = {
        data: form,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
      setLastSaved(new Date())
    }, 3000)

    return () => clearTimeout(timer)
  }, [form])

  // 페이지 이탈 시 경고
  useEffect(() => {
    const hasContent = form.title || form.description || form.content

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasContent) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [form])

  // 임시저장 데이터 복원
  const restoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (parsed.data) {
          setForm(parsed.data)
          setHasDraft(false)
          alert('임시저장된 내용을 복원했습니다.')
        }
      } catch (e) {
        alert('복원에 실패했습니다.')
      }
    }
  }, [])

  // 임시저장 삭제
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setLastSaved(null)
  }, [])

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
      await createProgram({
        ...form,
        feeAmount: form.feeType === 'FREE' ? 0 : form.feeAmount,
        recruitStartDate: form.recruitStartDate ? new Date(form.recruitStartDate) : undefined,
        recruitEndDate: form.recruitEndDate ? new Date(form.recruitEndDate) : undefined,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
      })
      clearDraft() // 저장 성공 시 임시저장 삭제
      alert('프로그램이 생성되었습니다.')
      router.push('/admin/programs')
    } catch (error) {
      alert('프로그램 생성 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/programs"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">새 프로그램</h1>
        </div>
        {lastSaved && (
          <span className="text-sm text-gray-500">
            자동 저장됨: {lastSaved.toLocaleTimeString('ko-KR')}
          </span>
        )}
      </div>

      {/* 임시저장 복원 알림 */}
      {hasDraft && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800">이전에 작성 중이던 내용이 있습니다. 복원하시겠습니까?</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              복원하기
            </button>
            <button
              type="button"
              onClick={clearDraft}
              className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              삭제하기
            </button>
          </div>
        </div>
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

          {/* 독후감 설정 - 독서모임일 때만 표시 */}
          {form.type === 'BOOKCLUB' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 독후감 설정</h2>
              <p className="text-sm text-gray-600 mb-4">
                참가자들이 작성할 독후감의 구조를 선택해주세요. 책의 성격에 맞는 구조를 선택하면 더 깊이 있는 독후감을 작성할 수 있습니다.
              </p>

              <ReportStructureSelector
                value={form.reportStructure}
                onChange={(code) => setForm({ ...form, reportStructure: code })}
                showPreview={true}
              />

              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 독후감 구조는 프로그램 시작 후에도 변경할 수 있습니다.
                </p>
              </div>
            </div>
          )}

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

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/programs"
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
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
