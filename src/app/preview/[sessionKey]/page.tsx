'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  Lock,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PreviewSession {
  id: string
  title: string
  description?: string
  isPublic: boolean
  allowEdit: boolean
  viewCount: number
  updatedAt: string
}

interface PreviewSnapshot {
  id: string
  name: string
  description?: string
  dataType: string
  device: string
  theme: string
  createdAt: string
}

interface PreviewData {
  session: PreviewSession
  snapshot: PreviewSnapshot
  data: any
  snapshots: PreviewSnapshot[]
}

interface PreviewPageProps {
  params: { sessionKey: string }
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { sessionKey } = params

  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('')
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light')

  const { toast } = useToast()

  useEffect(() => {
    loadPreviewData()
  }, [sessionKey])

  useEffect(() => {
    if (selectedSnapshot) {
      loadPreviewData(selectedSnapshot)
    }
  }, [selectedSnapshot])

  const loadPreviewData = async (snapshotId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const url = `/api/preview/${sessionKey}${snapshotId ? `?snapshotId=${snapshotId}` : ''}${password ? `${snapshotId ? '&' : '?'}password=${password}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setPreviewData(data)
        setRequiresPassword(false)

        // 초기 설정
        if (!selectedSnapshot && data.snapshots.length > 0) {
          setSelectedSnapshot(data.snapshots[0].id)
        }
        setSelectedDevice(data.snapshot.device)
        setSelectedTheme(data.snapshot.theme)
      } else {
        if (data.requiresPassword) {
          setRequiresPassword(true)
        } else {
          setError(data.error || '미리보기를 불러올 수 없습니다.')
        }
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const submitPassword = async () => {
    setPasswordSubmitting(true)
    try {
      await loadPreviewData()
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const renderPreview = () => {
    if (!previewData?.data) return null

    const { data } = previewData

    const deviceStyles = {
      mobile: { width: '375px', height: '812px' },
      tablet: { width: '768px', height: '1024px' },
      desktop: { width: '1200px', height: '800px' }
    }

    const currentStyles = deviceStyles[selectedDevice]

    return (
      <div className="flex justify-center items-center min-h-screen bg-muted p-4">
        <div
          className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{
            ...currentStyles,
            maxWidth: '90vw',
            maxHeight: '90vh',
            transform: 'scale(0.9)',
            transformOrigin: 'center'
          }}
        >
          <div
            className={`w-full h-full overflow-auto ${
              selectedTheme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'
            }`}
          >
            {/* 배너들 */}
            {data.banners && data.banners.length > 0 && (
              <div className="relative z-50">
                {data.banners.map((banner: any, index: number) => (
                  <div
                    key={banner.id}
                    className={`w-full p-4 text-center text-white ${
                      banner.position === 'BOTTOM' ? 'fixed bottom-0' : 'relative'
                    }`}
                    style={{
                      backgroundColor: banner.backgroundColor || '#3b82f6',
                      color: banner.textColor || '#ffffff',
                      top: banner.position === 'TOP' ? `${index * 60}px` : 'auto'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {banner.icon && <span className="text-lg">{banner.icon}</span>}
                      <span className="font-medium">{banner.title}</span>
                      {banner.content && <span> - {banner.content}</span>}
                    </div>
                    {banner.linkUrl && (
                      <a
                        href={banner.linkUrl}
                        target={banner.openInNewTab ? '_blank' : '_self'}
                        className="text-sm underline hover:no-underline ml-2"
                        rel={banner.openInNewTab ? 'noopener noreferrer' : undefined}
                      >
                        {banner.linkText || '자세히 보기'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 메인 콘텐츠 영역 */}
            <div
              className="min-h-full"
              style={{
                paddingTop: data.banners?.filter((b: any) => b.position === 'TOP').length * 60 || 0,
                paddingBottom: data.banners?.filter((b: any) => b.position === 'BOTTOM').length * 60 || 0
              }}
            >
              {/* 섹션들 */}
              {data.sections && data.sections.length > 0 && (
                <div className="space-y-8 p-6">
                  {data.sections.map((section: any) => (
                    <div
                      key={section.id}
                      className={`rounded-lg p-6 ${
                        selectedTheme === 'dark'
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-gray-50 border-gray-200'
                      } border`}
                    >
                      <h2 className="text-xl font-semibold mb-4">{section.sectionName}</h2>
                      <div className="space-y-4">
                        {section.content && typeof section.content === 'object' ? (
                          Object.entries(section.content).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <h3 className="text-sm font-medium uppercase tracking-wide opacity-70">
                                {key}
                              </h3>
                              <div className="text-sm">
                                {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 dark:text-gray-300">
                            {section.content || '콘텐츠가 설정되지 않았습니다.'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 플로팅 버튼들 */}
            {data.floatingButtons && data.floatingButtons.length > 0 && (
              <div className="fixed z-50">
                {data.floatingButtons.map((button: any, index: number) => {
                  const positions = {
                    BOTTOM_RIGHT: { bottom: 20 + index * 70, right: 20 },
                    BOTTOM_LEFT: { bottom: 20 + index * 70, left: 20 },
                    TOP_RIGHT: { top: 20 + index * 70, right: 20 },
                    TOP_LEFT: { top: 20 + index * 70, left: 20 }
                  }

                  const position = positions[button.position as keyof typeof positions] || positions.BOTTOM_RIGHT

                  return (
                    <button
                      key={button.id}
                      className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center text-white font-medium"
                      style={{
                        ...position,
                        position: 'fixed',
                        backgroundColor: button.color || '#10b981',
                        width: button.size === 'LARGE' ? '80px' : button.size === 'SMALL' ? '50px' : '60px',
                        height: button.size === 'LARGE' ? '80px' : button.size === 'SMALL' ? '50px' : '60px',
                        fontSize: button.size === 'LARGE' ? '14px' : button.size === 'SMALL' ? '10px' : '12px'
                      }}
                      onClick={() => {
                        if (button.linkUrl) {
                          window.open(button.linkUrl, button.openInNewTab ? '_blank' : '_self')
                        }
                      }}
                    >
                      {button.showLabel ? (
                        <span className="text-center px-2">{button.title}</span>
                      ) : (
                        button.icon || '●'
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 비밀번호 입력 다이얼로그
  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>비밀번호가 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    submitPassword()
                  }
                }}
              />
            </div>
            <Button
              onClick={submitPassword}
              className="w-full"
              disabled={passwordSubmitting || !password}
            >
              {passwordSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              미리보기 보기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <div>미리보기를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>미리보기를 불러올 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 메인 미리보기 화면
  return (
    <div className="min-h-screen bg-background">
      {/* 상단 제어판 */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-semibold">{previewData?.session.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {previewData?.session.description}
                </p>
              </div>
              <Badge variant="outline">
                <Eye className="w-3 h-3 mr-1" />
                {previewData?.session.viewCount}회 조회
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* 스냅샷 선택 */}
              <Select value={selectedSnapshot} onValueChange={setSelectedSnapshot}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="스냅샷 선택" />
                </SelectTrigger>
                <SelectContent>
                  {previewData?.snapshots.map(snapshot => (
                    <SelectItem key={snapshot.id} value={snapshot.id}>
                      <div className="flex items-center gap-2">
                        <span className="truncate">{snapshot.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {snapshot.device}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 디바이스 선택 */}
              <Select value={selectedDevice} onValueChange={(value: 'mobile' | 'tablet' | 'desktop') => setSelectedDevice(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      모바일
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center gap-2">
                      <Tablet className="w-4 h-4" />
                      태블릿
                    </div>
                  </SelectItem>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      데스크톱
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* 테마 선택 */}
              <Select value={selectedTheme} onValueChange={(value: 'light' | 'dark') => setSelectedTheme(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">라이트</SelectItem>
                  <SelectItem value="dark">다크</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 미리보기 영역 */}
      {renderPreview()}
    </div>
  )
}