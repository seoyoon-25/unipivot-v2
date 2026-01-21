'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  Bell,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react'

interface ReminderStats {
  totalReminders: number
  uniqueRecipients: number
  lastSentAt: string | null
  byDay: Array<{
    daysBeforeDeadline: number
    sent: number
    failed: number
    total: number
  }>
}

interface Reminder {
  id: string
  daysBeforeDeadline: number
  sentAt: string
  channel: string
  status: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface SurveyInfo {
  id: string
  title: string
  reminderEnabled: boolean
  reminderDays: number[]
  lastReminderAt: string | null
  deadline: string
  targetCount: number
  responseCount: number
  program: {
    id: string
    title: string
  }
}

export default function SurveyRemindersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [survey, setSurvey] = useState<SurveyInfo | null>(null)
  const [stats, setStats] = useState<ReminderStats | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null)

  // 리마인더 설정 폼
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderDays, setReminderDays] = useState<number[]>([3, 1])

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/surveys/${id}/reminders`)
      if (res.ok) {
        const data = await res.json()
        setSurvey(data.survey)
        setStats(data.stats)
        setReminders(data.reminders)
        setReminderEnabled(data.survey.reminderEnabled)
        setReminderDays(data.survey.reminderDays)
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    if (!survey) return
    setUpdating(true)

    try {
      const res = await fetch(`/api/admin/programs/${survey.program.id}/survey`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: id,
          reminderEnabled,
          reminderDays,
        }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    } finally {
      setUpdating(false)
    }
  }

  const toggleDay = (day: number) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter((d) => d !== day))
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => b - a))
    }
  }

  const handleSendReminders = async () => {
    if (!survey) return
    if (!confirm('미응답자에게 리마인더를 즉시 발송하시겠습니까?')) return

    setSending(true)
    setSendResult(null)

    try {
      const res = await fetch(`/api/admin/surveys/${id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        setSendResult({ sent: data.sent, failed: data.failed })
        fetchData() // 목록 새로고침
      } else {
        const error = await res.json()
        alert(error.message || '리마인더 발송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to send reminders:', error)
      alert('리마인더 발송 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">조사를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const daysLeft = Math.ceil(
    (new Date(survey.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/surveys/${id}/results`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">리마인더 관리</h1>
            <p className="text-gray-600">{survey.title}</p>
          </div>
        </div>
        <Link
          href={`/admin/programs/${survey.program.id}/survey`}
          className="text-primary hover:text-primary-dark text-sm"
        >
          조사 상세로 이동
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 발송</p>
              <p className="text-xl font-bold">{stats?.totalReminders || 0}회</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">발송 대상</p>
              <p className="text-xl font-bold">{stats?.uniqueRecipients || 0}명</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">마감까지</p>
              <p className={`text-xl font-bold ${daysLeft <= 3 ? 'text-red-600' : ''}`}>
                {daysLeft > 0 ? `D-${daysLeft}` : '마감됨'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">미응답</p>
              <p className="text-xl font-bold text-orange-600">
                {survey.targetCount - survey.responseCount}명
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold">리마인더 설정</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">자동 발송</span>
              <button
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  reminderEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    reminderEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">발송 시점 (마감 N일 전)</p>
              <div className="flex flex-wrap gap-2">
                {[7, 5, 3, 2, 1].map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      reminderDays.includes(day)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    D-{day}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleUpdateSettings}
              disabled={updating}
              className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating && <RefreshCw className="w-4 h-4 animate-spin" />}
              설정 저장
            </button>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">미응답자에게 즉시 리마인더 발송</p>
              <button
                onClick={handleSendReminders}
                disabled={sending || daysLeft <= 0 || (survey.targetCount - survey.responseCount) === 0}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    발송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    리마인더 즉시 발송 ({survey.targetCount - survey.responseCount}명)
                  </>
                )}
              </button>
              {sendResult && (
                <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                  발송 완료: 성공 {sendResult.sent}건, 실패 {sendResult.failed}건
                </div>
              )}
            </div>
          </div>

          {survey.lastReminderAt && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                마지막 발송: {formatDate(survey.lastReminderAt)}
              </p>
            </div>
          )}
        </div>

        {/* Day Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">일별 발송 현황</h2>

          {stats && stats.byDay.length > 0 ? (
            <div className="space-y-4">
              {stats.byDay.map((dayStat) => (
                <div key={dayStat.daysBeforeDeadline} className="flex items-center gap-4">
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-primary">
                      D-{dayStat.daysBeforeDeadline}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-sm text-gray-600">
                        발송 {dayStat.total}건
                      </span>
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        성공 {dayStat.sent}
                      </span>
                      {dayStat.failed > 0 && (
                        <span className="flex items-center gap-1 text-sm text-red-600">
                          <XCircle className="w-3 h-3" />
                          실패 {dayStat.failed}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${dayStat.total > 0 ? (dayStat.sent / dayStat.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 발송된 리마인더가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Recent Reminders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">발송 내역</h2>
        </div>

        {reminders.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">발송된 리마인더가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    수신자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    발송 시점
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    발송일시
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    채널
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reminders.map((reminder) => (
                  <tr key={reminder.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {reminder.user.name || '이름 없음'}
                        </p>
                        <p className="text-sm text-gray-500">{reminder.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                        D-{reminder.daysBeforeDeadline}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(reminder.sentAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          reminder.channel === 'KAKAO'
                            ? 'bg-yellow-100 text-yellow-700'
                            : reminder.channel === 'SMS'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {reminder.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {reminder.status === 'SENT' ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          성공
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          실패
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
