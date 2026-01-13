'use client'

import { useState, useEffect } from 'react'
import { Type, Loader2, Check, RefreshCw } from 'lucide-react'
import { FontSelect } from '@/components/ui/FontSelect'
import { SiteFontPreview } from '@/components/ui/FontPreview'
import { loadMultipleFonts } from '@/lib/utils/font-loader'

interface FontSettings {
  primaryFont: string
  headingFont: string
  accentFont: string | null
  baseFontSize: number
  headingScale: number
}

export default function AdminFontsPage() {
  const [settings, setSettings] = useState<FontSettings>({
    primaryFont: 'pretendard',
    headingFont: 'pretendard',
    accentFont: null,
    baseFontSize: 16,
    headingScale: 1.25,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // 설정 로드
  useEffect(() => {
    fetch('/api/admin/settings/fonts')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data)
        // 폰트 미리 로드
        const fontIds = [data.primaryFont, data.headingFont, data.accentFont].filter(Boolean)
        loadMultipleFonts(fontIds)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // 설정 저장
  const handleSave = async () => {
    setIsSaving(true)
    setIsSaved(false)

    try {
      const res = await fetch('/api/admin/settings/fonts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (key: keyof FontSettings, value: string | number | null) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Type className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">폰트 설정</h1>
            <p className="text-gray-500">사이트 전체 폰트 스타일 설정</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSaved ? (
            <Check className="w-4 h-4" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isSaved ? '저장됨' : '저장하기'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 설정 패널 */}
        <div className="space-y-6">
          {/* 본문 폰트 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">본문 폰트</h3>
            <p className="text-sm text-gray-500 mb-4">
              본문, 메뉴, 버튼 등 일반 텍스트에 사용되는 폰트입니다.
            </p>
            <FontSelect
              value={settings.primaryFont}
              onChange={(v) => handleChange('primaryFont', v)}
              showPreview={true}
            />
          </div>

          {/* 제목 폰트 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">제목 폰트</h3>
            <p className="text-sm text-gray-500 mb-4">
              제목(H1~H6)에 사용되는 폰트입니다.
            </p>
            <FontSelect
              value={settings.headingFont}
              onChange={(v) => handleChange('headingFont', v)}
              showPreview={true}
            />
          </div>

          {/* 강조 폰트 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">강조 폰트 (선택)</h3>
            <p className="text-sm text-gray-500 mb-4">
              인용구, 특별 강조 등에 사용되는 폰트입니다. 선택하지 않으면 본문 폰트가
              사용됩니다.
            </p>
            <FontSelect
              value={settings.accentFont || ''}
              onChange={(v) => handleChange('accentFont', v || null)}
              showPreview={true}
              placeholder="선택하지 않음"
            />
            {settings.accentFont && (
              <button
                onClick={() => handleChange('accentFont', null)}
                className="mt-2 text-sm text-gray-500 hover:text-primary"
              >
                선택 해제
              </button>
            )}
          </div>

          {/* 글자 크기 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">글자 크기</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기본 글자 크기
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={12}
                    max={20}
                    value={settings.baseFontSize}
                    onChange={(e) => handleChange('baseFontSize', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="w-16 px-3 py-2 text-center bg-gray-100 rounded-lg text-sm font-medium">
                    {settings.baseFontSize}px
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>12px</span>
                  <span>16px (기본)</span>
                  <span>20px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 크기 비율
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1.1}
                    max={1.5}
                    step={0.05}
                    value={settings.headingScale}
                    onChange={(e) => handleChange('headingScale', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="w-16 px-3 py-2 text-center bg-gray-100 rounded-lg text-sm font-medium">
                    {settings.headingScale}x
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>1.1x</span>
                  <span>1.25x (기본)</span>
                  <span>1.5x</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 미리보기 패널 */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 미리보기</h3>
            <SiteFontPreview
              primaryFontId={settings.primaryFont}
              headingFontId={settings.headingFont}
              accentFontId={settings.accentFont}
              baseFontSize={settings.baseFontSize}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
