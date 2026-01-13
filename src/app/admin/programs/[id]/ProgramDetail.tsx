'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Users, Calendar, MapPin, Check, X } from 'lucide-react'
import { updateProgram, updateRegistrationStatus } from '@/lib/actions/admin'
import { RichTextEditor } from '@/components/editor'

interface Program {
  id: string
  title: string
  type: string
  description: string | null
  content: string | null
  scheduleContent: string | null
  currentBookContent: string | null
  capacity: number
  fee: number
  location: string | null
  isOnline: boolean
  status: string
  startDate: Date | null
  endDate: Date | null
  sessions: Array<{ id: string; title: string; date: Date }>
  registrations: Array<{
    id: string
    status: string
    user: { id: string; name: string | null; email: string }
  }>
}

interface Props {
  program: Program
}

function formatDate(date: Date | null) {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export default function ProgramDetail({ program }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [updatingReg, setUpdatingReg] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: program.title,
    type: program.type,
    description: program.description || '',
    content: program.content || '',
    scheduleContent: program.scheduleContent || '',
    currentBookContent: program.currentBookContent || '',
    capacity: program.capacity,
    fee: program.fee,
    location: program.location || '',
    isOnline: program.isOnline,
    status: program.status,
    startDate: formatDate(program.startDate),
    endDate: formatDate(program.endDate)
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProgram(program.id, {
        ...form,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined
      })
      alert('저장되었습니다.')
      router.refresh()
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const approvedCount = program.registrations.filter(r => r.status === 'APPROVED').length
  const pendingCount = program.registrations.filter(r => r.status === 'PENDING').length

  const handleStatusChange = async (regId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingReg(regId)
    try {
      await updateRegistrationStatus(regId, status)
      router.refresh()
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setUpdatingReg(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/programs"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">프로그램 상세</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">프로그램 현황</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">참가자</span>
                <span className="font-bold text-primary">{approvedCount}/{program.capacity}명</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(100, (approvedCount / program.capacity) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">대기 중</span>
                <span className="text-yellow-600">{pendingCount}명</span>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">참가자 목록</h3>
            {program.registrations.length === 0 ? (
              <p className="text-gray-500 text-sm">아직 참가 신청이 없습니다.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {program.registrations.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{reg.user.name || '이름 없음'}</p>
                      <p className="text-xs text-gray-500 truncate">{reg.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {reg.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(reg.id, 'APPROVED')}
                            disabled={updatingReg === reg.id}
                            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            title="승인"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(reg.id, 'REJECTED')}
                            disabled={updatingReg === reg.id}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="거절"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded ${
                          reg.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                          reg.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {reg.status === 'APPROVED' ? '승인됨' :
                           reg.status === 'REJECTED' ? '거절됨' : '취소됨'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">프로그램 정보 수정</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">프로그램 제목</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">프로그램 유형</label>
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
                  <option value="DRAFT">준비중</option>
                  <option value="RECRUITING">모집중</option>
                  <option value="RECRUIT_CLOSED">모집마감</option>
                  <option value="ONGOING">진행중</option>
                  <option value="COMPLETED">완료</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">참가비 (원)</label>
                <input
                  type="number"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">장소</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOnline"
                  checked={form.isOnline}
                  onChange={(e) => setForm({ ...form, isOnline: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isOnline" className="text-sm text-gray-700">온라인 진행</label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">간단 설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">상세 내용</label>
                <RichTextEditor
                  content={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                  placeholder="프로그램 상세 내용을 입력하세요..."
                  minHeight="300px"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">일정 안내</label>
                <RichTextEditor
                  content={form.scheduleContent}
                  onChange={(html) => setForm({ ...form, scheduleContent: html })}
                  placeholder="일정 안내 내용을 입력하세요..."
                  minHeight="200px"
                />
              </div>

              {(program.type === 'BOOKCLUB') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">현재 진행 도서 안내</label>
                  <RichTextEditor
                    content={form.currentBookContent}
                    onChange={(html) => setForm({ ...form, currentBookContent: html })}
                    placeholder="현재 진행 중인 도서에 대한 안내를 입력하세요..."
                    minHeight="200px"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
