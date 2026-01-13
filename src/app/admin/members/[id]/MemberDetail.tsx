'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Mail, Phone, Calendar, BookOpen, Check, X, Wallet, FileText, Shield, History, ChevronUp, ChevronDown } from 'lucide-react'
import { updateMember, updateRegistrationStatus } from '@/lib/actions/admin'
import { GRADE_OPTIONS, getGradeInfo, GRADES } from '@/lib/constants/member-grades'

interface Participation {
  id: string
  status: string
  depositAmount: number
  depositStatus: string
  finalAttendanceRate: number | null
  finalReportRate: number | null
  returnAmount: number | null
  forfeitAmount: number | null
  settledAt: Date | null
  program: { id: string; title: string; type: string; startDate: Date | null; endDate: Date | null }
}

interface GradeHistory {
  id: string
  previousGrade: number
  newGrade: number
  previousRole: string
  newRole: string
  reason: string | null
  changedBy: string | null
  createdAt: Date
}

interface Member {
  id: string
  name: string | null
  email: string
  phone: string | null
  origin: string | null
  birthYear: number | null
  occupation: string | null
  bio: string | null
  points: number
  role: string
  grade: number
  gradeUpdatedAt: Date | null
  status: string
  createdAt: Date
  registrations: Array<{
    id: string
    status: string
    program: { id: string; title: string; type: string }
  }>
  donations: Array<{
    id: string
    amount: number
    status: string
    createdAt: Date
  }>
  programParticipants?: Participation[]
  gradeHistory?: GradeHistory[]
}

interface Props {
  member: Member
}

export default function MemberDetail({ member }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [updatingReg, setUpdatingReg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'grade' | 'programs' | 'deposits'>('info')
  const [form, setForm] = useState({
    name: member.name || '',
    phone: member.phone || '',
    origin: member.origin || '',
    status: member.status,
    role: member.role
  })

  // 등급 변경 관련 상태
  const [gradeForm, setGradeForm] = useState({
    newGrade: member.grade,
    reason: ''
  })
  const [savingGrade, setSavingGrade] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMember(member.id, form)
      alert('저장되었습니다.')
      router.refresh()
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const totalDonations = member.donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0)

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

  // 등급 변경 처리
  const handleGradeChange = async () => {
    if (gradeForm.newGrade === member.grade) {
      alert('현재와 동일한 등급입니다.')
      return
    }

    setSavingGrade(true)
    try {
      const res = await fetch(`/api/admin/members/${member.id}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeForm),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '등급 변경 실패')
      }

      alert('등급이 변경되었습니다.')
      setGradeForm({ ...gradeForm, reason: '' })
      router.refresh()
    } catch (error: any) {
      alert(error.message || '등급 변경 중 오류가 발생했습니다.')
    } finally {
      setSavingGrade(false)
    }
  }

  const currentGradeInfo = getGradeInfo(member.grade)

  return (
    <div>
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
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4">
                {member.name?.[0] || '?'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{member.name || '이름 없음'}</h2>
              <p className="text-gray-500">{member.email}</p>
              {/* 등급 배지 */}
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${currentGradeInfo.bgColor} ${currentGradeInfo.textColor}`}>
                  <Shield className="w-4 h-4" />
                  {currentGradeInfo.label}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>가입일: {new Date(member.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>참여 프로그램: {member.registrations.length}개</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <User className="w-4 h-4" />
                <span>포인트: {member.points.toLocaleString()}P</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">총 후원금</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(totalDonations)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="lg:col-span-2">
          {/* Tab Buttons */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex border-b border-gray-100">
              {[
                { key: 'info', label: '기본 정보', icon: User },
                { key: 'grade', label: '회원 등급', icon: Shield },
                { key: 'programs', label: '프로그램 이력', icon: BookOpen },
                { key: 'deposits', label: '보증금 이력', icon: Wallet }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
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
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">회원 정보 수정</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <input
                      type="email"
                      value={member.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">출신</label>
                    <select
                      value={form.origin}
                      onChange={(e) => setForm({ ...form, origin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">선택</option>
                      <option value="SOUTH">남한</option>
                      <option value="NORTH">북한</option>
                      <option value="OVERSEAS">해외</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="ACTIVE">활성</option>
                      <option value="INACTIVE">비활성</option>
                      <option value="BANNED">정지</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="USER">일반 회원</option>
                      <option value="ADMIN">관리자</option>
                      <option value="SUPER_ADMIN">최고 관리자</option>
                    </select>
                  </div>
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

              {/* Program Registrations */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">신청 현황</h3>
                {member.registrations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">신청한 프로그램이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {member.registrations.map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <Link href={`/admin/programs/${reg.program.id}`} className="font-medium text-gray-900 hover:text-primary">
                            {reg.program.title}
                          </Link>
                          <p className="text-sm text-gray-500">{reg.program.type}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
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
            </>
          )}

          {/* Grade Tab */}
          {activeTab === 'grade' && (
            <div className="space-y-6">
              {/* 현재 등급 정보 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">현재 등급</h3>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${currentGradeInfo.bgColor}`}>
                    <Shield className={`w-8 h-8 ${currentGradeInfo.textColor}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${currentGradeInfo.textColor}`}>
                      {currentGradeInfo.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentGradeInfo.description}
                    </p>
                    {member.gradeUpdatedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        마지막 변경: {new Date(member.gradeUpdatedAt).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 등급 변경 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">등급 변경</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">새 등급 선택</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {GRADE_OPTIONS.map((option) => {
                        const gradeInfo = getGradeInfo(option.value)
                        const isSelected = gradeForm.newGrade === option.value
                        const isCurrent = member.grade === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setGradeForm({ ...gradeForm, newGrade: option.value })}
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? `border-${gradeInfo.color}-500 ${gradeInfo.bgColor}`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {isCurrent && (
                              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-gray-900 text-white rounded-full">
                                현재
                              </span>
                            )}
                            <Shield className={`w-6 h-6 mx-auto mb-2 ${isSelected ? gradeInfo.textColor : 'text-gray-400'}`} />
                            <p className={`text-sm font-medium text-center ${isSelected ? gradeInfo.textColor : 'text-gray-600'}`}>
                              {option.label}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">변경 사유 (선택)</label>
                    <textarea
                      value={gradeForm.reason}
                      onChange={(e) => setGradeForm({ ...gradeForm, reason: e.target.value })}
                      placeholder="등급 변경 사유를 입력하세요..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>

                  {gradeForm.newGrade !== member.grade && (
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full ${getGradeInfo(member.grade).bgColor} ${getGradeInfo(member.grade).textColor} text-sm font-medium`}>
                          {getGradeInfo(member.grade).label}
                        </div>
                        <span className="text-gray-500">→</span>
                        <div className={`px-3 py-1 rounded-full ${getGradeInfo(gradeForm.newGrade).bgColor} ${getGradeInfo(gradeForm.newGrade).textColor} text-sm font-medium`}>
                          {getGradeInfo(gradeForm.newGrade).label}
                        </div>
                        {gradeForm.newGrade > member.grade ? (
                          <ChevronUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${gradeForm.newGrade > member.grade ? 'text-green-600' : 'text-red-600'}`}>
                          {gradeForm.newGrade > member.grade ? '승급' : '강등'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleGradeChange}
                      disabled={savingGrade || gradeForm.newGrade === member.grade}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {savingGrade ? '변경 중...' : '등급 변경'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 등급 변경 이력 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">등급 변경 이력</h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <History className="w-4 h-4" />
                    {showHistory ? '숨기기' : '펼치기'}
                  </button>
                </div>

                {(!member.gradeHistory || member.gradeHistory.length === 0) ? (
                  <p className="text-gray-500 text-center py-4">등급 변경 이력이 없습니다.</p>
                ) : showHistory ? (
                  <div className="space-y-3">
                    {member.gradeHistory.map((history) => (
                      <div key={history.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {history.newGrade > history.previousGrade ? (
                            <ChevronUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded ${getGradeInfo(history.previousGrade).bgColor} ${getGradeInfo(history.previousGrade).textColor}`}>
                              {getGradeInfo(history.previousGrade).label}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${getGradeInfo(history.newGrade).bgColor} ${getGradeInfo(history.newGrade).textColor}`}>
                              {getGradeInfo(history.newGrade).label}
                            </span>
                          </div>
                          {history.reason && (
                            <p className="text-sm text-gray-600">{history.reason}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(history.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">총 {member.gradeHistory.length}건의 변경 이력</p>
                )}
              </div>
            </div>
          )}

          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">프로그램 참여 이력</h3>
              {!member.programParticipants || member.programParticipants.length === 0 ? (
                <p className="text-gray-500 text-center py-8">참여한 프로그램이 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">프로그램</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">기간</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">출석률</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">독후감률</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {member.programParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link href={`/admin/programs/${p.program.id}`} className="font-medium text-gray-900 hover:text-primary">
                              {p.program.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {p.program.startDate && new Date(p.program.startDate).toLocaleDateString('ko-KR')}
                            {p.program.endDate && ` ~ ${new Date(p.program.endDate).toLocaleDateString('ko-KR')}`}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.finalAttendanceRate !== null ? (
                              <span className={p.finalAttendanceRate >= 80 ? 'text-green-600' : 'text-red-500'}>
                                {Math.round(p.finalAttendanceRate)}%
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.finalReportRate !== null ? (
                              <span className={p.finalReportRate >= 80 ? 'text-green-600' : 'text-red-500'}>
                                {Math.round(p.finalReportRate)}%
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs rounded ${
                              p.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                              p.status === 'DROPPED' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {p.status === 'COMPLETED' ? '완료' :
                               p.status === 'DROPPED' ? '중도하차' : '진행중'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Deposits Tab */}
          {activeTab === 'deposits' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">보증금 이력</h3>
              {!member.programParticipants || member.programParticipants.filter(p => p.depositAmount > 0).length === 0 ? (
                <p className="text-gray-500 text-center py-8">보증금 내역이 없습니다.</p>
              ) : (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">총 납부</p>
                      <p className="text-xl font-bold text-gray-900">
                        {member.programParticipants
                          .filter(p => p.depositAmount > 0)
                          .reduce((sum, p) => sum + p.depositAmount, 0)
                          .toLocaleString()}원
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600">총 반환</p>
                      <p className="text-xl font-bold text-green-600">
                        {member.programParticipants
                          .filter(p => p.returnAmount)
                          .reduce((sum, p) => sum + (p.returnAmount || 0), 0)
                          .toLocaleString()}원
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-600">총 몰수</p>
                      <p className="text-xl font-bold text-red-600">
                        {member.programParticipants
                          .filter(p => p.forfeitAmount)
                          .reduce((sum, p) => sum + (p.forfeitAmount || 0), 0)
                          .toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-4 py-3 text-left font-medium text-gray-500">프로그램</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-500">보증금</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-500">출석률</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-500">결과</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-500">금액</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">정산일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {member.programParticipants
                          .filter(p => p.depositAmount > 0)
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <Link href={`/admin/programs/${p.program.id}`} className="font-medium text-gray-900 hover:text-primary">
                                  {p.program.title}
                                </Link>
                              </td>
                              <td className="px-4 py-3 text-right">{p.depositAmount.toLocaleString()}원</td>
                              <td className="px-4 py-3 text-center">
                                {p.finalAttendanceRate !== null ? `${Math.round(p.finalAttendanceRate)}%` : '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  p.depositStatus === 'RETURNED' ? 'bg-green-100 text-green-600' :
                                  p.depositStatus === 'FORFEITED' ? 'bg-red-100 text-red-600' :
                                  p.depositStatus === 'PAID' ? 'bg-blue-100 text-blue-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {p.depositStatus === 'RETURNED' ? '반환' :
                                   p.depositStatus === 'FORFEITED' ? '몰수' :
                                   p.depositStatus === 'PAID' ? '납부' :
                                   p.depositStatus === 'CARRIED' ? '이월' : '미납'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {p.returnAmount ? (
                                  <span className="text-green-600">+{p.returnAmount.toLocaleString()}</span>
                                ) : p.forfeitAmount ? (
                                  <span className="text-red-600">-{p.forfeitAmount.toLocaleString()}</span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {p.settledAt ? new Date(p.settledAt).toLocaleDateString('ko-KR') : '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
