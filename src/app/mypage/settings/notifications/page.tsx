'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface NotificationSettings {
  oneWeekEnabled: boolean
  facilitatorEnabled: boolean
  rsvpEnabled: boolean
  reportEnabled: boolean
  quietHoursStart: number
  quietHoursEnd: number
}

export default function NotificationsSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<NotificationSettings>({
    oneWeekEnabled: true,
    facilitatorEnabled: true,
    rsvpEnabled: true,
    reportEnabled: true,
    quietHoursStart: 22,
    quietHoursEnd: 8
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/notifications')
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setSettings(data)
          }
        }
      } catch (error) {
        console.error('알림 설정 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchSettings()
    }
  }, [session?.user?.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('알림 설정이 저장되었습니다.')
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('알림 설정 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">알림 설정</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>모임 알림</CardTitle>
            <CardDescription>모임 관련 알림을 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="oneWeek">1주 전 알림</Label>
                <p className="text-sm text-gray-500">
                  모임 1주 전에 알림을 받습니다
                </p>
              </div>
              <Switch
                id="oneWeek"
                checked={settings.oneWeekEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, oneWeekEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="facilitator">진행자 알림</Label>
                <p className="text-sm text-gray-500">
                  진행자로 지정되면 알림을 받습니다
                </p>
              </div>
              <Switch
                id="facilitator"
                checked={settings.facilitatorEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, facilitatorEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rsvp">RSVP 알림</Label>
                <p className="text-sm text-gray-500">
                  참석 여부 응답 요청 알림을 받습니다
                </p>
              </div>
              <Switch
                id="rsvp"
                checked={settings.rsvpEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, rsvpEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="report">독후감 마감 알림</Label>
                <p className="text-sm text-gray-500">
                  독후감 제출 마감 전에 알림을 받습니다
                </p>
              </div>
              <Switch
                id="report"
                checked={settings.reportEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reportEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>방해 금지 시간</CardTitle>
            <CardDescription>이 시간 동안에는 알림을 받지 않습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작 시간</Label>
                <Select
                  value={settings.quietHoursStart.toString()}
                  onValueChange={(value) =>
                    setSettings({ ...settings, quietHoursStart: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>종료 시간</Label>
                <Select
                  value={settings.quietHoursEnd.toString()}
                  onValueChange={(value) =>
                    setSettings({ ...settings, quietHoursEnd: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              현재 설정: {settings.quietHoursStart.toString().padStart(2, '0')}:00 ~ {settings.quietHoursEnd.toString().padStart(2, '0')}:00
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}
