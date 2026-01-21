'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Type,
  Save,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  KOREAN_FONTS,
  FONT_CATEGORIES,
  DEFAULT_PRIMARY_FONT,
  DEFAULT_HEADING_FONT,
} from '@/lib/constants/korean-fonts'

interface FontSettings {
  primaryFont: string
  headingFont: string
  accentFont: string | null
  baseFontSize: number
  headingScale: number
}

export default function FontSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<FontSettings>({
    primaryFont: DEFAULT_PRIMARY_FONT,
    headingFont: DEFAULT_HEADING_FONT,
    accentFont: null,
    baseFontSize: 16,
    headingScale: 1.25,
  })
  const [savedMessage, setSavedMessage] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/fonts')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load font settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/fonts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setSavedMessage(true)
        setTimeout(() => setSavedMessage(false), 3000)
      } else {
        const error = await res.json()
        alert(error.message || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to save font settings:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleFontChange = (field: 'primaryFont' | 'headingFont' | 'accentFont', fontId: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: fontId || null,
    }))
  }

  const filteredFonts = selectedCategory === '전체'
    ? KOREAN_FONTS
    : KOREAN_FONTS.filter(f => f.category === selectedCategory)

  const selectedPrimaryFont = KOREAN_FONTS.find(f => f.id === settings.primaryFont)
  const selectedHeadingFont = KOREAN_FONTS.find(f => f.id === settings.headingFont)
  const selectedAccentFont = settings.accentFont ? KOREAN_FONTS.find(f => f.id === settings.accentFont) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Type className="w-7 h-7" />
              폰트 설정
            </h1>
            <p className="text-gray-500 text-sm mt-1">사이트 전체에 적용될 폰트를 설정합니다</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : savedMessage ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {savedMessage ? '저장됨' : saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 폰트 선택 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 본문 폰트 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">본문 폰트</h2>
            <p className="text-sm text-gray-500 mb-4">일반 텍스트에 사용되는 기본 폰트입니다.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {KOREAN_FONTS.filter(f => f.category === '고딕' || f.category === '명조').slice(0, 9).map(font => (
                <button
                  key={font.id}
                  onClick={() => handleFontChange('primaryFont', font.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    settings.primaryFont === font.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{font.nameKo}</span>
                    {font.recommended && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <span
                    className="text-sm text-gray-500 block"
                    style={{ fontFamily: font.cssFamily }}
                  >
                    {font.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 제목 폰트 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">제목 폰트</h2>
            <p className="text-sm text-gray-500 mb-4">h1, h2, h3 등 제목에 사용되는 폰트입니다.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {KOREAN_FONTS.filter(f => f.category === '고딕' || f.category === '디스플레이').slice(0, 9).map(font => (
                <button
                  key={font.id}
                  onClick={() => handleFontChange('headingFont', font.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    settings.headingFont === font.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{font.nameKo}</span>
                    {font.recommended && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <span
                    className="text-sm text-gray-500 block"
                    style={{ fontFamily: font.cssFamily }}
                  >
                    {font.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 강조 폰트 (선택) */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">강조 폰트 (선택)</h2>
            <p className="text-sm text-gray-500 mb-4">특별한 강조 텍스트에 사용할 폰트입니다. 설정하지 않으면 본문 폰트를 사용합니다.</p>

            <div className="mb-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('전체')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedCategory === '전체' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {FONT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedCategory === cat.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
              <button
                onClick={() => handleFontChange('accentFont', '')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  !settings.accentFont
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">사용 안함</span>
                <span className="text-sm text-gray-500 block">본문 폰트 사용</span>
              </button>
              {filteredFonts.map(font => (
                <button
                  key={font.id}
                  onClick={() => handleFontChange('accentFont', font.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    settings.accentFont === font.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{font.nameKo}</span>
                    {font.recommended && (
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  <span
                    className="text-xs text-gray-500 block"
                    style={{ fontFamily: font.cssFamily }}
                  >
                    {font.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 폰트 크기 설정 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">폰트 크기</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기본 폰트 크기 (px)
                </label>
                <input
                  type="number"
                  min={12}
                  max={20}
                  value={settings.baseFontSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, baseFontSize: parseInt(e.target.value) || 16 }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-gray-500 mt-1">기본값: 16px</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 크기 배율
                </label>
                <select
                  value={settings.headingScale}
                  onChange={(e) => setSettings(prev => ({ ...prev, headingScale: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value={1.125}>Minor Second (1.125)</option>
                  <option value={1.2}>Minor Third (1.2)</option>
                  <option value={1.25}>Major Third (1.25)</option>
                  <option value={1.333}>Perfect Fourth (1.333)</option>
                  <option value={1.414}>Augmented Fourth (1.414)</option>
                  <option value={1.5}>Perfect Fifth (1.5)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">기본값: Major Third (1.25)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">미리보기</h2>

            <div className="space-y-6">
              {/* 제목 미리보기 */}
              <div>
                <p className="text-xs text-gray-500 mb-2">제목 (h1)</p>
                <h1
                  className="text-2xl font-bold text-gray-900"
                  style={{
                    fontFamily: selectedHeadingFont?.cssFamily || 'sans-serif',
                    fontSize: `${settings.baseFontSize * Math.pow(settings.headingScale, 3)}px`,
                  }}
                >
                  유니피벗 독서모임
                </h1>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">부제목 (h2)</p>
                <h2
                  className="text-xl font-semibold text-gray-800"
                  style={{
                    fontFamily: selectedHeadingFont?.cssFamily || 'sans-serif',
                    fontSize: `${settings.baseFontSize * Math.pow(settings.headingScale, 2)}px`,
                  }}
                >
                  함께 성장하는 독서 커뮤니티
                </h2>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">본문</p>
                <p
                  className="text-gray-700 leading-relaxed"
                  style={{
                    fontFamily: selectedPrimaryFont?.cssFamily || 'sans-serif',
                    fontSize: `${settings.baseFontSize}px`,
                  }}
                >
                  책을 통해 세상을 바라보는 다양한 시각을 경험하고, 서로의 생각을 나누며 함께 성장합니다.
                </p>
              </div>

              {selectedAccentFont && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">강조 텍스트</p>
                  <p
                    className="text-lg text-primary font-medium"
                    style={{
                      fontFamily: selectedAccentFont?.cssFamily || 'sans-serif',
                    }}
                  >
                    "책은 마음의 양식"
                  </p>
                </div>
              )}

              {/* 현재 설정 요약 */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">현재 설정</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">본문:</span>
                    <span className="font-medium">{selectedPrimaryFont?.nameKo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">제목:</span>
                    <span className="font-medium">{selectedHeadingFont?.nameKo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">강조:</span>
                    <span className="font-medium">{selectedAccentFont?.nameKo || '사용 안함'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">기본 크기:</span>
                    <span className="font-medium">{settings.baseFontSize}px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
