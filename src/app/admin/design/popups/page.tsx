'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Plus,
  Loader2,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  Calendar,
  ImageIcon,
  Code
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'

interface Popup {
  id: string
  title: string
  content?: string | null
  trigger: string
  triggerValue?: string | null
  showOn: string
  targetPages?: string | null
  newVisitorOnly: boolean
  returningVisitorOnly: boolean
  showAfterDate?: string | null
  showUntilDate?: string | null
  frequency: string
  maxDisplayCount?: number | null
  isActive: boolean
  priority: number
  impressionCount: number
  clickCount: number
  conversionCount: number
  createdAt: string
}

const triggers: Record<string, string> = {
  pageload: '페이지 로드',
  exit_intent: '이탈 감지',
  scroll: '스크롤',
  time_delay: '시간 지연',
  click: '클릭',
}

const frequencies: Record<string, string> = {
  always: '항상',
  once: '한 번만',
  once_per_session: '세션당 한 번',
  once_per_day: '하루에 한 번',
  once_per_week: '일주일에 한 번',
}

const defaultPopup: Partial<Popup> = {
  title: '',
  content: '',
  trigger: 'pageload',
  triggerValue: '',
  showOn: 'all',
  newVisitorOnly: false,
  returningVisitorOnly: false,
  frequency: 'once_per_day',
  isActive: true,
  priority: 0,
}

export default function PopupsPage() {
  const { data: session, status } = useSession()
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null)
  const [formData, setFormData] = useState<Partial<Popup>>(defaultPopup)
  const [saving, setSaving] = useState(false)
  const [contentType, setContentType] = useState<'text' | 'html' | 'image'>('text')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      redirect('/admin')
    }
  }, [session, status])

  useEffect(() => {
    fetchPopups()
  }, [])

  const fetchPopups = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/popups')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPopups(data.popups || [])
    } catch (error) {
      toast({
        title: '오류',
        description: '팝업 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedPopup(null)
    setFormData(defaultPopup)
    setContentType('text')
    setIsModalOpen(true)
  }

  const handleEdit = (popup: Popup) => {
    setSelectedPopup(popup)
    setFormData({
      ...popup,
      showAfterDate: popup.showAfterDate ? new Date(popup.showAfterDate).toISOString().split('T')[0] : '',
      showUntilDate: popup.showUntilDate ? new Date(popup.showUntilDate).toISOString().split('T')[0] : '',
    })
    // Detect content type
    if (popup.content?.startsWith('<')) {
      setContentType('html')
    } else if (popup.content?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      setContentType('image')
    } else {
      setContentType('text')
    }
    setIsModalOpen(true)
  }

  const handleDelete = (popup: Popup) => {
    setSelectedPopup(popup)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPopup) return

    try {
      const res = await fetch(`/api/admin/popups/${selectedPopup.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast({
        title: '삭제 완료',
        description: '팝업이 삭제되었습니다.',
      })

      fetchPopups()
    } catch (error) {
      toast({
        title: '오류',
        description: '팝업 삭제에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedPopup(null)
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

    try {
      setSaving(true)

      const url = selectedPopup
        ? `/api/admin/popups/${selectedPopup.id}`
        : '/api/admin/popups'

      const method = selectedPopup ? 'PUT' : 'POST'

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
        description: selectedPopup ? '팝업이 수정되었습니다.' : '팝업이 생성되었습니다.',
      })

      setIsModalOpen(false)
      fetchPopups()
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

  const handleToggleActive = async (popup: Popup) => {
    try {
      const res = await fetch(`/api/admin/popups/${popup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...popup, isActive: !popup.isActive }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setPopups(prev =>
        prev.map(p => p.id === popup.id ? { ...p, isActive: !p.isActive } : p)
      )

      toast({
        title: '변경 완료',
        description: `팝업이 ${!popup.isActive ? '활성화' : '비활성화'}되었습니다.`,
      })
    } catch (error) {
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  const getPopupStatus = (popup: Popup) => {
    if (!popup.isActive) return { label: '비활성', variant: 'secondary' as const }

    const now = new Date()
    const start = popup.showAfterDate ? new Date(popup.showAfterDate) : null
    const end = popup.showUntilDate ? new Date(popup.showUntilDate) : null

    if (start && now < start) return { label: '예약됨', variant: 'outline' as const }
    if (end && now > end) return { label: '만료됨', variant: 'destructive' as const }

    return { label: '활성', variant: 'default' as const }
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
          <h1 className="text-2xl font-bold">팝업 관리</h1>
          <p className="text-muted-foreground">
            사이트에 표시되는 팝업을 관리합니다.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          새 팝업 추가
        </Button>
      </div>

      {/* Popup List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">팝업 목록</CardTitle>
          <CardDescription>
            총 {popups.length}개의 팝업이 등록되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {popups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>등록된 팝업이 없습니다.</p>
              <p className="text-sm">새 팝업을 추가해보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {popups.map((popup) => {
                const status = getPopupStatus(popup)
                return (
                  <div
                    key={popup.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {popup.content?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      ) : popup.content?.startsWith('<') ? (
                        <Code className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <MessageSquare className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{popup.title}</span>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {triggers[popup.trigger]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {frequencies[popup.frequency]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {popup.showAfterDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(popup.showAfterDate).toLocaleDateString()}
                            {popup.showUntilDate && ` ~ ${new Date(popup.showUntilDate).toLocaleDateString()}`}
                          </span>
                        )}
                        <span>노출: {popup.impressionCount.toLocaleString()}회</span>
                        <span>클릭: {popup.clickCount.toLocaleString()}회</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={popup.isActive}
                        onCheckedChange={() => handleToggleActive(popup)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(popup)}>
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(popup)}
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
              {selectedPopup ? '팝업 수정' : '새 팝업 추가'}
            </DialogTitle>
            <DialogDescription>
              팝업의 내용과 표시 조건을 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="팝업 제목"
                />
              </div>

              <div>
                <Label>콘텐츠 유형</Label>
                <Tabs value={contentType} onValueChange={(v) => setContentType(v as any)} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text">텍스트</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="image">이미지</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-4">
                    <Textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="팝업에 표시할 텍스트를 입력하세요"
                      rows={6}
                    />
                  </TabsContent>

                  <TabsContent value="html" className="mt-4">
                    <Textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="<div>HTML 코드를 입력하세요</div>"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </TabsContent>

                  <TabsContent value="image" className="mt-4">
                    <Input
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.content && (
                      <div className="mt-4 border rounded-lg p-2">
                        <img
                          src={formData.content}
                          alt="Preview"
                          className="max-w-full h-auto rounded"
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Trigger Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">트리거 설정</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trigger">트리거</Label>
                  <Select
                    value={formData.trigger}
                    onValueChange={(value) => setFormData({ ...formData, trigger: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(triggers).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.trigger === 'scroll' || formData.trigger === 'time_delay') && (
                  <div>
                    <Label htmlFor="triggerValue">
                      {formData.trigger === 'scroll' ? '스크롤 %' : '지연 시간 (초)'}
                    </Label>
                    <Input
                      id="triggerValue"
                      type="number"
                      value={formData.triggerValue || ''}
                      onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                      placeholder={formData.trigger === 'scroll' ? '50' : '5'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">표시 설정</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">표시 빈도</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(frequencies).map(([key, label]) => (
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="showAfterDate">시작일</Label>
                  <Input
                    id="showAfterDate"
                    type="date"
                    value={formData.showAfterDate || ''}
                    onChange={(e) => setFormData({ ...formData, showAfterDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="showUntilDate">종료일</Label>
                  <Input
                    id="showUntilDate"
                    type="date"
                    value={formData.showUntilDate || ''}
                    onChange={(e) => setFormData({ ...formData, showUntilDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="newVisitorOnly"
                    checked={formData.newVisitorOnly}
                    onCheckedChange={(checked) => setFormData({ ...formData, newVisitorOnly: checked, returningVisitorOnly: checked ? false : formData.returningVisitorOnly })}
                  />
                  <Label htmlFor="newVisitorOnly" className="font-normal">신규 방문자에게만 표시</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="returningVisitorOnly"
                    checked={formData.returningVisitorOnly}
                    onCheckedChange={(checked) => setFormData({ ...formData, returningVisitorOnly: checked, newVisitorOnly: checked ? false : formData.newVisitorOnly })}
                  />
                  <Label htmlFor="returningVisitorOnly" className="font-normal">재방문자에게만 표시</Label>
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
              {selectedPopup ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>팝업 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedPopup?.title}" 팝업을 삭제하시겠습니까?
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
