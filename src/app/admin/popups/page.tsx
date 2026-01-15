'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Play,
  Pause,
  BarChart3,
  Settings,
  Zap,
  Target,
  Palette
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PopupTemplate {
  id: string
  name: string
  category: string
  width: number
  height: number
  borderRadius: number
  backgroundColor: string
  borderColor: string
  textColor: string
  animation: string
  duration: number
  overlayColor: string
  isDefault: boolean
  _count: { popups: number }
}

interface Popup {
  id: string
  title: string
  content?: string
  trigger: string
  triggerValue?: string
  isActive: boolean
  priority: number
  impressionCount: number
  clickCount: number
  conversionCount: number
  dismissCount: number
  createdAt: string
  template?: {
    id: string
    name: string
    category: string
  }
  _count: {
    analytics: number
    dismissals: number
    interactions: number
  }
}

export default function PopupsAdminPage() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [templates, setTemplates] = useState<PopupTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTrigger, setFilterTrigger] = useState<string>('')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    templateId: '',
    trigger: 'pageload',
    triggerValue: '',
    triggerSelector: '',
    showOn: 'all',
    isActive: true,
    priority: 0,
    showCloseButton: true,
    closeOnOverlay: false,
    closeOnEscape: true,
    autoClose: false,
    autoCloseDelay: 5,
    primaryButton: {
      text: '확인',
      action: 'close',
      url: ''
    },
    secondaryButton: {
      text: '취소',
      action: 'close',
      url: ''
    }
  })

  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'modal',
    width: 600,
    height: 400,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    textColor: '#1e293b',
    animation: 'fade',
    duration: 300,
    overlayColor: 'rgba(0,0,0,0.5)',
    blurBackground: false,
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
        loadPopups(),
        loadTemplates()
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

  const loadPopups = async () => {
    try {
      const response = await fetch('/api/admin/popups')
      if (response.ok) {
        const data = await response.json()
        setPopups(data.popups || [])
      }
    } catch (error) {
      console.error('Error loading popups:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/popups/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const createPopup = async () => {
    try {
      const response = await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          primaryButton: createForm.primaryButton.text ? createForm.primaryButton : undefined,
          secondaryButton: createForm.secondaryButton.text ? createForm.secondaryButton : undefined
        })
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "팝업이 생성되었습니다.",
        })
        setShowCreateDialog(false)
        resetCreateForm()
        loadPopups()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '생성 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "팝업 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const createTemplate = async () => {
    try {
      const response = await fetch('/api/admin/popups/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "템플릿이 생성되었습니다.",
        })
        setShowTemplateDialog(false)
        resetTemplateForm()
        loadTemplates()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '생성 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "템플릿 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      title: '',
      content: '',
      templateId: '',
      trigger: 'pageload',
      triggerValue: '',
      triggerSelector: '',
      showOn: 'all',
      isActive: true,
      priority: 0,
      showCloseButton: true,
      closeOnOverlay: false,
      closeOnEscape: true,
      autoClose: false,
      autoCloseDelay: 5,
      primaryButton: {
        text: '확인',
        action: 'close',
        url: ''
      },
      secondaryButton: {
        text: '취소',
        action: 'close',
        url: ''
      }
    })
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'modal',
      width: 600,
      height: 400,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      textColor: '#1e293b',
      animation: 'fade',
      duration: 300,
      overlayColor: 'rgba(0,0,0,0.5)',
      blurBackground: false,
      isDefault: false
    })
  }

  const filteredPopups = popups.filter(popup => {
    const matchesSearch = searchTerm === '' ||
      popup.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTrigger = filterTrigger === '' || popup.trigger === filterTrigger

    const matchesActive = filterActive === null || popup.isActive === filterActive

    return matchesSearch && matchesTrigger && matchesActive
  })

  const getConversionRate = (popup: Popup) => {
    return popup.impressionCount > 0
      ? ((popup.conversionCount / popup.impressionCount) * 100).toFixed(1)
      : '0'
  }

  const getClickRate = (popup: Popup) => {
    return popup.impressionCount > 0
      ? ((popup.clickCount / popup.impressionCount) * 100).toFixed(1)
      : '0'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">팝업 관리 시스템을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">팝업 관리</h1>
          <p className="text-muted-foreground">사용자 참여도를 높이는 스마트 팝업을 관리하세요</p>
        </div>
        <Badge variant="secondary">Phase 6</Badge>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 팝업</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{popups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 팝업</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {popups.filter(p => p.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 노출수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {popups.reduce((sum, p) => sum + p.impressionCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전환수</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {popups.reduce((sum, p) => sum + p.conversionCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="popups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="popups">팝업 관리</TabsTrigger>
          <TabsTrigger value="templates">템플릿 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="popups">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>팝업 목록</CardTitle>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      새 팝업
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>새 팝업 생성</DialogTitle>
                      <DialogDescription>
                        새로운 팝업을 만들어 사용자 참여도를 높이세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">팝업 제목</Label>
                          <Input
                            id="title"
                            value={createForm.title}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="팝업 제목을 입력하세요"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template">템플릿</Label>
                          <Select
                            value={createForm.templateId}
                            onValueChange={(value) => setCreateForm(prev => ({ ...prev, templateId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="템플릿 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name} ({template.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">팝업 내용</Label>
                        <Textarea
                          id="content"
                          value={createForm.content}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="팝업 내용을 입력하세요 (HTML 가능)"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="trigger">트리거</Label>
                          <Select
                            value={createForm.trigger}
                            onValueChange={(value) => setCreateForm(prev => ({ ...prev, trigger: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pageload">페이지 로드</SelectItem>
                              <SelectItem value="scroll">스크롤</SelectItem>
                              <SelectItem value="time">시간</SelectItem>
                              <SelectItem value="exit">페이지 나가기</SelectItem>
                              <SelectItem value="click">클릭</SelectItem>
                              <SelectItem value="manual">수동</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="triggerValue">트리거 값</Label>
                          <Input
                            id="triggerValue"
                            value={createForm.triggerValue}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, triggerValue: e.target.value }))}
                            placeholder={
                              createForm.trigger === 'scroll' ? '스크롤 % (예: 50)' :
                              createForm.trigger === 'time' ? '시간 (초)' :
                              createForm.trigger === 'pageload' ? '지연 시간 (초)' : ''
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryText">주 버튼 텍스트</Label>
                          <Input
                            id="primaryText"
                            value={createForm.primaryButton.text}
                            onChange={(e) => setCreateForm(prev => ({
                              ...prev,
                              primaryButton: { ...prev.primaryButton, text: e.target.value }
                            }))}
                            placeholder="확인"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secondaryText">부 버튼 텍스트</Label>
                          <Input
                            id="secondaryText"
                            value={createForm.secondaryButton.text}
                            onChange={(e) => setCreateForm(prev => ({
                              ...prev,
                              secondaryButton: { ...prev.secondaryButton, text: e.target.value }
                            }))}
                            placeholder="취소"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={createForm.isActive}
                          onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="isActive">팝업 활성화</Label>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        취소
                      </Button>
                      <Button onClick={createPopup}>
                        팝업 생성
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="팝업 제목으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterTrigger} onValueChange={setFilterTrigger}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="트리거" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체</SelectItem>
                      <SelectItem value="pageload">페이지 로드</SelectItem>
                      <SelectItem value="scroll">스크롤</SelectItem>
                      <SelectItem value="time">시간</SelectItem>
                      <SelectItem value="exit">페이지 나가기</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant={filterActive === null ? "default" : "outline"}
                    onClick={() => setFilterActive(null)}
                  >
                    전체
                  </Button>
                  <Button
                    variant={filterActive === true ? "default" : "outline"}
                    onClick={() => setFilterActive(true)}
                  >
                    활성
                  </Button>
                  <Button
                    variant={filterActive === false ? "default" : "outline"}
                    onClick={() => setFilterActive(false)}
                  >
                    비활성
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredPopups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    팝업이 없습니다. 새 팝업을 만들어보세요.
                  </div>
                ) : (
                  filteredPopups.map(popup => (
                    <div key={popup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{popup.title}</h3>
                          <Badge variant={popup.isActive ? "default" : "secondary"}>
                            {popup.isActive ? "활성" : "비활성"}
                          </Badge>
                          <Badge variant="outline">{popup.trigger}</Badge>
                          {popup.template && (
                            <Badge variant="outline">{popup.template.name}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex gap-4">
                            <span>노출: {popup.impressionCount.toLocaleString()}회</span>
                            <span>클릭: {popup.clickCount.toLocaleString()}회 ({getClickRate(popup)}%)</span>
                            <span>전환: {popup.conversionCount.toLocaleString()}회 ({getConversionRate(popup)}%)</span>
                          </div>
                          <div>생성: {new Date(popup.createdAt).toLocaleString('ko-KR')}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>템플릿 관리</CardTitle>
                <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Palette className="w-4 h-4 mr-2" />
                      새 템플릿
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 템플릿 생성</DialogTitle>
                      <DialogDescription>
                        팝업 디자인 템플릿을 생성하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">템플릿 이름</Label>
                          <Input
                            id="templateName"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="템플릿 이름"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">카테고리</Label>
                          <Select
                            value={templateForm.category}
                            onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modal">모달</SelectItem>
                              <SelectItem value="slide">슬라이드</SelectItem>
                              <SelectItem value="overlay">오버레이</SelectItem>
                              <SelectItem value="notification">알림</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="width">너비 (px)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={templateForm.width}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, width: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">높이 (px)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={templateForm.height}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, height: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="backgroundColor">배경색</Label>
                          <Input
                            id="backgroundColor"
                            type="color"
                            value={templateForm.backgroundColor}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="borderColor">테두리색</Label>
                          <Input
                            id="borderColor"
                            type="color"
                            value={templateForm.borderColor}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, borderColor: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="textColor">텍스트색</Label>
                          <Input
                            id="textColor"
                            type="color"
                            value={templateForm.textColor}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, textColor: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isDefault"
                          checked={templateForm.isDefault}
                          onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isDefault: checked }))}
                        />
                        <Label htmlFor="isDefault">기본 템플릿으로 설정</Label>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                        취소
                      </Button>
                      <Button onClick={createTemplate}>
                        템플릿 생성
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                        {template.isDefault && (
                          <Badge className="ml-1">기본</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div
                      className="w-full h-16 border rounded mb-2"
                      style={{
                        backgroundColor: template.backgroundColor,
                        borderColor: template.borderColor,
                        borderRadius: `${template.borderRadius}px`
                      }}
                    />
                    <div className="text-sm text-muted-foreground">
                      <div>{template.width}×{template.height}px</div>
                      <div>사용: {template._count.popups}개 팝업</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}