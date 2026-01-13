'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Calendar,
  ClipboardCheck,
  Wallet,
  FileText,
  ChevronLeft,
  UserPlus,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  QrCode,
  Edit3,
  ExternalLink
} from 'lucide-react'
import { updateAttendance, createProgramSession } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface Program {
  id: string
  slug: string
  title: string
  type: string
  status: string
  capacity: number
  fee: number
  startDate: Date | null
  endDate: Date | null
}

interface Attendance {
  id: string
  status: string
  session: { id: string; sessionNo: number }
}

interface Participant {
  id: string
  userId: string
  status: string
  depositAmount: number
  depositStatus: string
  joinedAt: Date
  user: { id: string; name: string | null; email: string; phone: string | null; image: string | null }
  attendances: Attendance[]
  stats: { totalSessions: number; presentCount: number; attendanceRate: number; reportCount: number; reportRate: number }
}

interface Session {
  id: string
  sessionNo: number
  date: Date
  startTime: string | null
  endTime: string | null
  title: string | null
  bookTitle: string | null
  location: string | null
  qrCode: string | null
  status: string
  _count: { attendances: number; reports: number }
}

interface DepositSetting {
  id: string
  isEnabled: boolean
  totalSessions: number
  depositAmount: number
  conditionType: string
  attendanceRate: number
  reportRate: number | null
}

interface Props {
  program: Program
  participants: Participant[]
  sessions: Session[]
  depositSetting: DepositSetting | null
}

const tabs = [
  { id: 'overview', label: '개요', icon: FileText },
  { id: 'participants', label: '참가자', icon: Users },
  { id: 'sessions', label: '세션', icon: Calendar },
  { id: 'attendance', label: '출석', icon: ClipboardCheck },
  { id: 'deposit', label: '보증금', icon: Wallet },
]

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

const attendanceIcons: Record<string, { icon: typeof Check; color: string }> = {
  PRESENT: { icon: Check, color: 'text-green-600 bg-green-100' },
  ABSENT: { icon: X, color: 'text-red-600 bg-red-100' },
  LATE: { icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  EXCUSED: { icon: AlertCircle, color: 'text-blue-600 bg-blue-100' },
}

export default function ProgramDetailTabs({ program, participants, sessions, depositSetting }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    sessionNo: sessions.length + 1,
    date: '',
    startTime: '',
    endTime: '',
    title: '',
    bookTitle: '',
    location: '',
  })

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const handleAttendance = async (sessionId: string, participantId: string, status: string) => {
    await updateAttendance(sessionId, participantId, status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED')
    router.refresh()
  }

  const handleCreateSession = async () => {
    if (!sessionForm.date) {
      alert('날짜를 입력해주세요')
      return
    }
    await createProgramSession(program.id, {
      sessionNo: sessionForm.sessionNo,
      date: new Date(sessionForm.date),
      startTime: sessionForm.startTime || undefined,
      endTime: sessionForm.endTime || undefined,
      title: sessionForm.title || undefined,
      bookTitle: sessionForm.bookTitle || undefined,
      location: sessionForm.location || undefined,
    })
    setShowSessionModal(false)
    setSessionForm({
      sessionNo: sessions.length + 2,
      date: '',
      startTime: '',
      endTime: '',
      title: '',
      bookTitle: '',
      location: '',
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/programs"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${statusColors[program.status]}`}>
                {program.status === 'DRAFT' ? '준비중' :
                 program.status === 'OPEN' ? '모집중' :
                 program.status === 'CLOSED' ? '마감' : '종료'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {program.type} · 정원 {program.capacity}명 · 참가비 {formatCurrency(program.fee)}원
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/programs/${program.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            보기
          </Link>
          <Link
            href={`/programs/${program.slug}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            수정
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'participants' && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {participants.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">참가자</p>
                <p className="text-2xl font-bold text-gray-900">{participants.length}명</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">세션</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}회</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">기간</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(program.startDate)} ~ {formatDate(program.endDate)}
                </p>
              </div>
              {depositSetting?.isEnabled && (
                <div className="bg-blue-50 rounded-xl p-4 col-span-full">
                  <p className="text-sm text-blue-600 font-medium">보증금 설정</p>
                  <p className="text-gray-900 mt-1">
                    {formatCurrency(depositSetting.depositAmount)}원 ·
                    출석률 {depositSetting.attendanceRate}% 이상
                    {depositSetting.conditionType === 'ATTENDANCE_AND_REPORT' &&
                      ` + 독후감 ${depositSetting.reportRate}% 이상`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">참가자 목록</h3>
                <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark">
                  <UserPlus className="w-4 h-4" />
                  참가자 추가
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">출석률</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">독후감</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">보증금</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{p.user.name || '이름없음'}</p>
                          <p className="text-sm text-gray-500">{p.user.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{p.user.phone || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${p.stats.attendanceRate >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                            {p.stats.attendanceRate}%
                          </span>
                          <span className="text-gray-400 text-sm ml-1">
                            ({p.stats.presentCount}/{p.stats.totalSessions})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-gray-900">{p.stats.reportCount}</span>
                          <span className="text-gray-400 text-sm ml-1">
                            ({p.stats.reportRate}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-lg ${
                            p.depositStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                            p.depositStatus === 'RETURNED' ? 'bg-blue-100 text-blue-700' :
                            p.depositStatus === 'FORFEITED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {p.depositStatus === 'NONE' ? '-' :
                             p.depositStatus === 'UNPAID' ? '미납' :
                             p.depositStatus === 'PAID' ? '납부완료' :
                             p.depositStatus === 'RETURNED' ? '반환' : '몰수'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {participants.length === 0 && (
                  <p className="text-center text-gray-500 py-8">참가자가 없습니다</p>
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">세션 목록</h3>
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4" />
                  세션 추가
                </button>
              </div>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-bold">{session.sessionNo}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.title || `${session.sessionNo}회차`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(session.date)}
                          {session.startTime && ` ${session.startTime}`}
                          {session.location && ` · ${session.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        출석 {session._count.attendances}명 · 독후감 {session._count.reports}건
                      </div>
                      {session.qrCode && (
                        <button
                          onClick={() => alert(`QR: ${session.qrCode}`)}
                          className="p-2 hover:bg-gray-200 rounded-lg"
                          title="QR 코드 보기"
                        >
                          <QrCode className="w-5 h-5 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">세션이 없습니다</p>
                )}
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div>
              <div className="mb-4">
                <select
                  value={selectedSession || ''}
                  onChange={(e) => setSelectedSession(e.target.value || null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">세션 선택</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sessionNo}회차 - {formatDate(s.date)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSession ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">참가자</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">출석 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {participants.map((p) => {
                        const attendance = p.attendances?.find((a) => a.session?.id === selectedSession)
                        const currentStatus = attendance?.status || 'ABSENT'

                        return (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{p.user.name}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const).map((status) => {
                                  const { icon: Icon, color } = attendanceIcons[status]
                                  return (
                                    <button
                                      key={status}
                                      onClick={() => handleAttendance(selectedSession, p.id, status)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        currentStatus === status ? color : 'hover:bg-gray-100'
                                      }`}
                                      title={status === 'PRESENT' ? '출석' : status === 'LATE' ? '지각' : status === 'ABSENT' ? '결석' : '사유'}
                                    >
                                      <Icon className="w-5 h-5" />
                                    </button>
                                  )
                                })}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">세션을 선택해주세요</p>
              )}
            </div>
          )}

          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div>
              {depositSetting?.isEnabled ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">보증금</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(depositSetting.depositAmount)}원</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">총 세션</p>
                      <p className="text-xl font-bold text-gray-900">{depositSetting.totalSessions}회</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">출석 기준</p>
                      <p className="text-xl font-bold text-gray-900">{depositSetting.attendanceRate}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">독후감 기준</p>
                      <p className="text-xl font-bold text-gray-900">
                        {depositSetting.reportRate ? `${depositSetting.reportRate}%` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">참가자</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">출석률</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">독후감</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">환급 여부</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {participants.map((p) => {
                          const meetsAttendance = p.stats.attendanceRate >= depositSetting.attendanceRate
                          const meetsReport = !depositSetting.reportRate || p.stats.reportRate >= depositSetting.reportRate
                          const eligible = meetsAttendance && meetsReport

                          return (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{p.user.name}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={meetsAttendance ? 'text-green-600' : 'text-red-600'}>
                                  {p.stats.attendanceRate}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={meetsReport ? 'text-green-600' : 'text-red-600'}>
                                  {p.stats.reportRate}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {eligible ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-red-600 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 text-xs rounded-lg ${
                                  p.depositStatus === 'RETURNED' ? 'bg-green-100 text-green-700' :
                                  p.depositStatus === 'FORFEITED' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {p.depositStatus === 'RETURNED' ? '반환완료' :
                                   p.depositStatus === 'FORFEITED' ? '몰수' : '대기'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">보증금 설정이 없습니다</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">세션 추가</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">회차</label>
                  <input
                    type="number"
                    value={sessionForm.sessionNo}
                    onChange={(e) => setSessionForm({ ...sessionForm, sessionNo: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  placeholder="세션 제목"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">도서명</label>
                <input
                  type="text"
                  value={sessionForm.bookTitle}
                  onChange={(e) => setSessionForm({ ...sessionForm, bookTitle: e.target.value })}
                  placeholder="도서명 (독서모임의 경우)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
                <input
                  type="text"
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                  placeholder="장소"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCreateSession}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
