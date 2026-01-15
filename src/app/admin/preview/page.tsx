'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Share2,
  Play,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import PreviewEngine from '@/components/preview/PreviewEngine'

interface PreviewSession {
  id: string
  title: string
  description?: string
  sessionKey: string
  shareUrl?: string
  isActive: boolean
  isPublic: boolean
  allowEdit: boolean
  expiresAt?: string
  viewCount: number
  createdAt: string
  updatedAt: string
  _count: {
    snapshots: number
    changes: number
  }
  snapshots: any[]
}

interface PreviewDevice {
  id: string
  name: string
  type: 'mobile' | 'tablet' | 'desktop'
  width: number
  height: number
  pixelRatio: number
  userAgent?: string
  isDefault: boolean
  isActive: boolean
}

export default function PreviewAdminPage() {
  const [sessions, setSessions] = useState<PreviewSession[]>([])
  const [devices, setDevices] = useState<PreviewDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeviceDialog, setShowDeviceDialog] = useState(false)
  const [view, setView] = useState<'list' | 'preview'>('list')

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    expiresAt: '',
    password: '',
    allowEdit: false,
    isPublic: false
  })

  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    width: 1920,
    height: 1080,
    pixelRatio: 1.0,
    userAgent: '',
    isDefault: false
  })

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadSessions(),
        loadDevices()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/admin/preview/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/admin/preview/devices')
      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices)
      }
    } catch (error) {
      console.error('Error loading devices:', error)
    }
  }

  const createSession = async () => {
    try {
      const response = await fetch('/api/admin/preview/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          expiresAt: createForm.expiresAt || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "성공",
          description: "미리보기 세션이 생성되었습니다.",
        })
        setShowCreateDialog(false)
        setCreateForm({
          title: '',
          description: '',
          expiresAt: '',
          password: '',
          allowEdit: false,
          isPublic: false
        })
        loadSessions()

        // 새로 생성된 세션으로 미리보기 모드 전환
        setSelectedSessionId(data.session.id)
        setView('preview')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      toast({
        title: "오류",
        description: "세션 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const createDevice = async () => {
    try {
      const response = await fetch('/api/admin/preview/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceForm)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "디바이스가 생성되었습니다.",
        })
        setShowDeviceDialog(false)
        setDeviceForm({
          name: '',
          type: 'desktop',
          width: 1920,
          height: 1080,
          pixelRatio: 1.0,
          userAgent: '',
          isDefault: false
        })
        loadDevices()
      }
    } catch (error) {
      console.error('Error creating device:', error)
      toast({
        title: "오류",
        description: "디바이스 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('이 미리보기 세션을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/preview/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "세션이 삭제되었습니다.",
        })
        loadSessions()
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      toast({
        title: "오류",
        description: "세션 삭제에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const shareSession = (session: PreviewSession) => {
    if (session.shareUrl) {
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
        <div className="text-lg">미리보기 시스템을 불러오는 중...</div>
      </div>
    )
  }

  if (view === 'preview' && selectedSessionId) {
    return (
      <div className="h-screen">
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setView('list')}
            >
              ← 목록으로 돌아가기
            </Button>
            <Badge variant="secondary">Phase 5 - 실시간 미리보기</Badge>
          </div>
        </div>
        <PreviewEngine sessionId={selectedSessionId} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">실시간 미리보기 관리</h1>
          <p className="text-muted-foreground">사이트 변경사항을 실시간으로 미리보고 공유하세요</p>
        </div>
        <Badge variant="secondary">Phase 5</Badge>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 세션</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 세션</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, s) => sum + s.viewCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록된 디바이스</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 미리보기 세션
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 미리보기 세션 생성</DialogTitle>
              <DialogDescription>
                새로운 미리보기 세션을 만들어 변경사항을 공유하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">세션 제목</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="미리보기 세션 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택사항)</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="세션에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">만료일 (선택사항)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={createForm.expiresAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">접근 비밀번호 (선택사항)</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={createForm.isPublic}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">공개 세션</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowEdit"
                  checked={createForm.allowEdit}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, allowEdit: checked }))}
                />
                <Label htmlFor="allowEdit">편집 허용</Label>
              </div>
              <Button onClick={createSession} className="w-full">
                세션 생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeviceDialog} onOpenChange={setShowDeviceDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              디바이스 관리
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 디바이스 추가</DialogTitle>
              <DialogDescription>
                미리보기용 디바이스를 추가하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">디바이스 이름</Label>
                <Input
                  id="device-name"
                  value={deviceForm.name}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: iPhone 14, Desktop HD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-type">디바이스 타입</Label>
                <Select
                  value={deviceForm.type}
                  onValueChange={(value: 'mobile' | 'tablet' | 'desktop') =>
                    setDeviceForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">모바일</SelectItem>
                    <SelectItem value="tablet">태블릿</SelectItem>
                    <SelectItem value="desktop">데스크톱</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="device-width">너비 (px)</Label>
                  <Input
                    id="device-width"
                    type="number"
                    value={deviceForm.width}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, width: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-height">높이 (px)</Label>
                  <Input
                    id="device-height"
                    type="number"
                    value={deviceForm.height}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, height: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="device-default"
                  checked={deviceForm.isDefault}
                  onCheckedChange={(checked) => setDeviceForm(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="device-default">기본 디바이스로 설정</Label>
              </div>
              <Button onClick={createDevice} className="w-full">
                디바이스 추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 세션 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>미리보기 세션 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                미리보기 세션이 없습니다. 새 세션을 만들어보세요.
              </div>
            ) : (
              sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{session.title}</h3>
                      <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? "활성" : "비활성"}
                      </Badge>
                      {session.isPublic && <Badge variant="outline">공개</Badge>}
                      {session.allowEdit && <Badge variant="outline">편집 가능</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{session.description}</div>
                      <div className="flex gap-4">
                        <span>조회: {session.viewCount}회</span>
                        <span>스냅샷: {session._count.snapshots}개</span>
                        <span>변경사항: {session._count.changes}개</span>
                        <span>생성: {new Date(session.createdAt).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSessionId(session.id)
                        setView('preview')
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareSession(session)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 디바이스 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>등록된 디바이스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(device => (
              <div key={device.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getDeviceIcon(device.type)}
                  <span className="font-medium">{device.name}</span>
                  {device.isDefault && <Badge variant="default" className="text-xs">기본</Badge>}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>{device.width}×{device.height}px</div>
                  <div>픽셀 비율: {device.pixelRatio}</div>
                  <div>타입: {device.type}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}