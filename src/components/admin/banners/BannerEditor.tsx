'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { SelectRoot as Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Calendar, Loader2, Save, Eye } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Banner {
  id: string
  title: string
  content?: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'MAINTENANCE'
  backgroundColor?: string
  textColor?: string
  icon?: string
  linkUrl?: string
  linkText?: string
  openInNewTab: boolean
  position: 'TOP' | 'BOTTOM'
  isSticky: boolean
  showCloseButton: boolean
  autoDismiss: boolean
  autoDismissDelay?: number
  isScheduled: boolean
  startDate?: string
  endDate?: string
  targetPages: string[]
  targetRoles: string[]
  excludePages: string[]
  isActive: boolean
  priority: number
  maxDisplayCount?: number
}

interface BannerEditorProps {
  banner?: Banner | null
  mode: 'create' | 'edit'
  onSave: () => void
  onCancel: () => void
}

const BANNER_TYPES = [
  { value: 'INFO', label: '정보', color: '#3b82f6' },
  { value: 'WARNING', label: '경고', color: '#eab308' },
  { value: 'SUCCESS', label: '성공', color: '#22c55e' },
  { value: 'ERROR', label: '오류', color: '#ef4444' },
  { value: 'MAINTENANCE', label: '점검', color: '#6b7280' }
] as const

const COMMON_PAGES = [
  { value: '/', label: '메인 페이지' },
  { value: '/programs', label: '프로그램' },
  { value: '/about', label: '소개' },
  { value: '/contact', label: '문의' },
  { value: '/admin', label: '관리자' }
]

const USER_ROLES = [
  { value: 'USER', label: '일반 사용자' },
  { value: 'MEMBER', label: '회원' },
  { value: 'STAFF', label: '스태프' },
  { value: 'ADMIN', label: '관리자' },
  { value: 'SUPER_ADMIN', label: '최고 관리자' }
]

export function BannerEditor({ banner, mode, onSave, onCancel }: BannerEditorProps) {
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    content: '',
    type: 'INFO',
    backgroundColor: '',
    textColor: '',
    icon: '',
    linkUrl: '',
    linkText: '',
    openInNewTab: false,
    position: 'TOP',
    isSticky: false,
    showCloseButton: true,
    autoDismiss: false,
    autoDismissDelay: 5,
    isScheduled: false,
    startDate: '',
    endDate: '',
    targetPages: [],
    targetRoles: [],
    excludePages: [],
    isActive: true,
    priority: 0,
    maxDisplayCount: undefined
  })

  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // 편집 모드인 경우 기존 데이터 로드
  useEffect(() => {
    if (banner && mode === 'edit') {
      setFormData({
        ...banner,
        startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
        endDate: banner.endDate ? banner.endDate.split('T')[0] : ''
      })
    }
  }, [banner, mode])

  // 폼 필드 업데이트
  const updateField = (field: keyof Banner, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 배열 필드 업데이트 (페이지, 권한)
  const updateArrayField = (field: 'targetPages' | 'targetRoles' | 'excludePages', value: string) => {
    if (!value.trim()) return

    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }))
  }

  const removeArrayItem = (field: 'targetPages' | 'targetRoles' | 'excludePages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }))
  }

  // 저장
  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({
        title: '오류',
        description: '제목을 입력해주세요.',
        variant: 'destructive'
      })
      return
    }

    if (formData.autoDismiss && (!formData.autoDismissDelay || formData.autoDismissDelay < 1)) {
      toast({
        title: '오류',
        description: '자동 해제 시간을 1초 이상으로 설정해주세요.',
        variant: 'destructive'
      })
      return
    }

    if (formData.isScheduled && !formData.startDate) {
      toast({
        title: '오류',
        description: '스케줄링을 사용하려면 시작일을 설정해주세요.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)

      const url = mode === 'create' ? '/api/admin/banners' : `/api/admin/banners/${banner?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '저장에 실패했습니다')
      }

      toast({
        title: '성공',
        description: `배너가 ${mode === 'create' ? '생성' : '수정'}되었습니다.`
      })

      onSave()
    } catch (error) {
      console.error('Error saving banner:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '저장에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  // 미리보기 렌더링
  const renderPreview = () => {
    const selectedType = BANNER_TYPES.find(t => t.value === formData.type)
    const bgColor = formData.backgroundColor || selectedType?.color || '#3b82f6'
    const textColor = formData.textColor || '#ffffff'

    return (
      <div
        className="p-4 rounded-lg border flex items-center justify-between"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="flex items-center gap-3 flex-1">
          {formData.icon && <span className="text-lg">{formData.icon}</span>}
          <div>
            <div className="font-medium">{formData.title || '제목을 입력하세요'}</div>
            {formData.content && (
              <div className="text-sm opacity-90">{formData.content}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {formData.linkUrl && formData.linkText && (
            <Button variant="secondary" size="sm">
              {formData.linkText}
            </Button>
          )}
          {formData.showCloseButton && (
            <Button variant="ghost" size="sm" className="text-current hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 미리보기 */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              미리보기
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderPreview()}
          </CardContent>
        </Card>
      )}

      {/* 기본 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 설정</CardTitle>
          <CardDescription>배너의 기본 정보를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="배너 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">타입</Label>
              <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BANNER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="배너에 표시할 내용을 입력하세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">위치</Label>
              <Select value={formData.position} onValueChange={(value) => updateField('position', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOP">상단</SelectItem>
                  <SelectItem value="BOTTOM">하단</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">우선순위</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority || 0}
                onChange={(e) => updateField('priority', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDisplayCount">최대 노출 횟수</Label>
              <Input
                id="maxDisplayCount"
                type="number"
                value={formData.maxDisplayCount || ''}
                onChange={(e) => updateField('maxDisplayCount', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="무제한"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스타일 및 링크 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">스타일 및 링크</CardTitle>
          <CardDescription>배너의 외관과 링크를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">배경색</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  value={formData.backgroundColor || ''}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
                <input
                  type="color"
                  value={formData.backgroundColor || '#3b82f6'}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">텍스트 색상</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  value={formData.textColor || ''}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  placeholder="#000000"
                />
                <input
                  type="color"
                  value={formData.textColor || '#ffffff'}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  className="w-10 h-10 rounded border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">아이콘</Label>
              <Input
                id="icon"
                value={formData.icon || ''}
                onChange={(e) => updateField('icon', e.target.value)}
                placeholder="📢"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">링크 URL</Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl || ''}
                onChange={(e) => updateField('linkUrl', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkText">링크 텍스트</Label>
              <Input
                id="linkText"
                value={formData.linkText || ''}
                onChange={(e) => updateField('linkText', e.target.value)}
                placeholder="자세히 보기"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="openInNewTab"
              checked={formData.openInNewTab || false}
              onCheckedChange={(checked) => updateField('openInNewTab', checked)}
            />
            <Label htmlFor="openInNewTab">새 탭에서 열기</Label>
          </div>
        </CardContent>
      </Card>

      {/* 동작 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">동작 설정</CardTitle>
          <CardDescription>배너의 표시 방식과 동작을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isSticky"
                checked={formData.isSticky || false}
                onCheckedChange={(checked) => updateField('isSticky', checked)}
              />
              <Label htmlFor="isSticky">고정 표시</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="showCloseButton"
                checked={formData.showCloseButton !== false}
                onCheckedChange={(checked) => updateField('showCloseButton', checked)}
              />
              <Label htmlFor="showCloseButton">닫기 버튼 표시</Label>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoDismiss"
                checked={formData.autoDismiss || false}
                onCheckedChange={(checked) => updateField('autoDismiss', checked)}
              />
              <Label htmlFor="autoDismiss">자동 해제</Label>
            </div>
            {formData.autoDismiss && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="autoDismissDelay">해제 시간(초)</Label>
                <Input
                  id="autoDismissDelay"
                  type="number"
                  value={formData.autoDismissDelay || 5}
                  onChange={(e) => updateField('autoDismissDelay', parseInt(e.target.value) || 5)}
                  className="w-20"
                  min="1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 스케줄링 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            스케줄링
          </CardTitle>
          <CardDescription>특정 시간에만 배너를 표시하도록 설정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isScheduled"
              checked={formData.isScheduled || false}
              onCheckedChange={(checked) => updateField('isScheduled', checked)}
            />
            <Label htmlFor="isScheduled">스케줄링 사용</Label>
          </div>

          {formData.isScheduled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">종료일 (선택사항)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 대상 및 제외 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">대상 설정</CardTitle>
          <CardDescription>특정 페이지나 사용자 그룹에만 표시하도록 설정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 대상 페이지 */}
          <div className="space-y-2">
            <Label>대상 페이지</Label>
            <div className="flex gap-2">
              <Select onValueChange={(value) => updateArrayField('targetPages', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="페이지 선택" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PAGES.map(page => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="또는 직접 입력"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    updateArrayField('targetPages', input.value)
                    input.value = ''
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetPages?.map((page, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {page}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeArrayItem('targetPages', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* 대상 권한 */}
          <div className="space-y-2">
            <Label>대상 권한</Label>
            <Select onValueChange={(value) => updateArrayField('targetRoles', value)}>
              <SelectTrigger>
                <SelectValue placeholder="권한 선택" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {formData.targetRoles?.map((role, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {USER_ROLES.find(r => r.value === role)?.label || role}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeArrayItem('targetRoles', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* 제외 페이지 */}
          <div className="space-y-2">
            <Label>제외 페이지</Label>
            <div className="flex gap-2">
              <Select onValueChange={(value) => updateArrayField('excludePages', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="제외할 페이지 선택" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PAGES.map(page => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="또는 직접 입력"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    updateArrayField('excludePages', input.value)
                    input.value = ''
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.excludePages?.map((page, index) => (
                <Badge key={index} variant="destructive" className="flex items-center gap-1">
                  {page}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeArrayItem('excludePages', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상태 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">상태 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive !== false}
              onCheckedChange={(checked) => updateField('isActive', checked)}
            />
            <Label htmlFor="isActive">배너 활성화</Label>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? '미리보기 숨기기' : '미리보기'}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? '생성' : '수정'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}