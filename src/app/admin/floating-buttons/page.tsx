'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff, BarChart3, Calendar, MousePointer, Monitor, Smartphone, Tablet, MapPin } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { FloatingButtonEditor } from '@/components/admin/floating-buttons/FloatingButtonEditor'
import { FloatingButtonAnalytics } from '@/components/admin/floating-buttons/FloatingButtonAnalytics'

interface FloatingButton {
  id: string
  title: string
  icon?: string
  color: string
  hoverColor?: string
  textColor: string
  linkUrl: string
  openInNewTab: boolean
  position: 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'CUSTOM'
  offsetX: number
  offsetY: number
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
  showLabel: boolean
  animation: 'NONE' | 'PULSE' | 'BOUNCE' | 'SHAKE'
  animationDelay: number
  showOn: 'ALL' | 'DESKTOP' | 'MOBILE' | 'TABLET'
  scrollThreshold?: number
  isScheduled: boolean
  startDate?: string
  endDate?: string
  targetPages: string[]
  targetRoles: string[]
  excludePages: string[]
  isActive: boolean
  priority: number
  maxDisplayCount?: number
  impressionCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const BUTTON_POSITIONS = {
  BOTTOM_RIGHT: { label: '우측 하단', icon: '↘️' },
  BOTTOM_LEFT: { label: '좌측 하단', icon: '↙️' },
  TOP_RIGHT: { label: '우측 상단', icon: '↗️' },
  TOP_LEFT: { label: '좌측 상단', icon: '↖️' },
  CUSTOM: { label: '사용자 정의', icon: '🎯' }
}

const BUTTON_SIZES = {
  SMALL: { label: '소형', size: '40px' },
  MEDIUM: { label: '중형', size: '56px' },
  LARGE: { label: '대형', size: '72px' }
}

const DEVICE_TYPES = {
  ALL: { label: '모든 기기', icon: Monitor },
  DESKTOP: { label: '데스크톱', icon: Monitor },
  MOBILE: { label: '모바일', icon: Smartphone },
  TABLET: { label: '태블릿', icon: Tablet }
}

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'scheduled', label: '예약됨' }
]

export default function FloatingButtonsPage() {
  const [buttons, setButtons] = useState<FloatingButton[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 필터 상태
  const [filters, setFilters] = useState({
    search: '',
    position: 'all',
    status: 'all'
  })

  // 모달 상태
  const [showEditor, setShowEditor] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedButton, setSelectedButton] = useState<FloatingButton | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')

  // 버튼 목록 조회
  const fetchButtons = async (resetPage = false) => {
    try {
      setLoading(true)
      const page = resetPage ? 1 : pagination.page

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.position !== 'all' && { position: filters.position }),
        ...(filters.status !== 'all' && { status: filters.status })
      })

      const response = await fetch(`/api/admin/floating-buttons?${params}`)

      if (!response.ok) {
        throw new Error('플로팅 버튼 목록을 불러올 수 없습니다')
      }

      const data = await response.json()
      setButtons(data.buttons)
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
        page
      }))

    } catch (error) {
      console.error('Error fetching floating buttons:', error)
      toast({
        title: '오류',
        description: '플로팅 버튼 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchButtons()
  }, [])

  // 필터 변경 시 새로 조회
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchButtons(true)
    }, 500) // 디바운싱

    return () => clearTimeout(timeoutId)
  }, [filters])

  // 버튼 삭제
  const handleDelete = async (button: FloatingButton) => {
    if (!confirm(`"${button.title}" 플로팅 버튼을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/floating-buttons/${button.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('플로팅 버튼 삭제에 실패했습니다')
      }

      toast({
        title: '성공',
        description: '플로팅 버튼이 삭제되었습니다.'
      })

      fetchButtons()
    } catch (error) {
      console.error('Error deleting floating button:', error)
      toast({
        title: '오류',
        description: '플로팅 버튼 삭제에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }

  // 버튼 상태 토글
  const handleToggleStatus = async (button: FloatingButton) => {
    try {
      const response = await fetch(`/api/admin/floating-buttons/${button.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' })
      })

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다')
      }

      const data = await response.json()
      toast({
        title: '성공',
        description: data.message
      })

      fetchButtons()
    } catch (error) {
      console.error('Error toggling floating button status:', error)
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }

  // 버튼 편집 모달 열기
  const openEditor = (button?: FloatingButton) => {
    setSelectedButton(button || null)
    setEditorMode(button ? 'edit' : 'create')
    setShowEditor(true)
  }

  // 분석 모달 열기
  const openAnalytics = (button: FloatingButton) => {
    setSelectedButton(button)
    setShowAnalytics(true)
  }

  // 버튼 상태 표시
  const getButtonStatus = (button: FloatingButton) => {
    if (!button.isActive) {
      return <Badge variant="secondary">비활성</Badge>
    }

    if (button.isScheduled) {
      const now = new Date()
      const startDate = button.startDate ? new Date(button.startDate) : null
      const endDate = button.endDate ? new Date(button.endDate) : null

      if (startDate && startDate > now) {
        return <Badge variant="outline">예약됨</Badge>
      }
      if (endDate && endDate < now) {
        return <Badge variant="secondary">만료됨</Badge>
      }
    }

    return <Badge variant="default">활성</Badge>
  }

  // 클릭률 계산
  const getClickRate = (button: FloatingButton) => {
    if (button.impressionCount === 0) return '0%'
    return ((button.clickCount / button.impressionCount) * 100).toFixed(1) + '%'
  }

  // 디바이스 아이콘 가져오기
  const getDeviceIcon = (showOn: string) => {
    const IconComponent = DEVICE_TYPES[showOn as keyof typeof DEVICE_TYPES]?.icon || Monitor
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">플로팅 버튼</h1>
          <p className="text-muted-foreground">
            사이트에 표시되는 플로팅 액션 버튼을 관리합니다.
          </p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="h-4 w-4 mr-2" />
          새 버튼 추가
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목 또는 URL로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <SelectRoot
                value={filters.position}
                onValueChange={(value) => setFilters(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="위치" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 위치</SelectItem>
                  {Object.entries(BUTTON_POSITIONS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>

              <SelectRoot
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 플로팅 버튼 목록 */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>미리보기</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>위치/크기</TableHead>
                <TableHead>기기</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>통계</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="w-[100px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : buttons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    플로팅 버튼이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                buttons.map((button) => (
                  <TableRow key={button.id}>
                    <TableCell>
                      <div
                        className="flex items-center justify-center rounded-full text-white text-sm font-medium shadow-lg"
                        style={{
                          backgroundColor: button.color,
                          width: BUTTON_SIZES[button.size].size,
                          height: BUTTON_SIZES[button.size].size
                        }}
                      >
                        {button.icon ? (
                          <span className="text-lg">{button.icon}</span>
                        ) : (
                          <MousePointer className="h-4 w-4" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{button.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {button.linkUrl}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {BUTTON_POSITIONS[button.position].icon} {BUTTON_POSITIONS[button.position].label}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {BUTTON_SIZES[button.size].label} ({BUTTON_SIZES[button.size].size})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(button.showOn)}
                        <span className="text-sm">{DEVICE_TYPES[button.showOn as keyof typeof DEVICE_TYPES]?.label || button.showOn}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getButtonStatus(button)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{button.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>노출: {button.impressionCount.toLocaleString()}</div>
                        <div>클릭: {button.clickCount.toLocaleString()} ({getClickRate(button)})</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(button.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditor(button)}>
                            <Edit className="h-4 w-4 mr-2" />
                            편집
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAnalytics(button)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            분석
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(button)}>
                            {button.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                비활성화
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                활성화
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(button)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                총 {pagination.total}개 중 {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 플로팅 버튼 편집 모달 */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editorMode === 'create' ? '새 플로팅 버튼 추가' : '플로팅 버튼 편집'}
            </DialogTitle>
            <DialogDescription>
              {editorMode === 'create'
                ? '새로운 플로팅 액션 버튼을 생성합니다.'
                : '선택한 플로팅 버튼의 설정을 수정합니다.'
              }
            </DialogDescription>
          </DialogHeader>
          <FloatingButtonEditor
            button={selectedButton}
            mode={editorMode}
            onSave={() => {
              setShowEditor(false)
              fetchButtons()
            }}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 분석 모달 */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>플로팅 버튼 분석</DialogTitle>
            <DialogDescription>
              {selectedButton?.title}의 성과 데이터를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedButton && (
            <FloatingButtonAnalytics
              buttonId={selectedButton.id}
              buttonTitle={selectedButton.title}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}