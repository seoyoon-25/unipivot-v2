'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Plus,
  Loader2,
  Bell,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  Calendar,
  ExternalLink,
  MoreVertical
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
import { toast } from '@/hooks/use-toast'

interface AnnouncementBanner {
  id: string
  title: string
  content?: string | null
  type: string
  backgroundColor?: string | null
  textColor?: string | null
  icon?: string | null
  linkUrl?: string | null
  linkText?: string | null
  openInNewTab: boolean
  position: string
  isSticky: boolean
  showCloseButton: boolean
  autoDismiss: boolean
  autoDismissDelay?: number | null
  isScheduled: boolean
  startDate?: string | null
  endDate?: string | null
  targetPages?: string | null
  isActive: boolean
  priority: number
  impressionCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
}

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  INFO: { bg: '#3b82f6', text: '#ffffff', label: '정보' },
  WARNING: { bg: '#f59e0b', text: '#000000', label: '경고' },
  SUCCESS: { bg: '#10b981', text: '#ffffff', label: '성공' },
  ERROR: { bg: '#ef4444', text: '#ffffff', label: '오류' },
  MAINTENANCE: { bg: '#6366f1', text: '#ffffff', label: '점검' },
}

const defaultBanner: Partial<AnnouncementBanner> = {
  title: '',
  content: '',
  type: 'INFO',
  backgroundColor: '#3b82f6',
  textColor: '#ffffff',
  linkUrl: '',
  linkText: '자세히 보기',
  openInNewTab: false,
  position: 'TOP',
  isSticky: false,
  showCloseButton: true,
  autoDismiss: false,
  autoDismissDelay: 5,
  isScheduled: false,
  isActive: true,
  priority: 0,
}

export default function AnnouncementBannerPage() {
  const { data: session, status } = useSession()
  const [banners, setBanners] = useState<AnnouncementBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<AnnouncementBanner | null>(null)
  const [formData, setFormData] = useState<Partial<AnnouncementBanner>>(defaultBanner)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      redirect('/admin')
    }
  }, [session, status])

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/banners')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      toast({
        title: '오류',
        description: '배너 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedBanner(null)
    setFormData(defaultBanner)
    setIsModalOpen(true)
  }

  const handleEdit = (banner: AnnouncementBanner) => {
    setSelectedBanner(banner)
    setFormData({
      ...banner,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (banner: AnnouncementBanner) => {
    setSelectedBanner(banner)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedBanner) return

    try {
      const res = await fetch(`/api/admin/banners/${selectedBanner.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast({
        title: '삭제 완료',
        description: '배너가 삭제되었습니다.',
      })

      fetchBanners()
    } catch (error) {
      toast({
        title: '오류',
        description: '배너 삭제에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedBanner(null)
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

      const url = selectedBanner
        ? `/api/admin/banners/${selectedBanner.id}`
        : '/api/admin/banners'

      const method = selectedBanner ? 'PUT' : 'POST'

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
        description: selectedBanner ? '배너가 수정되었습니다.' : '배너가 생성되었습니다.',
      })

      setIsModalOpen(false)
      fetchBanners()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '배너 저장에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (banner: AnnouncementBanner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setBanners(prev =>
        prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b)
      )

      toast({
        title: '변경 완료',
        description: `배너가 ${!banner.isActive ? '활성화' : '비활성화'}되었습니다.`,
      })
    } catch (error) {
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  const getBannerStatus = (banner: AnnouncementBanner) => {
    if (!banner.isActive) return { label: '비활성', variant: 'secondary' as const }

    if (banner.isScheduled) {
      const now = new Date()
      const start = banner.startDate ? new Date(banner.startDate) : null
      const end = banner.endDate ? new Date(banner.endDate) : null

      if (start && now < start) return { label: '예약됨', variant: 'outline' as const }
      if (end && now > end) return { label: '만료됨', variant: 'destructive' as const }
    }

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
          <h1 className="text-2xl font-bold">공지 띠배너</h1>
          <p className="text-muted-foreground">
            사이트 상단에 표시되는 공지 배너를 관리합니다.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          새 배너 추가
        </Button>
      </div>

      {/* Banner Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">미리보기</CardTitle>
          <CardDescription>
            현재 활성화된 배너가 사이트에 표시되는 모습입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {banners.filter(b => b.isActive).length > 0 ? (
            <div className="space-y-2">
              {banners
                .filter(b => b.isActive)
                .slice(0, 2)
                .map(banner => (
                  <div
                    key={banner.id}
                    className="p-3 rounded-lg flex items-center justify-between text-sm"
                    style={{
                      backgroundColor: banner.backgroundColor || typeColors[banner.type]?.bg,
                      color: banner.textColor || typeColors[banner.type]?.text,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="font-medium">{banner.title}</span>
                      {banner.content && (
                        <span className="opacity-80">- {banner.content}</span>
                      )}
                    </div>
                    {banner.linkUrl && (
                      <span className="flex items-center gap-1 underline">
                        {banner.linkText || '자세히 보기'}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              활성화된 배너가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">배너 목록</CardTitle>
          <CardDescription>
            총 {banners.length}개의 배너가 등록되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>등록된 배너가 없습니다.</p>
              <p className="text-sm">새 배너를 추가해보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner) => {
                const status = getBannerStatus(banner)
                return (
                  <div
                    key={banner.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="cursor-grab">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div
                      className="w-3 h-12 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: banner.backgroundColor || typeColors[banner.type]?.bg,
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{banner.title}</span>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typeColors[banner.type]?.label || banner.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {banner.isScheduled && banner.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(banner.startDate).toLocaleDateString()}
                            {banner.endDate && ` ~ ${new Date(banner.endDate).toLocaleDateString()}`}
                          </span>
                        )}
                        <span>노출: {banner.impressionCount.toLocaleString()}회</span>
                        <span>클릭: {banner.clickCount.toLocaleString()}회</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => handleToggleActive(banner)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(banner)}>
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(banner)}
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
              {selectedBanner ? '배너 수정' : '새 배너 추가'}
            </DialogTitle>
            <DialogDescription>
              공지 배너의 내용과 스타일을 설정합니다.
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
                  placeholder="배너 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="content">내용 (선택)</Label>
                <Textarea
                  id="content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="배너에 표시될 추가 내용"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">유형</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      const colors = typeColors[value]
                      setFormData({
                        ...formData,
                        type: value,
                        backgroundColor: colors?.bg,
                        textColor: colors?.text,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeColors).map(([key, { label }]) => (
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
            </div>

            {/* Style */}
            <div className="space-y-4">
              <h4 className="font-medium">스타일</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">배경색</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData.backgroundColor || '#3b82f6'}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.backgroundColor || '#3b82f6'}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="textColor">텍스트색</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.textColor || '#ffffff'}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.textColor || '#ffffff'}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <Label>미리보기</Label>
                <div
                  className="p-3 rounded-lg flex items-center justify-between text-sm mt-2"
                  style={{
                    backgroundColor: formData.backgroundColor || '#3b82f6',
                    color: formData.textColor || '#ffffff',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">{formData.title || '배너 제목'}</span>
                    {formData.content && (
                      <span className="opacity-80">- {formData.content}</span>
                    )}
                  </div>
                  {formData.linkUrl && (
                    <span className="flex items-center gap-1 underline">
                      {formData.linkText || '자세히 보기'}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Link */}
            <div className="space-y-4">
              <h4 className="font-medium">링크</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkUrl">링크 URL</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkText">링크 텍스트</Label>
                  <Input
                    id="linkText"
                    value={formData.linkText || ''}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    placeholder="자세히 보기"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="openInNewTab"
                  checked={formData.openInNewTab}
                  onCheckedChange={(checked) => setFormData({ ...formData, openInNewTab: checked })}
                />
                <Label htmlFor="openInNewTab" className="font-normal">새 탭에서 열기</Label>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="font-medium">기간 설정</h4>
              <div className="flex items-center gap-2">
                <Switch
                  id="isScheduled"
                  checked={formData.isScheduled}
                  onCheckedChange={(checked) => setFormData({ ...formData, isScheduled: checked })}
                />
                <Label htmlFor="isScheduled" className="font-normal">기간 지정</Label>
              </div>
              {formData.isScheduled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h4 className="font-medium">옵션</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="showCloseButton"
                    checked={formData.showCloseButton}
                    onCheckedChange={(checked) => setFormData({ ...formData, showCloseButton: checked })}
                  />
                  <Label htmlFor="showCloseButton" className="font-normal">닫기 버튼 표시</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isSticky"
                    checked={formData.isSticky}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSticky: checked })}
                  />
                  <Label htmlFor="isSticky" className="font-normal">스크롤 시 고정</Label>
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
              {selectedBanner ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배너 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedBanner?.title}" 배너를 삭제하시겠습니까?
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
