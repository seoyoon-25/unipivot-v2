'use client'

import { useState, useEffect } from 'react'
import { ImageUploader } from './sections/ImageUploader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Loader2, Save, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'

interface LogoEditorProps {
  compact?: boolean
  defaultExpanded?: boolean
}

export function LogoEditor({ compact = false, defaultExpanded = true }: LogoEditorProps) {
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(defaultExpanded)

  // 로고 설정 로드
  useEffect(() => {
    async function loadLogoSettings() {
      try {
        const res = await fetch('/api/admin/theme')
        if (res.ok) {
          const settings = await res.json()
          settings.forEach((setting: { key: string; value: string }) => {
            if (setting.key === 'theme.logo') setLogoUrl(setting.value || '')
            if (setting.key === 'theme.favicon') setFaviconUrl(setting.value || '')
          })
        }
      } catch (error) {
        console.error('Error loading logo settings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadLogoSettings()
  }, [])

  // 로고 설정 저장
  const handleSaveLogo = async () => {
    setSaving(true)
    try {
      const settings = {
        'theme.logo': logoUrl,
        'theme.favicon': faviconUrl,
      }

      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (res.ok) {
        toast({
          title: '저장 완료',
          description: '로고 설정이 저장되었습니다. 새로고침 후 적용됩니다.',
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving logo settings:', error)
      toast({
        title: '오류',
        description: '로고 설정 저장에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">로고 & 브랜딩</CardTitle>
                <CardDescription className="text-sm">
                  사이트 로고와 파비콘을 관리합니다
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploader
                    label="사이트 로고"
                    description="헤더와 관리자 페이지에 표시 (권장: PNG 투명배경)"
                    value={logoUrl}
                    onChange={setLogoUrl}
                    aspectRatio="auto"
                    skipOptimize={true}
                  />
                  <ImageUploader
                    label="파비콘"
                    description="브라우저 탭 아이콘 (32x32px)"
                    value={faviconUrl}
                    onChange={setFaviconUrl}
                    aspectRatio="square"
                    skipOptimize={true}
                  />
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">미리보기</p>
                  <div className="border rounded-lg overflow-hidden">
                    {/* 헤더 미리보기 */}
                    <div className="p-4 flex items-center gap-8 bg-white border-b border-gray-200">
                      <div className="flex items-center">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-10 w-auto object-contain"
                          />
                        ) : (
                          <div className="h-10 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                            로고 없음
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>소개</span>
                        <span>프로그램</span>
                        <span>소통마당</span>
                      </div>
                    </div>
                    {/* 관리자 사이드바 미리보기 */}
                    <div className="p-4 bg-gray-900">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-8 w-auto object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">U</span>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-gray-400">Admin Panel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button type="button" onClick={handleSaveLogo} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    저장
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  // Full version (for design page)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              로고 & 브랜딩
            </CardTitle>
            <CardDescription>
              사이트 로고와 파비콘을 관리합니다. 로고는 헤더와 관리자 사이드바에 모두 적용됩니다.
            </CardDescription>
          </div>
          <Button type="button" onClick={handleSaveLogo} disabled={saving || loading}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            저장
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                label="사이트 로고"
                description="헤더와 관리자 페이지에 표시되는 로고입니다. PNG 투명 배경 권장. 권장 크기: 200x60px"
                value={logoUrl}
                onChange={setLogoUrl}
                aspectRatio="auto"
                skipOptimize={true}
              />
              <ImageUploader
                label="파비콘"
                description="브라우저 탭에 표시되는 아이콘입니다. 권장 크기: 32x32px"
                value={faviconUrl}
                onChange={setFaviconUrl}
                aspectRatio="square"
                skipOptimize={true}
              />
            </div>

            {/* Preview */}
            <div className="mt-8">
              <p className="text-sm font-medium mb-3">미리보기</p>
              <div className="border rounded-lg overflow-hidden">
                {/* 헤더 미리보기 */}
                <div className="p-4 flex items-center gap-8 bg-white border-b border-gray-200">
                  <p className="text-xs text-gray-400 w-20">헤더</p>
                  <div className="flex items-center">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <div className="h-10 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                        로고 없음
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>소개</span>
                    <span>프로그램</span>
                    <span>소통마당</span>
                  </div>
                </div>
                {/* 관리자 사이드바 미리보기 */}
                <div className="p-4 bg-gray-900 flex items-center gap-4">
                  <p className="text-xs text-gray-500 w-20">관리자</p>
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">U</span>
                        </div>
                        <div>
                          <span className="font-bold text-white">UniPivot</span>
                        </div>
                      </>
                    )}
                    <span className="text-xs text-gray-400 ml-2">Admin Panel</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * 투명 배경 PNG 파일 권장 (흰색/검은색 배경 모두에서 잘 보이도록)
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
