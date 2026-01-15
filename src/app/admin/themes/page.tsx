'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Trash2,
  Palette,
  Moon,
  Sun,
  Monitor,
  Eye,
  Users,
  Star,
  Settings,
  Copy,
  Check
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// 타입 정의
interface ThemeSettings {
  id: string
  name: string
  displayName: string
  description?: string
  primary: string
  secondary: string
  background: string
  surface: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  divider: string
  success: string
  warning: string
  error: string
  info: string
  accent: string
  accentForeground: string
  input: string
  inputBorder: string
  card: string
  cardBorder: string
  navBackground: string
  navText: string
  navHover: string
  sidebarBackground: string
  sidebarText: string
  sidebarHover: string
  footerBackground: string
  footerText: string
  customCss?: string
  isDefault: boolean
  isActive: boolean
  isSystemTheme: boolean
  autoApply: boolean
  autoApplyStart?: string
  autoApplyEnd?: string
  _count?: {
    userPreferences: number
  }
}

interface ThemeFormData {
  name: string
  displayName: string
  description: string
  primary: string
  secondary: string
  background: string
  surface: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  divider: string
  success: string
  warning: string
  error: string
  info: string
  accent: string
  accentForeground: string
  input: string
  inputBorder: string
  card: string
  cardBorder: string
  navBackground: string
  navText: string
  navHover: string
  sidebarBackground: string
  sidebarText: string
  sidebarHover: string
  footerBackground: string
  footerText: string
  customCss: string
  isDefault: boolean
  isActive: boolean
  autoApply: boolean
  autoApplyStart: string
  autoApplyEnd: string
}

export default function ThemesPage() {
  const { toast } = useToast()

  const [themes, setThemes] = useState<ThemeSettings[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<ThemeSettings | null>(null)
  const [previewTheme, setPreviewTheme] = useState<ThemeSettings | null>(null)

  // 폼 데이터
  const [formData, setFormData] = useState<ThemeFormData>({
    name: '',
    displayName: '',
    description: '',
    primary: '#2563eb',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    divider: '#f1f5f9',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    accent: '#8b5cf6',
    accentForeground: '#ffffff',
    input: '#ffffff',
    inputBorder: '#d1d5db',
    card: '#ffffff',
    cardBorder: '#e5e7eb',
    navBackground: '#ffffff',
    navText: '#374151',
    navHover: '#f3f4f6',
    sidebarBackground: '#f9fafb',
    sidebarText: '#374151',
    sidebarHover: '#f3f4f6',
    footerBackground: '#1f2937',
    footerText: '#d1d5db',
    customCss: '',
    isDefault: false,
    isActive: true,
    autoApply: false,
    autoApplyStart: '',
    autoApplyEnd: ''
  })

  // 테마 목록 로드
  const loadThemes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/themes?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setThemes(data.themes)
      } else {
        toast({
          title: "오류",
          description: "테마 목록을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading themes:', error)
      toast({
        title: "오류",
        description: "테마 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 테마 생성
  const handleCreateTheme = async () => {
    try {
      const response = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "테마가 생성되었습니다."
        })
        setShowCreateDialog(false)
        resetForm()
        loadThemes()
      } else {
        const error = await response.json()
        toast({
          title: "오류",
          description: error.error || "테마 생성에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating theme:', error)
      toast({
        title: "오류",
        description: "테마 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 테마 수정
  const handleEditTheme = async () => {
    if (!selectedTheme) return

    try {
      const response = await fetch(`/api/admin/themes/${selectedTheme.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "테마가 수정되었습니다."
        })
        setShowEditDialog(false)
        setSelectedTheme(null)
        resetForm()
        loadThemes()
      } else {
        const error = await response.json()
        toast({
          title: "오류",
          description: error.error || "테마 수정에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error editing theme:', error)
      toast({
        title: "오류",
        description: "테마 수정에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 테마 삭제
  const handleDeleteTheme = async () => {
    if (!selectedTheme) return

    try {
      const response = await fetch(`/api/admin/themes/${selectedTheme.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "테마가 삭제되었습니다."
        })
        setShowDeleteDialog(false)
        setSelectedTheme(null)
        loadThemes()
      } else {
        const error = await response.json()
        toast({
          title: "오류",
          description: error.error || "테마 삭제에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting theme:', error)
      toast({
        title: "오류",
        description: "테마 삭제에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      primary: '#2563eb',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      border: '#e2e8f0',
      divider: '#f1f5f9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      accent: '#8b5cf6',
      accentForeground: '#ffffff',
      input: '#ffffff',
      inputBorder: '#d1d5db',
      card: '#ffffff',
      cardBorder: '#e5e7eb',
      navBackground: '#ffffff',
      navText: '#374151',
      navHover: '#f3f4f6',
      sidebarBackground: '#f9fafb',
      sidebarText: '#374151',
      sidebarHover: '#f3f4f6',
      footerBackground: '#1f2937',
      footerText: '#d1d5db',
      customCss: '',
      isDefault: false,
      isActive: true,
      autoApply: false,
      autoApplyStart: '',
      autoApplyEnd: ''
    })
  }

  // 편집 시 폼 데이터 설정
  const openEditDialog = (theme: ThemeSettings) => {
    setSelectedTheme(theme)
    setFormData({
      name: theme.name,
      displayName: theme.displayName,
      description: theme.description || '',
      primary: theme.primary,
      secondary: theme.secondary,
      background: theme.background,
      surface: theme.surface,
      textPrimary: theme.textPrimary,
      textSecondary: theme.textSecondary,
      textMuted: theme.textMuted,
      border: theme.border,
      divider: theme.divider,
      success: theme.success,
      warning: theme.warning,
      error: theme.error,
      info: theme.info,
      accent: theme.accent,
      accentForeground: theme.accentForeground,
      input: theme.input,
      inputBorder: theme.inputBorder,
      card: theme.card,
      cardBorder: theme.cardBorder,
      navBackground: theme.navBackground,
      navText: theme.navText,
      navHover: theme.navHover,
      sidebarBackground: theme.sidebarBackground,
      sidebarText: theme.sidebarText,
      sidebarHover: theme.sidebarHover,
      footerBackground: theme.footerBackground,
      footerText: theme.footerText,
      customCss: theme.customCss || '',
      isDefault: theme.isDefault,
      isActive: theme.isActive,
      autoApply: theme.autoApply,
      autoApplyStart: theme.autoApplyStart || '',
      autoApplyEnd: theme.autoApplyEnd || ''
    })
    setShowEditDialog(true)
  }

  // 테마 복사
  const duplicateTheme = (theme: ThemeSettings) => {
    setFormData({
      name: `${theme.name}_copy`,
      displayName: `${theme.displayName} (복사본)`,
      description: theme.description || '',
      primary: theme.primary,
      secondary: theme.secondary,
      background: theme.background,
      surface: theme.surface,
      textPrimary: theme.textPrimary,
      textSecondary: theme.textSecondary,
      textMuted: theme.textMuted,
      border: theme.border,
      divider: theme.divider,
      success: theme.success,
      warning: theme.warning,
      error: theme.error,
      info: theme.info,
      accent: theme.accent,
      accentForeground: theme.accentForeground,
      input: theme.input,
      inputBorder: theme.inputBorder,
      card: theme.card,
      cardBorder: theme.cardBorder,
      navBackground: theme.navBackground,
      navText: theme.navText,
      navHover: theme.navHover,
      sidebarBackground: theme.sidebarBackground,
      sidebarText: theme.sidebarText,
      sidebarHover: theme.sidebarHover,
      footerBackground: theme.footerBackground,
      footerText: theme.footerText,
      customCss: theme.customCss || '',
      isDefault: false,
      isActive: true,
      autoApply: false,
      autoApplyStart: '',
      autoApplyEnd: ''
    })
    setShowCreateDialog(true)
  }

  useEffect(() => {
    loadThemes()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">테마 관리</h1>
        <p className="text-muted-foreground">사이트의 다크/라이트 모드 테마를 관리합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>테마 목록</CardTitle>
              <CardDescription>
                등록된 테마를 확인하고 관리할 수 있습니다.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              새 테마 생성
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>미리보기</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : themes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    등록된 테마가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                themes.map((theme) => (
                  <TableRow key={theme.id}>
                    <TableCell>
                      <div className="flex gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: theme.background }}
                        />
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: theme.textPrimary }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {theme.displayName}
                          {theme.isDefault && (
                            <Badge variant="default" className="text-xs">기본</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{theme.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {theme.isSystemTheme ? (
                          <Badge variant="secondary" className="gap-1">
                            <Settings className="w-3 h-3" />
                            시스템
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Palette className="w-3 h-3" />
                            커스텀
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {theme.isActive ? (
                        <Badge variant="default">활성</Badge>
                      ) : (
                        <Badge variant="secondary">비활성</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {theme._count?.userPreferences || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPreviewTheme(theme)
                            setShowPreviewDialog(true)
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(theme)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateTheme(theme)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {!theme.isSystemTheme && !theme.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTheme(theme)
                              setShowDeleteDialog(true)
                            }}
                            disabled={theme._count?.userPreferences ? theme._count.userPreferences > 0 : false}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 테마 생성 다이얼로그 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 테마 생성</DialogTitle>
            <DialogDescription>
              새로운 테마를 생성합니다. 색상과 설정을 조정해주세요.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="colors">색상</TabsTrigger>
              <TabsTrigger value="layout">레이아웃</TabsTrigger>
              <TabsTrigger value="advanced">고급</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">테마 이름 (영문) *</Label>
                  <Input
                    id="name"
                    placeholder="dark-blue"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">표시명 *</Label>
                  <Input
                    id="displayName"
                    placeholder="다크 블루"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="테마 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">기본 테마로 설정</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">활성화</Label>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary">Primary</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="primary"
                      value={formData.primary}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.primary}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary">Secondary</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="secondary"
                      value={formData.secondary}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.secondary}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background">Background</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="background"
                      value={formData.background}
                      onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.background}
                      onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="textPrimary">Text Primary</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="textPrimary"
                      value={formData.textPrimary}
                      onChange={(e) => setFormData(prev => ({ ...prev, textPrimary: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.textPrimary}
                      onChange={(e) => setFormData(prev => ({ ...prev, textPrimary: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textSecondary">Text Secondary</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="textSecondary"
                      value={formData.textSecondary}
                      onChange={(e) => setFormData(prev => ({ ...prev, textSecondary: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.textSecondary}
                      onChange={(e) => setFormData(prev => ({ ...prev, textSecondary: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border">Border</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="border"
                      value={formData.border}
                      onChange={(e) => setFormData(prev => ({ ...prev, border: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.border}
                      onChange={(e) => setFormData(prev => ({ ...prev, border: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="navBackground">Navigation Background</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="navBackground"
                      value={formData.navBackground}
                      onChange={(e) => setFormData(prev => ({ ...prev, navBackground: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.navBackground}
                      onChange={(e) => setFormData(prev => ({ ...prev, navBackground: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sidebarBackground">Sidebar Background</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="sidebarBackground"
                      value={formData.sidebarBackground}
                      onChange={(e) => setFormData(prev => ({ ...prev, sidebarBackground: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.sidebarBackground}
                      onChange={(e) => setFormData(prev => ({ ...prev, sidebarBackground: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customCss">커스텀 CSS</Label>
                <Textarea
                  id="customCss"
                  placeholder=".custom-class { color: red; }"
                  value={formData.customCss}
                  onChange={(e) => setFormData(prev => ({ ...prev, customCss: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoApply"
                  checked={formData.autoApply}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoApply: checked }))}
                />
                <Label htmlFor="autoApply">자동 적용</Label>
              </div>

              {formData.autoApply && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="autoApplyStart">시작 시간</Label>
                    <Input
                      id="autoApplyStart"
                      type="time"
                      value={formData.autoApplyStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoApplyStart: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autoApplyEnd">종료 시간</Label>
                    <Input
                      id="autoApplyEnd"
                      type="time"
                      value={formData.autoApplyEnd}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoApplyEnd: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button onClick={handleCreateTheme}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 테마 편집 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>테마 편집</DialogTitle>
            <DialogDescription>
              테마 설정을 수정합니다.
            </DialogDescription>
          </DialogHeader>

          {/* 편집 다이얼로그도 동일한 구조 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-displayName">표시명 *</Label>
                <Input
                  id="edit-displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-primary">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primary}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary: e.target.value }))}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={formData.primary}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button onClick={handleEditTheme}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 테마 삭제 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>테마 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 테마를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedTheme && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">{selectedTheme.displayName}</div>
              <div className="text-sm text-muted-foreground">{selectedTheme.name}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteTheme}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 테마 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>테마 미리보기</DialogTitle>
            <DialogDescription>
              {previewTheme?.displayName} 테마의 색상을 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {previewTheme && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Primary</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: previewTheme.primary }}
                    />
                    <span className="text-sm">{previewTheme.primary}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Background</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: previewTheme.background }}
                    />
                    <span className="text-sm">{previewTheme.background}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Text</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: previewTheme.textPrimary }}
                    />
                    <span className="text-sm">{previewTheme.textPrimary}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Accent</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: previewTheme.accent }}
                    />
                    <span className="text-sm">{previewTheme.accent}</span>
                  </div>
                </div>
              </div>

              {/* 컴포넌트 미리보기 */}
              <div
                className="p-4 rounded border space-y-4"
                style={{
                  backgroundColor: previewTheme.background,
                  color: previewTheme.textPrimary,
                  borderColor: previewTheme.border
                }}
              >
                <h3 className="font-bold">미리보기</h3>
                <p style={{ color: previewTheme.textSecondary }}>
                  이것은 테마가 적용된 텍스트 예시입니다.
                </p>
                <button
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: previewTheme.primary,
                    color: previewTheme.accentForeground
                  }}
                >
                  버튼 예시
                </button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}