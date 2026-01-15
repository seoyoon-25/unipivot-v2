'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Save,
  Share2,
  RotateCcw,
  Settings,
  Camera,
  Zap,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PreviewDevice {
  id: string
  name: string
  type: 'mobile' | 'tablet' | 'desktop'
  width: number
  height: number
  pixelRatio: number
  userAgent?: string
  isDefault: boolean
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

interface PreviewSession {
  id: string
  title: string
  description?: string
  sessionKey: string
  shareUrl?: string
  isPublic: boolean
  allowEdit: boolean
  viewCount: number
  updatedAt: string
}

interface PreviewEngineProps {
  sessionId?: string
  onSessionChange?: (session: PreviewSession) => void
  onDataChange?: (data: any) => void
}

export default function PreviewEngine({
  sessionId,
  onSessionChange,
  onDataChange
}: PreviewEngineProps) {
  const [session, setSession] = useState<PreviewSession | null>(null)
  const [snapshots, setSnapshots] = useState<PreviewSnapshot[]>([])
  const [devices, setDevices] = useState<PreviewDevice[]>([])
  const [currentDevice, setCurrentDevice] = useState<PreviewDevice | null>(null)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [currentSnapshot, setCurrentSnapshot] = useState<PreviewSnapshot | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const previewRef = useRef<HTMLIFrameElement>(null)
  const autoRefreshRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const { toast } = useToast()

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
  }, [sessionId])

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh && sessionId) {
      autoRefreshRef.current = setInterval(() => {
        loadPreviewData()
      }, refreshInterval)
    } else {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current)
      }
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, sessionId])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadSession(),
        loadDevices(),
        sessionId && loadSnapshots()
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast({
        title: "오류",
        description: "초기 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSession = async () => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/admin/preview/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        onSessionChange?.(data.session)
      }
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/admin/preview/devices?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices)

        // 기본 디바이스 설정
        const defaultDevice = data.devices.find((d: PreviewDevice) => d.isDefault) || data.devices[0]
        if (defaultDevice) {
          setCurrentDevice(defaultDevice)
        }
      }
    } catch (error) {
      console.error('Error loading devices:', error)
    }
  }

  const loadSnapshots = async () => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/admin/preview/snapshots?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSnapshots(data.snapshots)

        // 최신 스냅샷 설정
        if (data.snapshots.length > 0 && !currentSnapshot) {
          setCurrentSnapshot(data.snapshots[0])
          loadPreviewData(data.snapshots[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading snapshots:', error)
    }
  }

  const loadPreviewData = async (snapshotId?: string) => {
    if (!session?.sessionKey) return

    try {
      const url = `/api/preview/${session.sessionKey}${snapshotId ? `?snapshotId=${snapshotId}` : ''}`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setPreviewData(data.data)
        onDataChange?.(data.data)

        // iframe 새로고침
        if (previewRef.current) {
          updatePreviewFrame()
        }
      }
    } catch (error) {
      console.error('Error loading preview data:', error)
    }
  }

  const updatePreviewFrame = () => {
    if (!previewRef.current || !previewData || !currentDevice) return

    // 미리보기 HTML 생성
    const previewHtml = generatePreviewHtml()

    const blob = new Blob([previewHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    previewRef.current.src = url

    // 이전 URL 해제
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const generatePreviewHtml = (): string => {
    if (!previewData || !currentDevice) return '<html><body>Loading...</body></html>'

    // 실제 사이트 구조를 기반으로 HTML 생성
    return `
<!DOCTYPE html>
<html lang="ko" data-theme="${currentTheme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>미리보기 - ${session?.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${currentTheme === 'dark' ? '#0f172a' : '#ffffff'};
      color: ${currentTheme === 'dark' ? '#e2e8f0' : '#1e293b'};
    }
    .preview-container {
      width: 100%;
      min-height: 100vh;
      overflow-x: auto;
    }
    .sections-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 2rem;
    }
    .section {
      background: ${currentTheme === 'dark' ? '#1e293b' : '#f8fafc'};
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: ${currentTheme === 'dark' ? '#f1f5f9' : '#334155'};
    }
    .banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: #3b82f6;
      color: white;
      text-align: center;
      z-index: 1000;
    }
    .floating-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="preview-container">
    ${renderBanners()}
    ${renderSections()}
    ${renderFloatingButtons()}
  </div>
</body>
</html>`
  }

  const renderBanners = (): string => {
    if (!previewData.banners) return ''

    return previewData.banners.map((banner: any, index: number) => `
      <div class="banner" style="top: ${index * 60}px; background: ${banner.backgroundColor || '#3b82f6'}">
        <strong>${banner.title}</strong>
        ${banner.content ? `<span> - ${banner.content}</span>` : ''}
      </div>
    `).join('')
  }

  const renderSections = (): string => {
    if (!previewData.sections) return ''

    return `
      <div class="sections-container" style="margin-top: ${(previewData.banners?.length || 0) * 60}px;">
        ${previewData.sections.map((section: any) => `
          <div class="section">
            <h2>${section.sectionName}</h2>
            <p>${JSON.stringify(section.content, null, 2)}</p>
          </div>
        `).join('')}
      </div>
    `
  }

  const renderFloatingButtons = (): string => {
    if (!previewData.floatingButtons) return ''

    return previewData.floatingButtons.map((button: any, index: number) => `
      <button class="floating-button" style="
        bottom: ${20 + index * 80}px;
        background: ${button.color || '#10b981'};
      ">
        ${button.title}
      </button>
    `).join('')
  }

  const createSnapshot = async () => {
    if (!sessionId) return

    try {
      const response = await fetch('/api/admin/preview/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name: `스냅샷 ${new Date().toLocaleString('ko-KR')}`,
          dataType: 'full',
          device: currentDevice?.type || 'desktop',
          theme: currentTheme
        })
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "스냅샷이 생성되었습니다.",
        })
        loadSnapshots()
      }
    } catch (error) {
      console.error('Error creating snapshot:', error)
      toast({
        title: "오류",
        description: "스냅샷 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const sharePreview = () => {
    if (session?.shareUrl) {
      navigator.clipboard.writeText(session.shareUrl)
      toast({
        title: "성공",
        description: "미리보기 링크가 클립보드에 복사되었습니다.",
      })
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">미리보기 엔진을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{session?.title || '미리보기'}</h2>
            <Badge variant="secondary">
              <Eye className="w-3 h-3 mr-1" />
              {session?.viewCount || 0}회 조회
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* 자동 새로고침 */}
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">자동 새로고침</Label>
            </div>

            <Button variant="outline" size="sm" onClick={() => loadPreviewData()}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={createSnapshot}>
              <Camera className="w-4 h-4" />
              스냅샷
            </Button>

            <Button variant="outline" size="sm" onClick={sharePreview}>
              <Share2 className="w-4 h-4" />
              공유
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <Tabs defaultValue="device" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="device">디바이스</TabsTrigger>
              <TabsTrigger value="snapshots">스냅샷</TabsTrigger>
              <TabsTrigger value="settings">설정</TabsTrigger>
            </TabsList>

            <TabsContent value="device" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>디바이스 선택</Label>
                <Select
                  value={currentDevice?.id || ''}
                  onValueChange={(value) => {
                    const device = devices.find(d => d.id === value)
                    if (device) setCurrentDevice(device)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="디바이스를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map(device => (
                      <SelectItem key={device.id} value={device.id}>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.type)}
                          {device.name}
                          <span className="text-xs text-muted-foreground">
                            {device.width}×{device.height}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>테마</Label>
                <Select value={currentTheme} onValueChange={(value: 'light' | 'dark') => setCurrentTheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">라이트</SelectItem>
                    <SelectItem value="dark">다크</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentDevice && (
                <div className="space-y-2">
                  <Label>디바이스 정보</Label>
                  <div className="text-sm space-y-1">
                    <div>크기: {currentDevice.width}×{currentDevice.height}px</div>
                    <div>픽셀 비율: {currentDevice.pixelRatio}</div>
                    <div>타입: {currentDevice.type}</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="snapshots" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>스냅샷 목록</Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {snapshots.map(snapshot => (
                    <div
                      key={snapshot.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        currentSnapshot?.id === snapshot.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        setCurrentSnapshot(snapshot)
                        loadPreviewData(snapshot.id)
                      }}
                    >
                      <div className="font-medium text-sm">{snapshot.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(snapshot.createdAt).toLocaleString('ko-KR')}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{snapshot.dataType}</Badge>
                        <Badge variant="outline" className="text-xs">{snapshot.device}</Badge>
                        <Badge variant="outline" className="text-xs">{snapshot.theme}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>자동 새로고침 간격 (초)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={refreshInterval / 1000}
                  onChange={(e) => setRefreshInterval(Number(e.target.value) * 1000)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 미리보기 영역 */}
        <div className="flex-1 bg-muted">
          <div className="h-full flex items-center justify-center">
            {currentDevice ? (
              <div
                className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
                style={{
                  width: currentDevice.width,
                  height: currentDevice.height,
                  transform: `scale(${Math.min(0.8, 1200 / currentDevice.width, 800 / currentDevice.height)})`,
                  transformOrigin: 'center'
                }}
              >
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-0"
                  title="미리보기"
                  onLoad={updatePreviewFrame}
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                디바이스를 선택하세요
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}