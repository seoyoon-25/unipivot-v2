'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Palette, Image, Type, Loader2, Check, RefreshCw } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

const FONT_OPTIONS = [
  { value: 'Pretendard', label: 'Pretendard' },
  { value: 'Noto Sans KR', label: 'Noto Sans KR' },
  { value: 'Spoqa Han Sans Neo', label: 'Spoqa Han Sans Neo' },
  { value: 'IBM Plex Sans KR', label: 'IBM Plex Sans KR' },
  { value: 'Nanum Gothic', label: '나눔고딕' },
  { value: 'Nanum Myeongjo', label: '나눔명조' },
]

export default function ThemeSettings({ settings }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [formData, setFormData] = useState(settings)

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (key: string) => {
    setIsSaving(true)
    setSavedKey(null)
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: formData[key] }),
      })
      if (res.ok) {
        setSavedKey(key)
        router.refresh()
        setTimeout(() => setSavedKey(null), 2000)
      }
    } catch (error) {
      console.error('Error saving setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const entries = Object.entries(formData)
      for (const [key, value] of entries) {
        await fetch('/api/admin/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      }
      router.refresh()
      alert('모든 설정이 저장되었습니다.')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const ColorInput = ({ label, settingKey }: { label: string; settingKey: string }) => (
    <div className="flex items-center gap-4">
      <label className="w-32 text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3 flex-1">
        <input
          type="color"
          value={formData[settingKey]}
          onChange={(e) => handleChange(settingKey, e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={formData[settingKey]}
          onChange={(e) => handleChange(settingKey, e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
          placeholder="#000000"
        />
        <button
          onClick={() => handleSave(settingKey)}
          disabled={isSaving}
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
        >
          {savedKey === settingKey ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )

  const ImageInput = ({ label, settingKey }: { label: string; settingKey: string }) => (
    <div className="flex items-start gap-4">
      <label className="w-32 text-sm font-medium text-gray-700 pt-2">{label}</label>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="url"
            value={formData[settingKey]}
            onChange={(e) => handleChange(settingKey, e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="https://..."
          />
          <button
            onClick={() => handleSave(settingKey)}
            disabled={isSaving}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {savedKey === settingKey ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </button>
        </div>
        {formData[settingKey] && (
          <img
            src={formData[settingKey]}
            alt={label}
            className="h-12 object-contain"
          />
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">테마 설정</h1>
            <p className="text-gray-500">사이트 색상, 로고, 폰트 설정</p>
          </div>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          전체 저장
        </button>
      </div>

      <div className="space-y-6">
        {/* Colors */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">색상</h2>
          </div>
          <div className="space-y-4">
            <ColorInput label="Primary" settingKey="theme.primaryColor" />
            <ColorInput label="Secondary" settingKey="theme.secondaryColor" />
            <ColorInput label="Accent" settingKey="theme.accentColor" />
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">미리보기</p>
            <div className="mt-3 flex gap-4">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: formData['theme.primaryColor'] }}
              >
                Primary
              </div>
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: formData['theme.secondaryColor'] }}
              >
                Secondary
              </div>
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: formData['theme.accentColor'] }}
              >
                Accent
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Image className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">이미지</h2>
          </div>
          <div className="space-y-5">
            <ImageInput label="로고" settingKey="theme.logo" />
            <ImageInput label="다크 로고" settingKey="theme.logoDark" />
            <ImageInput label="파비콘" settingKey="theme.favicon" />
          </div>
        </div>

        {/* Typography & Site Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Type className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">사이트 정보</h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-700">사이트명</label>
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  value={formData['theme.siteName']}
                  onChange={(e) => handleChange('theme.siteName', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="사이트 이름"
                />
                <button
                  onClick={() => handleSave('theme.siteName')}
                  disabled={isSaving}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savedKey === 'theme.siteName' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <label className="w-32 text-sm font-medium text-gray-700 pt-2">사이트 설명</label>
              <div className="flex items-start gap-3 flex-1">
                <textarea
                  value={formData['theme.siteDescription']}
                  onChange={(e) => handleChange('theme.siteDescription', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  rows={2}
                  placeholder="사이트 설명 (SEO용)"
                />
                <button
                  onClick={() => handleSave('theme.siteDescription')}
                  disabled={isSaving}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savedKey === 'theme.siteDescription' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-700">기본 폰트</label>
              <div className="flex items-center gap-3 flex-1">
                <select
                  value={formData['theme.fontFamily']}
                  onChange={(e) => handleChange('theme.fontFamily', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSave('theme.fontFamily')}
                  disabled={isSaving}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savedKey === 'theme.fontFamily' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
