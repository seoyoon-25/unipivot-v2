'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, User, Mail, Phone, Calendar, MapPin, Building,
  BookOpen, Shield, History, ChevronUp, ChevronDown, Plus, Trash2,
  AlertCircle, CheckCircle, XCircle, FileText
} from 'lucide-react'
import {
  updateMember, changeMemberGrade, changeMemberStatus, addMemberNote, deleteMemberNote
} from '@/lib/actions/members'
import { MEMBER_GRADES, MEMBER_STATUS } from '@/lib/services/member-matching'

// Member 타입 (getMember 반환값 기반)
interface Member {
  id: string
  memberCode: string
  name: string
  birthYear: number | null
  birthDate: Date | null
  gender: string | null
  email: string | null
  phone: string | null
  kakaoId: string | null
  organization: string | null
  origin: string | null
  hometown: string | null
  residence: string | null
  grade: string
  status: string
  joinedAt: Date
  userId: string | null
  createdAt: Date
  updatedAt: Date
  stats: {
    id: string
    memberId: string
    totalPrograms: number
    totalSessions: number
    totalBooks: number
    totalAttended: number
    totalAbsent: number
    totalReports: number
    attendanceRate: number
    reportRate: number
    noShowCount: number
    lastParticipatedAt: Date | null
    updatedAt: Date
  } | null
  statusLogs: Array<{
    id: string
    memberId: string
    previousStatus: string | null
    previousGrade: string | null
    newStatus: string | null
    newGrade: string | null
    reason: string
    createdBy: string | null
    createdAt: Date
  }>
  notes: Array<{
    id: string
    memberId: string
    content: string
    createdBy: string | null
    createdAt: Date
    updatedAt: Date
  }>
  attendances: Array<{
    id: string
    sessionNumber: number
    sessionDate: Date | null
    attended: boolean
    reportSubmitted: boolean
    refundEligible: boolean
    program: {
      id: string
      title: string
      slug: string | null
    }
  }>
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
}

interface Props {
  member: Member
}

// 등급 배지
function GradeBadge({ grade, size = 'md' }: { grade: string; size?: 'sm' | 'md' | 'lg' }) {
  const info = MEMBER_GRADES[grade as keyof typeof MEMBER_GRADES]
  if (!info) return <span className="text-gray-500">{grade}</span>

  const colors: Record<string, string> = {
    STAFF: 'bg-purple-100 text-purple-700',
    VVIP: 'bg-indigo-100 text-indigo-700',
    VIP: 'bg-amber-100 text-amber-700',
    MEMBER: 'bg-gray-100 text-gray-600',
    NEW: 'bg-blue-100 text-blue-600',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded ${colors[grade] || 'bg-gray-100 text-gray-600'} ${sizes[size]}`}>
      {info.emoji} {info.label}
    </span>
  )
}

// 상태 배지
function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const info = MEMBER_STATUS[status as keyof typeof MEMBER_STATUS]
  if (!info) return <span className="text-gray-500">{status}</span>

  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    WATCH: 'bg-yellow-100 text-yellow-700',
    WARNING: 'bg-orange-100 text-orange-700',
    BLOCKED: 'bg-red-100 text-red-700',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded ${colors[status] || 'bg-gray-100 text-gray-600'} ${sizes[size]}`}>
      {info.emoji} {info.label}
    </span>
  )
}

export default function MemberDetail({ member }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'grade' | 'status' | 'attendance' | 'notes'>('info')
  const [saving, setSaving] = useState(false)

  // 기본 정보 폼
  const [form, setForm] = useState({
    name: member.name,
    email: member.email || '',
    phone: member.phone || '',
    birthYear: member.birthYear?.toString() || '',
    gender: member.gender || '',
    organization: member.organization || '',
    origin: member.origin || '',
    hometown: member.hometown || '',
    residence: member.residence || '',
  })

  // 등급 변경 폼
  const [gradeForm, setGradeForm] = useState({
    newGrade: member.grade,
    reason: '',
  })
  const [savingGrade, setSavingGrade] = useState(false)

  // 상태 변경 폼
  const [statusForm, setStatusForm] = useState({
    newStatus: member.status,
    reason: '',
  })
  const [savingStatus, setSavingStatus] = useState(false)

  // 메모 폼
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [deletingNote, setDeletingNote] = useState<string | null>(null)

  // 기본 정보 저장
  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMember({
        id: member.id,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
        gender: form.gender || undefined,
        organization: form.organization || undefined,
        origin: form.origin || undefined,
        hometown: form.hometown || undefined,
        residence: form.residence || undefined,
      })
      alert('저장되었습니다.')
      router.refresh()
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 등급 변경
  const handleGradeChange = async () => {
    if (gradeForm.newGrade === member.grade) {
      alert('현재와 동일한 등급입니다.')
      return
    }
    if (!gradeForm.reason.trim()) {
      alert('변경 사유를 입력해주세요.')
      return
    }

    setSavingGrade(true)
    try {
      await changeMemberGrade(member.id, gradeForm.newGrade, gradeForm.reason, 'ADMIN')
      alert('등급이 변경되었습니다.')
      setGradeForm({ ...gradeForm, reason: '' })
      router.refresh()
    } catch (error: any) {
      alert(error.message || '등급 변경 중 오류가 발생했습니다.')
    } finally {
      setSavingGrade(false)
    }
  }

  // 상태 변경
  const handleStatusChange = async () => {
    if (statusForm.newStatus === member.status) {
      alert('현재와 동일한 상태입니다.')
      return
    }
    if (!statusForm.reason.trim()) {
      alert('변경 사유를 입력해주세요.')
      return
    }

    setSavingStatus(true)
    try {
      await changeMemberStatus(member.id, statusForm.newStatus, statusForm.reason, 'ADMIN')
      alert('상태가 변경되었습니다.')
      setStatusForm({ ...statusForm, reason: '' })
      router.refresh()
    } catch (error: any) {
      alert(error.message || '상태 변경 중 오류가 발생했습니다.')
    } finally {
      setSavingStatus(false)
    }
  }

  // 메모 추가
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert('메모 내용을 입력해주세요.')
      return
    }

    setSavingNote(true)
    try {
      await addMemberNote(member.id, newNote, 'ADMIN')
      setNewNote('')
      router.refresh()
    } catch (error) {
      alert('메모 추가 중 오류가 발생했습니다.')
    } finally {
      setSavingNote(false)
    }
  }

  // 메모 삭제
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('이 메모를 삭제하시겠습니까?')) return

    setDeletingNote(noteId)
    try {
      await deleteMemberNote(noteId)
      router.refresh()
    } catch (error) {
      alert('메모 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingNote(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/members"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">회원 상세</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4">
                {member.name?.[0] || '?'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
              <p className="text-gray-500 font-mono">{member.memberCode}</p>

              {/* 등급 & 상태 */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <GradeBadge grade={member.grade} />
                <StatusBadge status={member.status} />
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-3 text-sm">
              {member.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.birthYear && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{member.birthYear}년생 ({new Date().getFullYear() - member.birthYear}세)</span>
                </div>
              )}
              {member.origin && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {member.origin === 'SOUTH' ? '남한' : member.origin === 'NORTH' ? '북한' : '해외'}
                    {member.hometown && ` - ${member.hometown}`}
                  </span>
                </div>
              )}
              {member.organization && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{member.organization}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>가입: {new Date(member.joinedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            {/* 웹사이트 계정 연동 */}
            {member.user && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">웹사이트 계정 연동됨</p>
                <div className="flex items-center gap-2">
                  {member.user.image && (
                    <img src={member.user.image} alt="" className="w-8 h-8 rounded-full" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{member.user.name}</p>
                    <p className="text-xs text-gray-500">{member.user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 통계 카드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">활동 통계</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-primary">{member.stats?.totalPrograms || 0}</p>
                <p className="text-xs text-gray-500">참여 프로그램</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-primary">
                  {member.stats?.attendanceRate ? `${Math.round(member.stats.attendanceRate)}%` : '-'}
                </p>
                <p className="text-xs text-gray-500">출석률</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-primary">{member.stats?.totalReports || 0}</p>
                <p className="text-xs text-gray-500">독후감</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className={`text-2xl font-bold ${(member.stats?.noShowCount || 0) > 0 ? 'text-red-500' : 'text-primary'}`}>
                  {member.stats?.noShowCount || 0}
                </p>
                <p className="text-xs text-gray-500">노쇼</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="lg:col-span-2">
          {/* Tab Buttons */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {[
                { key: 'info', label: '기본 정보', icon: User },
                { key: 'grade', label: '등급 관리', icon: Shield },
                { key: 'status', label: '상태 관리', icon: AlertCircle },
                { key: 'attendance', label: '출석 이력', icon: BookOpen },
                { key: 'notes', label: '메모', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">회원 정보 수정</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">출생연도</label>
                  <input
                    type="number"
                    value={form.birthYear}
                    onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                    placeholder="1990"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">선택</option>
                    <option value="MALE">남성</option>
                    <option value="FEMALE">여성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">출신</label>
                  <select
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">선택</option>
                    <option value="SOUTH">남한</option>
                    <option value="NORTH">북한</option>
                    <option value="OVERSEAS">해외</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">고향</label>
                  <input
                    type="text"
                    value={form.hometown}
                    onChange={(e) => setForm({ ...form, hometown: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">거주지</label>
                  <input
                    type="text"
                    value={form.residence}
                    onChange={(e) => setForm({ ...form, residence: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">소속</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          )}

          {/* Grade Tab */}
          {activeTab === 'grade' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">등급 변경</h3>

                {/* 현재 등급 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">현재 등급</p>
                  <GradeBadge grade={member.grade} size="lg" />
                </div>

                {/* 등급 선택 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">새 등급 선택</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(MEMBER_GRADES).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setGradeForm({ ...gradeForm, newGrade: key })}
                        className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                          gradeForm.newGrade === key
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${member.grade === key ? 'ring-2 ring-offset-2 ring-primary/30' : ''}`}
                      >
                        {member.grade === key && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-gray-900 text-white rounded-full">
                            현재
                          </span>
                        )}
                        <p className="text-2xl mb-1">{value.emoji}</p>
                        <p className="text-sm font-medium">{value.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 변경 사유 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">변경 사유 *</label>
                  <textarea
                    value={gradeForm.reason}
                    onChange={(e) => setGradeForm({ ...gradeForm, reason: e.target.value })}
                    placeholder="등급 변경 사유를 입력하세요..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                {gradeForm.newGrade !== member.grade && (
                  <div className="mb-6 p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <GradeBadge grade={member.grade} />
                      <span className="text-gray-500">→</span>
                      <GradeBadge grade={gradeForm.newGrade} />
                      {MEMBER_GRADES[gradeForm.newGrade as keyof typeof MEMBER_GRADES]?.priority <
                       MEMBER_GRADES[member.grade as keyof typeof MEMBER_GRADES]?.priority ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <ChevronUp className="w-4 h-4" /> 승급
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                          <ChevronDown className="w-4 h-4" /> 강등
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleGradeChange}
                    disabled={savingGrade || gradeForm.newGrade === member.grade || !gradeForm.reason.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {savingGrade ? '변경 중...' : '등급 변경'}
                  </button>
                </div>
              </div>

              {/* 등급 변경 이력 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">등급 변경 이력</h3>
                {member.statusLogs.filter(l => l.newGrade).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">등급 변경 이력이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {member.statusLogs.filter(l => l.newGrade).map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {log.previousGrade && <GradeBadge grade={log.previousGrade} size="sm" />}
                            <span className="text-gray-400">→</span>
                            {log.newGrade && <GradeBadge grade={log.newGrade} size="sm" />}
                          </div>
                          <p className="text-sm text-gray-600">{log.reason}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(log.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">상태 변경</h3>

                {/* 현재 상태 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">현재 상태</p>
                  <StatusBadge status={member.status} size="lg" />
                </div>

                {/* 상태 선택 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">새 상태 선택</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(MEMBER_STATUS).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatusForm({ ...statusForm, newStatus: key })}
                        className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                          statusForm.newStatus === key
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${member.status === key ? 'ring-2 ring-offset-2 ring-primary/30' : ''}`}
                      >
                        {member.status === key && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-gray-900 text-white rounded-full">
                            현재
                          </span>
                        )}
                        <p className="text-2xl mb-1">{value.emoji}</p>
                        <p className="text-sm font-medium">{value.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 변경 사유 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">변경 사유 *</label>
                  <textarea
                    value={statusForm.reason}
                    onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                    placeholder="상태 변경 사유를 입력하세요... (예: 노쇼 2회 발생)"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                {statusForm.newStatus !== member.status && (
                  <div className={`mb-6 p-4 rounded-xl ${
                    statusForm.newStatus === 'BLOCKED' ? 'bg-red-50' :
                    statusForm.newStatus === 'WARNING' ? 'bg-orange-50' :
                    statusForm.newStatus === 'WATCH' ? 'bg-yellow-50' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={member.status} />
                      <span className="text-gray-500">→</span>
                      <StatusBadge status={statusForm.newStatus} />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleStatusChange}
                    disabled={savingStatus || statusForm.newStatus === member.status || !statusForm.reason.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {savingStatus ? '변경 중...' : '상태 변경'}
                  </button>
                </div>
              </div>

              {/* 상태 변경 이력 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">상태 변경 이력</h3>
                {member.statusLogs.filter(l => l.newStatus).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">상태 변경 이력이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {member.statusLogs.filter(l => l.newStatus).map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {log.previousStatus && <StatusBadge status={log.previousStatus} size="sm" />}
                            <span className="text-gray-400">→</span>
                            {log.newStatus && <StatusBadge status={log.newStatus} size="sm" />}
                          </div>
                          <p className="text-sm text-gray-600">{log.reason}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(log.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">출석 이력</h3>
              {member.attendances.length === 0 ? (
                <p className="text-gray-500 text-center py-8">출석 기록이 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">프로그램</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">회차</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">날짜</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">출석</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">독후감</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">환급</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {member.attendances.map((att) => (
                        <tr key={att.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/programs/${att.program.id}`}
                              className="font-medium text-gray-900 hover:text-primary"
                            >
                              {att.program.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{att.sessionNumber}회</td>
                          <td className="px-4 py-3 text-center text-gray-500">
                            {att.sessionDate ? new Date(att.sessionDate).toLocaleDateString('ko-KR') : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {att.attended ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {att.reportSubmitted ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {att.refundEligible ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">관리자 메모</h3>

              {/* 새 메모 입력 */}
              <div className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="회원에 대한 메모를 입력하세요..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={savingNote || !newNote.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {savingNote ? '저장 중...' : '메모 추가'}
                  </button>
                </div>
              </div>

              {/* 메모 목록 */}
              {member.notes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">등록된 메모가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {member.notes.map((note) => (
                    <div key={note.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {note.createdBy && `${note.createdBy} · `}
                            {new Date(note.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deletingNote === note.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
