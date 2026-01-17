'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CardSettings {
  statusBadge: {
    size: 'sm' | 'md' | 'lg'
    rounded: 'full' | 'lg' | 'md'
  }
  modeBadge: {
    size: 'sm' | 'md' | 'lg'
    rounded: 'full' | 'lg' | 'md'
  }
}

const sizeOptions = [
  { value: 'sm', label: '작게' },
  { value: 'md', label: '보통' },
  { value: 'lg', label: '크게' },
]

const roundedOptions = [
  { value: 'full', label: '둥글게' },
  { value: 'lg', label: '약간 둥글게' },
  { value: 'md', label: '각지게' },
]

const getSizeClass = (size: string) => {
  switch (size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs'
    case 'md':
      return 'px-3 py-1 text-sm font-medium'
    case 'lg':
      return 'px-4 py-1.5 text-base font-semibold'
    default:
      return 'px-2 py-0.5 text-xs'
  }
}

const getRoundedClass = (rounded: string) => {
  switch (rounded) {
    case 'full':
      return 'rounded-full'
    case 'lg':
      return 'rounded-lg'
    case 'md':
      return 'rounded-md'
    default:
      return 'rounded-full'
  }
}

export default function CardSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<CardSettings>({
    statusBadge: { size: 'sm', rounded: 'full' },
    modeBadge: { size: 'sm', rounded: 'md' },
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      router.push('/admin')
      return
    }
    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/design/cards')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/design/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast({
          title: '저장 완료',
          description: '카드 설정이 저장되었습니다.',
        })
      } else {
        throw new Error('저장 실패')
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '설정 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/design" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">프로그램 카드 설정</h1>
            <p className="text-sm text-gray-500 mt-1">상태 배지와 진행방식 배지의 크기와 스타일을 설정합니다</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>

      <div className="space-y-8">
        {/* 상태 배지 설정 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">상태 배지</h2>
          <p className="text-sm text-gray-500 mb-6">모집중, 진행중, 완료 등 프로그램 상태를 나타내는 배지입니다.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">크기</label>
              <div className="flex gap-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({
                      ...settings,
                      statusBadge: { ...settings.statusBadge, size: option.value as any }
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.statusBadge.size === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">모서리</label>
              <div className="flex gap-2">
                {roundedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({
                      ...settings,
                      statusBadge: { ...settings.statusBadge, rounded: option.value as any }
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.statusBadge.rounded === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-3">미리보기</p>
            <div className="flex flex-wrap gap-3">
              <span className={`${getSizeClass(settings.statusBadge.size)} ${getRoundedClass(settings.statusBadge.rounded)} bg-green-500 text-white`}>
                모집중
              </span>
              <span className={`${getSizeClass(settings.statusBadge.size)} ${getRoundedClass(settings.statusBadge.rounded)} bg-blue-500 text-white`}>
                진행중
              </span>
              <span className={`${getSizeClass(settings.statusBadge.size)} ${getRoundedClass(settings.statusBadge.rounded)} bg-gray-400 text-white`}>
                완료
              </span>
              <span className={`${getSizeClass(settings.statusBadge.size)} ${getRoundedClass(settings.statusBadge.rounded)} bg-yellow-500 text-white`}>
                모집마감
              </span>
            </div>
          </div>
        </div>

        {/* 진행방식 배지 설정 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">진행방식 배지</h2>
          <p className="text-sm text-gray-500 mb-6">온라인/오프라인 진행방식을 나타내는 배지입니다.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">크기</label>
              <div className="flex gap-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({
                      ...settings,
                      modeBadge: { ...settings.modeBadge, size: option.value as any }
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.modeBadge.size === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">모서리</label>
              <div className="flex gap-2">
                {roundedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({
                      ...settings,
                      modeBadge: { ...settings.modeBadge, rounded: option.value as any }
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.modeBadge.rounded === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-3">미리보기</p>
            <div className="flex flex-wrap gap-3">
              <span className={`${getSizeClass(settings.modeBadge.size)} ${getRoundedClass(settings.modeBadge.rounded)} bg-orange-100 text-orange-700`}>
                오프라인
              </span>
              <span className={`${getSizeClass(settings.modeBadge.size)} ${getRoundedClass(settings.modeBadge.rounded)} bg-blue-100 text-blue-700`}>
                온라인
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
