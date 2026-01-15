'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Palette, Image, Type, Loader2, Check, RefreshCw, Moon, Sun, Upload, X, Sparkles } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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

// Preset themes
const PRESET_THEMES = [
  {
    name: '오렌지 (기본)',
    primary: '#F97316',
    secondary: '#10B981',
    accent: '#F59E0B',
  },
  {
    name: '블루',
    primary: '#3B82F6',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
  },
  {
    name: '그린',
    primary: '#10B981',
    secondary: '#14B8A6',
    accent: '#F59E0B',
  },
  {
    name: '퍼플',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    accent: '#F59E0B',
  },
  {
    name: '레드',
    primary: '#EF4444',
    secondary: '#F97316',
    accent: '#FBBF24',
  },
  {
    name: '다크 블루',
    primary: '#1E3A5F',
    secondary: '#3B82F6',
    accent: '#F59E0B',
  },
]

export default function ThemeSettings({ settings }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [formData, setFormData] = useState(settings)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = {
    logo: useRef<HTMLInputElement>(null),
    logoDark: useRef<HTMLInputElement>(null),
    favicon: useRef<HTMLInputElement>(null),
  }

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
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      toast({
        title: '오류',
        description: '저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: formData }),
      })
      if (res.ok) {
        router.refresh()
        toast({
          title: '성공',
          description: '모든 설정이 저장되었습니다.',
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: '오류',
        description: '저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setFormData((prev) => ({
      ...prev,
      'theme.primaryColor': preset.primary,
      'theme.secondaryColor': preset.secondary,
      'theme.accentColor': preset.accent,
    }))
    toast({
      title: '프리셋 적용',
      description: `${preset.name} 테마가 적용되었습니다. 저장 버튼을 눌러 반영하세요.`,
    })
  }

  const handleImageUpload = async (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '오류',
        description: '파일 크기는 5MB를 초과할 수 없습니다.',
        variant: 'destructive',
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: '오류',
        description: '이미지 파일만 업로드할 수 있습니다.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(key)

      const formDataObj = new FormData()
      formDataObj.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataObj,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      handleChange(key, data.url)

      toast({
        title: '성공',
        description: '이미지가 업로드되었습니다.',
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: '오류',
        description: '이미지 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setUploading(null)
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

  const ImageUploadInput = ({
    label,
    settingKey,
    description
  }: {
    label: string
    settingKey: string
    description?: string
  }) => {
    const refKey = settingKey.replace('theme.', '') as keyof typeof fileInputRefs
    const inputRef = fileInputRefs[refKey]

    return (
      <div className="flex items-start gap-4">
        <label className="w-32 text-sm font-medium text-gray-700 pt-2">{label}</label>
        <div className="flex-1 space-y-3">
          {/* Preview */}
          {formData[settingKey] && (
            <div className="relative inline-block">
              <img
                src={formData[settingKey]}
                alt={label}
                className="h-16 object-contain rounded-lg border"
              />
              <button
                onClick={() => handleChange(settingKey, '')}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload Button & URL Input */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => inputRef?.current?.click()}
              disabled={uploading === settingKey}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {uploading === settingKey ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              파일 업로드
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(settingKey, file)
              }}
              className="hidden"
            />
            <span className="text-gray-400">또는</span>
            <input
              type="url"
              value={formData[settingKey]}
              onChange={(e) => handleChange(settingKey, e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
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
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    )
  }

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
        {/* Preset Themes */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">프리셋 테마</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="flex gap-1 mb-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-primary">
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </div>

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
            <ImageUploadInput
              label="로고"
              settingKey="theme.logo"
              description="권장 크기: 200x50px, PNG 또는 SVG"
            />
            <ImageUploadInput
              label="다크 로고"
              settingKey="theme.logoDark"
              description="다크 모드용 로고 (밝은 색상)"
            />
            <ImageUploadInput
              label="파비콘"
              settingKey="theme.favicon"
              description="권장 크기: 32x32px 또는 64x64px"
            />
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

        {/* Dark Mode Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Moon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">다크 모드</h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-700">다크모드 지원</label>
              <div className="flex items-center gap-3 flex-1">
                <select
                  value={formData['theme.darkModeEnabled'] || 'false'}
                  onChange={(e) => handleChange('theme.darkModeEnabled', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="true">사용</option>
                  <option value="false">사용 안 함</option>
                </select>
                <button
                  onClick={() => handleSave('theme.darkModeEnabled')}
                  disabled={isSaving}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savedKey === 'theme.darkModeEnabled' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-700">기본 모드</label>
              <div className="flex items-center gap-3 flex-1">
                <select
                  value={formData['theme.darkModeDefault'] || 'light'}
                  onChange={(e) => handleChange('theme.darkModeDefault', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="light">라이트 모드</option>
                  <option value="dark">다크 모드</option>
                  <option value="system">시스템 설정 따름</option>
                </select>
                <button
                  onClick={() => handleSave('theme.darkModeDefault')}
                  disabled={isSaving}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savedKey === 'theme.darkModeDefault' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {formData['theme.darkModeEnabled'] === 'true' && (
              <>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-4">다크 모드 색상</p>
                  <div className="space-y-4">
                    <ColorInput label="배경색" settingKey="theme.darkBgColor" />
                    <ColorInput label="텍스트색" settingKey="theme.darkTextColor" />
                    <ColorInput label="Primary" settingKey="theme.darkPrimaryColor" />
                    <ColorInput label="Secondary" settingKey="theme.darkSecondaryColor" />
                    <ColorInput label="카드 배경" settingKey="theme.darkCardBgColor" />
                  </div>
                </div>

                {/* Dark Mode Preview */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-3">다크 모드 미리보기</p>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: formData['theme.darkBgColor'] || '#1a1a2e' }}
                  >
                    <div
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: formData['theme.darkCardBgColor'] || '#16213e' }}
                    >
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: formData['theme.darkTextColor'] || '#e2e8f0' }}
                      >
                        다크 모드 카드
                      </h3>
                      <p
                        className="text-sm mb-3"
                        style={{ color: formData['theme.darkTextColor'] || '#e2e8f0', opacity: 0.8 }}
                      >
                        다크 모드에서 카드가 이렇게 보입니다.
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 rounded text-sm text-white"
                          style={{ backgroundColor: formData['theme.darkPrimaryColor'] || '#60a5fa' }}
                        >
                          Primary
                        </button>
                        <button
                          className="px-3 py-1 rounded text-sm text-white"
                          style={{ backgroundColor: formData['theme.darkSecondaryColor'] || '#34d399' }}
                        >
                          Secondary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sun className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">라이트 모드 미리보기</h2>
          </div>
          <div className="border rounded-xl p-6 bg-gray-50">
            <div className="space-y-4">
              {/* Navbar Preview */}
              <div
                className="rounded-lg p-4 flex items-center justify-between"
                style={{ background: `linear-gradient(to right, ${formData['theme.primaryColor']}, ${adjustBrightness(formData['theme.primaryColor'], 10)})` }}
              >
                {formData['theme.logo'] ? (
                  <img src={formData['theme.logo']} alt="Logo" className="h-8" />
                ) : (
                  <span className="text-white font-bold">{formData['theme.siteName'] || '사이트명'}</span>
                )}
                <div className="flex gap-4 text-white/90 text-sm">
                  <span>메뉴 1</span>
                  <span>메뉴 2</span>
                  <span>메뉴 3</span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold" style={{ color: formData['theme.primaryColor'] }}>
                  제목 텍스트
                </h2>
                <p className="text-gray-600">
                  본문 텍스트입니다. 여기에 콘텐츠가 표시됩니다.
                </p>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: formData['theme.primaryColor'] }}
                  >
                    Primary 버튼
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: formData['theme.secondaryColor'] }}
                  >
                    Secondary 버튼
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: formData['theme.accentColor'] }}
                  >
                    Accent 버튼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to adjust brightness
function adjustBrightness(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '')
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.min(255, Math.max(0, r + (percent / 100) * 255))
  g = Math.min(255, Math.max(0, g + (percent / 100) * 255))
  b = Math.min(255, Math.max(0, b + (percent / 100) * 255))

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}
