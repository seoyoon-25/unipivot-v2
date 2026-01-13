'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Check, AlertCircle, Mail, FileText, Database, Users } from 'lucide-react'

interface Setting {
  id: string
  key: string
  value: string
  description: string | null
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setSettingsMap(data.settingsMap)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
    setLoading(false)
  }

  function updateSetting(key: string, value: string) {
    setSettingsMap((prev) => ({ ...prev, [key]: value }))
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsMap }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">시스템 설정</h1>
        <p className="text-gray-600">사이트 전반적인 설정을 관리합니다</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/notifications/templates"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary transition-colors"
        >
          <Mail className="w-8 h-8 text-primary mb-2" />
          <h3 className="font-medium text-gray-900">알림 템플릿</h3>
          <p className="text-sm text-gray-500">메시지 템플릿 관리</p>
        </Link>
        <Link
          href="/admin/settings/admins"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary transition-colors"
        >
          <Users className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-medium text-gray-900">관리자 설정</h3>
          <p className="text-sm text-gray-500">관리자 권한 관리</p>
        </Link>
        <Link
          href="/admin/settings/backup"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary transition-colors"
        >
          <Database className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-medium text-gray-900">백업</h3>
          <p className="text-sm text-gray-500">데이터 백업 관리</p>
        </Link>
        <Link
          href="/admin/settings/migration"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary transition-colors"
        >
          <FileText className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-medium text-gray-900">마이그레이션</h3>
          <p className="text-sm text-gray-500">데이터 이전 도구</p>
        </Link>
      </div>

      <form onSubmit={saveSettings} className="max-w-3xl space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
            <Check className="w-5 h-5" />
            설정이 저장되었습니다.
          </div>
        )}

        {/* Bank Account Settings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">입금 계좌 정보</h2>
            <p className="text-sm text-gray-500 mt-1">
              합격 안내 및 보증금 안내 메시지에 사용되는 계좌 정보입니다
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  은행명
                </label>
                <input
                  type="text"
                  value={settingsMap.BANK_ACCOUNT_BANK || ''}
                  onChange={(e) => updateSetting('BANK_ACCOUNT_BANK', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="예: 국민은행"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호
                </label>
                <input
                  type="text"
                  value={settingsMap.BANK_ACCOUNT_NUMBER || ''}
                  onChange={(e) => updateSetting('BANK_ACCOUNT_NUMBER', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="예: 810101-04-352077"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예금주
              </label>
              <input
                type="text"
                value={settingsMap.BANK_ACCOUNT_HOLDER || ''}
                onChange={(e) => updateSetting('BANK_ACCOUNT_HOLDER', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="예: 유니피벗"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">미리보기:</div>
              <div className="font-medium">
                {settingsMap.BANK_ACCOUNT_BANK || '은행'} {settingsMap.BANK_ACCOUNT_NUMBER || '계좌번호'} (
                {settingsMap.BANK_ACCOUNT_HOLDER || '예금주'})
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">알림 설정</h2>
            <p className="text-sm text-gray-500 mt-1">자동 알림 발송 관련 설정</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                보증금 미입금 리마인더 발송일
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settingsMap.DEPOSIT_REMINDER_DAYS || '3'}
                  onChange={(e) =>
                    updateSetting('DEPOSIT_REMINDER_DAYS', e.target.value)
                  }
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  min="1"
                  max="7"
                />
                <span className="text-sm text-gray-600">일 후</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                합격 후 보증금 미입금 시 리마인더를 발송합니다
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신청 마감 임박 알림 발송일
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settingsMap.DEADLINE_REMINDER_DAYS || '3,1'}
                  onChange={(e) =>
                    updateSetting('DEADLINE_REMINDER_DAYS', e.target.value)
                  }
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="3,1"
                />
                <span className="text-sm text-gray-600">일 전 (콤마로 구분)</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                관심 표시한 사용자에게 마감 임박 알림을 발송합니다
              </p>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsMap.NEW_PROGRAM_NOTIFY_EMAIL === 'true'}
                  onChange={(e) =>
                    updateSetting(
                      'NEW_PROGRAM_NOTIFY_EMAIL',
                      e.target.checked ? 'true' : 'false'
                    )
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  새 프로그램 오픈 시 이메일 알림
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsMap.NEW_PROGRAM_NOTIFY_SMS === 'true'}
                  onChange={(e) =>
                    updateSetting(
                      'NEW_PROGRAM_NOTIFY_SMS',
                      e.target.checked ? 'true' : 'false'
                    )
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  새 프로그램 오픈 시 SMS 알림
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              설정 저장
            </>
          )}
        </button>
      </form>
    </div>
  )
}
