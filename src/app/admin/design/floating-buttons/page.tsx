'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Plus,
  Loader2,
  MousePointer2,
  Trash2,
  Edit,
  GripVertical,
  ExternalLink,
  MoreVertical,
  Phone,
  MessageCircle,
  Mail,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface FloatingButton {
  id: string
  title: string
  icon?: string | null
  color: string
  hoverColor?: string | null
  textColor: string
  linkUrl: string
  openInNewTab: boolean
  position: string
  offsetX: number
  offsetY: number
  size: string
  showLabel: boolean
  animation: string
  animationDelay: number
  showOn: string
  scrollThreshold?: number | null
  isScheduled: boolean
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
  priority: number
  impressionCount: number
  clickCount: number
  createdAt: string
}

const icons: Record<string, { icon: any; label: string }> = {
  phone: { icon: Phone, label: '전화' },
  message: { icon: MessageCircle, label: '카카오톡' },
  mail: { icon: Mail, label: '이메일' },
  link: { icon: LinkIcon, label: '링크' },
}

const positions: Record<string, string> = {
  BOTTOM_RIGHT: '우하단',
  BOTTOM_LEFT: '좌하단',
  TOP_RIGHT: '우상단',
  TOP_LEFT: '좌상단',
}

const sizes: Record<string, string> = {
  SMALL: '소형',
  MEDIUM: '중형',
  LARGE: '대형',
}

const animations: Record<string, string> = {
  NONE: '없음',
  PULSE: '펄스',
  BOUNCE: '바운스',
  SHAKE: '흔들기',
}

const showOnOptions: Record<string, string> = {
  ALL: '모든 기기',
  DESKTOP: '데스크톱',
  MOBILE: '모바일',
  TABLET: '태블릿',
}

const defaultButton: Partial<FloatingButton> = {
  title: '',
  icon: 'message',
  color: '#FAE100',
  textColor: '#3C1E1E',
  linkUrl: '',
  openInNewTab: true,
  position: 'BOTTOM_RIGHT',
  offsetX: 20,
  offsetY: 20,
  size: 'MEDIUM',
  showLabel: true,
  animation: 'NONE',
  animationDelay: 0,
  showOn: 'ALL',
  isScheduled: false,
  isActive: true,
  priority: 0,
}

export default function FloatingButtonsPage() {
  const { data: session, status } = useSession()
  const [buttons, setButtons] = useState<FloatingButton[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedButton, setSelectedButton] = useState<FloatingButton | null>(null)
  const [formData, setFormData] = useState<Partial<FloatingButton>>(defaultButton)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      redirect('/admin')
    }
  }, [session, status])

  useEffect(() => {
    fetchButtons()
  }, [])

  const fetchButtons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/floating-buttons')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setButtons(data.buttons || [])
    } catch (error) {
      toast({
        title: '오류',
        description: '플로팅 버튼 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedButton(null)
    setFormData(defaultButton)
    setIsModalOpen(true)
  }

  const handleEdit = (button: FloatingButton) => {
    setSelectedButton(button)
    setFormData({
      ...button,
      startDate: button.startDate ? new Date(button.startDate).toISOString().split('T')[0] : '',
      endDate: button.endDate ? new Date(button.endDate).toISOString().split('T')[0] : '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (button: FloatingButton) => {
    setSelectedButton(button)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedButton) return

    try {
      const res = await fetch(`/api/admin/floating-buttons/${selectedButton.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast({
        title: '삭제 완료',
        description: '플로팅 버튼이 삭제되었습니다.',
      })

      fetchButtons()
    } catch (error) {
      toast({
        title: '오류',
        description: '플로팅 버튼 삭제에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedButton(null)
    }
  }

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({
        title: '오류',
        description: '제목을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.linkUrl?.trim()) {
      toast({
        title: '오류',
        description: 'URL을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)

      const url = selectedButton
        ? `/api/admin/floating-buttons/${selectedButton.id}`
        : '/api/admin/floating-buttons'

      const method = selectedButton ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      toast({
        title: '저장 완료',
        description: selectedButton ? '버튼이 수정되었습니다.' : '버튼이 생성되었습니다.',
      })

      setIsModalOpen(false)
      fetchButtons()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '저장에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (button: FloatingButton) => {
    try {
      const res = await fetch(`/api/admin/floating-buttons/${button.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...button, isActive: !button.isActive }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setButtons(prev =>
        prev.map(b => b.id === button.id ? { ...b, isActive: !b.isActive } : b)
      )

      toast({
        title: '변경 완료',
        description: `버튼이 ${!button.isActive ? '활성화' : '비활성화'}되었습니다.`,
      })
    } catch (error) {
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  const getIconComponent = (iconName?: string | null) => {
    const iconData = icons[iconName || 'link']
    return iconData?.icon || LinkIcon
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">플로팅 버튼</h1>
          <p className="text-muted-foreground">
            화면 모서리에 고정되는 플로팅 버튼을 관리합니다.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          새 버튼 추가
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">미리보기</CardTitle>
          <CardDescription>
            현재 활성화된 버튼이 사이트에 표시되는 모습입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            {/* Preview area */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              웹사이트 화면
            </div>

            {/* Active buttons */}
            {buttons.filter(b => b.isActive).map((button, index) => {
              const Icon = getIconComponent(button.icon)
              const positionStyles: Record<string, any> = {
                BOTTOM_RIGHT: { bottom: button.offsetY + index * 60, right: button.offsetX },
                BOTTOM_LEFT: { bottom: button.offsetY + index * 60, left: button.offsetX },
                TOP_RIGHT: { top: button.offsetY + index * 60, right: button.offsetX },
                TOP_LEFT: { top: button.offsetY + index * 60, left: button.offsetX },
              }

              return (
                <div
                  key={button.id}
                  className="absolute flex items-center gap-2 shadow-lg rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105"
                  style={{
                    backgroundColor: button.color,
                    color: button.textColor,
                    ...positionStyles[button.position],
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {button.showLabel && <span>{button.title}</span>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Button List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">버튼 목록</CardTitle>
          <CardDescription>
            총 {buttons.length}개의 버튼이 등록되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {buttons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MousePointer2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>등록된 버튼이 없습니다.</p>
              <p className="text-sm">새 버튼을 추가해보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buttons.map((button) => {
                const Icon = getIconComponent(button.icon)
                return (
                  <div
                    key={button.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="cursor-grab">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: button.color, color: button.textColor }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{button.title}</span>
                        <Badge variant={button.isActive ? 'default' : 'secondary'}>
                          {button.isActive ? '활성' : '비활성'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {positions[button.position]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {showOnOptions[button.showOn]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="truncate max-w-xs">{button.linkUrl}</span>
                        <span>클릭: {button.clickCount.toLocaleString()}회</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={button.isActive}
                        onCheckedChange={() => handleToggleActive(button)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(button)}>
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(button)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedButton ? '버튼 수정' : '새 버튼 추가'}
            </DialogTitle>
            <DialogDescription>
              플로팅 버튼의 내용과 스타일을 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="카카오톡 상담"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">아이콘</Label>
                  <Select
                    value={formData.icon || 'link'}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(icons).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="linkUrl">링크 URL *</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://pf.kakao.com/..."
                />
              </div>
            </div>

            {/* Style */}
            <div className="space-y-4">
              <h4 className="font-medium">스타일</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">배경색</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color || '#FAE100'}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.color || '#FAE100'}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">텍스트/아이콘색</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.textColor || '#3C1E1E'}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.textColor || '#3C1E1E'}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="position">위치</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(positions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">크기</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData({ ...formData, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sizes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="animation">애니메이션</Label>
                  <Select
                    value={formData.animation}
                    onValueChange={(value) => setFormData({ ...formData, animation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(animations).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div>
                <Label>미리보기</Label>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg flex justify-center">
                  {(() => {
                    const Icon = getIconComponent(formData.icon)
                    return (
                      <div
                        className="flex items-center gap-2 shadow-lg rounded-full px-4 py-2 text-sm font-medium"
                        style={{
                          backgroundColor: formData.color,
                          color: formData.textColor,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {formData.showLabel && <span>{formData.title || '버튼 제목'}</span>}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
              <h4 className="font-medium">표시 옵션</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="showOn">표시 기기</Label>
                  <Select
                    value={formData.showOn}
                    onValueChange={(value) => setFormData({ ...formData, showOn: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(showOnOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">우선순위</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="showLabel"
                    checked={formData.showLabel}
                    onCheckedChange={(checked) => setFormData({ ...formData, showLabel: checked })}
                  />
                  <Label htmlFor="showLabel" className="font-normal">레이블 표시</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="openInNewTab"
                    checked={formData.openInNewTab}
                    onCheckedChange={(checked) => setFormData({ ...formData, openInNewTab: checked })}
                  />
                  <Label htmlFor="openInNewTab" className="font-normal">새 탭에서 열기</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="font-normal">활성화</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedButton ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버튼 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedButton?.title}" 버튼을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
