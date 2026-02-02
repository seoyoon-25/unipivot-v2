'use client'

import { useState, useTransition } from 'react'
import { updateNotificationSettings } from '@/app/club/notifications/actions'

interface NotificationSettingsData {
  sessionReminder: boolean
  newSession: boolean
  reportComment: boolean
  announcement: boolean
  reminderHoursBefore: number
  quietHoursStart: number
  quietHoursEnd: number
}

interface Props {
  initialSettings: NotificationSettingsData
}

export default function NotificationSettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState<NotificationSettingsData>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const toggleSetting = (key: keyof NotificationSettingsData) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateNotificationSettings(settings)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: '설정이 저장되었습니다.' })
      }
      setTimeout(() => setMessage(null), 3000)
    })
  }

  const toggleItems = [
    { key: 'sessionReminder' as const, label: '세션 리마인더', desc: '예정된 세션 전 알림을 받습니다.' },
    { key: 'newSession' as const, label: '새 세션 등록', desc: '참여 중인 프로그램에 새 세션이 등록되면 알림을 받습니다.' },
    { key: 'reportComment' as const, label: '독후감 댓글', desc: '내 독후감에 댓글이 달리면 알림을 받습니다.' },
    { key: 'announcement' as const, label: '공지사항', desc: '새 공지사항이 등록되면 알림을 받습니다.' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-900">알림 유형</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings[item.key] as boolean}
                onClick={() => toggleSetting(item.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  settings[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    settings[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-900">리마인더 설정</h3>
        </div>
        <div className="px-4 py-3">
          <label className="text-sm font-medium text-gray-700">세션 시작 전 알림 시간</label>
          <select
            value={settings.reminderHoursBefore}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, reminderHoursBefore: parseInt(e.target.value) }))
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value={1}>1시간 전</option>
            <option value={3}>3시간 전</option>
            <option value={6}>6시간 전</option>
            <option value={12}>12시간 전</option>
            <option value={24}>24시간 전</option>
            <option value={48}>48시간 전</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-900">방해 금지 시간</h3>
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">시작</label>
            <select
              value={settings.quietHoursStart}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, quietHoursStart: parseInt(e.target.value) }))
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
          <span className="text-gray-400 mt-5">~</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500">종료</label>
            <select
              value={settings.quietHoursEnd}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, quietHoursEnd: parseInt(e.target.value) }))
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '설정 저장'}
      </button>
    </div>
  )
}
