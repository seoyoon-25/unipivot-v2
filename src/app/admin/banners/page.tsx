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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff, BarChart3, Calendar, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { BannerEditor } from '@/components/admin/banners/BannerEditor'
import { BannerAnalytics } from '@/components/admin/banners/BannerAnalytics'

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
  impressionCount: number
  clickCount: number
  dismissCount: number
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const BANNER_TYPES = {
  INFO: { label: '정보', color: 'bg-blue-500' },
  WARNING: { label: '경고', color: 'bg-yellow-500' },
  SUCCESS: { label: '성공', color: 'bg-green-500' },
  ERROR: { label: '오류', color: 'bg-red-500' },
  MAINTENANCE: { label: '점검', color: 'bg-gray-500' }
}

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'scheduled', label: '예약됨' }
]

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
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
    type: 'all',
    status: 'all'
  })

  // 모달 상태
  const [showEditor, setShowEditor] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')

  // 배너 목록 조회
  const fetchBanners = async (resetPage = false) => {
    try {
      setLoading(true)
      const page = resetPage ? 1 : pagination.page

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status })
      })

      const response = await fetch(`/api/admin/banners?${params}`)

      if (!response.ok) {
        throw new Error('배너 목록을 불러올 수 없습니다')
      }

      const data = await response.json()
      setBanners(data.banners)
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
        page
      }))

    } catch (error) {
      console.error('Error fetching banners:', error)
      toast({
        title: '오류',
        description: '배너 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchBanners()
  }, [])

  // 필터 변경 시 새로 조회
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBanners(true)
    }, 500) // 디바운싱

    return () => clearTimeout(timeoutId)
  }, [filters])

  // 배너 삭제
  const handleDelete = async (banner: Banner) => {
    if (!confirm(`"${banner.title}" 배너를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('배너 삭제에 실패했습니다')
      }

      toast({
        title: '성공',
        description: '배너가 삭제되었습니다.'
      })

      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast({
        title: '오류',
        description: '배너 삭제에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }

  // 배너 상태 토글
  const handleToggleStatus = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
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

      fetchBanners()
    } catch (error) {
      console.error('Error toggling banner status:', error)
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }

  // 배너 편집 모달 열기
  const openEditor = (banner?: Banner) => {
    setSelectedBanner(banner || null)
    setEditorMode(banner ? 'edit' : 'create')
    setShowEditor(true)
  }

  // 분석 모달 열기
  const openAnalytics = (banner: Banner) => {
    setSelectedBanner(banner)
    setShowAnalytics(true)
  }

  // 배너 상태 표시
  const getBannerStatus = (banner: Banner) => {
    if (!banner.isActive) {
      return <Badge variant="secondary">비활성</Badge>
    }

    if (banner.isScheduled) {
      const now = new Date()
      const startDate = banner.startDate ? new Date(banner.startDate) : null
      const endDate = banner.endDate ? new Date(banner.endDate) : null

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
  const getClickRate = (banner: Banner) => {
    if (banner.impressionCount === 0) return '0%'
    return ((banner.clickCount / banner.impressionCount) * 100).toFixed(1) + '%'
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">공지사항 배너</h1>
          <p className="text-muted-foreground">
            사이트 상단/하단에 표시되는 공지사항 배너를 관리합니다.
          </p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="h-4 w-4 mr-2" />
          새 배너 추가
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
                  placeholder="제목 또는 내용으로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <SelectRoot
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 타입</SelectItem>
                  {Object.entries(BANNER_TYPES).map(([key, { label }]) => (
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

      {/* 배너 목록 */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>위치</TableHead>
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
                  <TableCell colSpan={8} className="text-center py-8">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    배너가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{banner.title}</div>
                        {banner.content && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {banner.content}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${BANNER_TYPES[banner.type].color} text-white`}>
                        {BANNER_TYPES[banner.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {banner.position === 'TOP' ? '상단' : '하단'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getBannerStatus(banner)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{banner.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>노출: {banner.impressionCount.toLocaleString()}</div>
                        <div>클릭: {banner.clickCount.toLocaleString()} ({getClickRate(banner)})</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(banner.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => openEditor(banner)}>
                            <Edit className="h-4 w-4 mr-2" />
                            편집
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAnalytics(banner)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            분석
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(banner)}>
                            {banner.isActive ? (
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
                            onClick={() => handleDelete(banner)}
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

      {/* 배너 편집 모달 */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editorMode === 'create' ? '새 배너 추가' : '배너 편집'}
            </DialogTitle>
            <DialogDescription>
              {editorMode === 'create'
                ? '새로운 공지사항 배너를 생성합니다.'
                : '선택한 배너의 설정을 수정합니다.'
              }
            </DialogDescription>
          </DialogHeader>
          <BannerEditor
            banner={selectedBanner}
            mode={editorMode}
            onSave={() => {
              setShowEditor(false)
              fetchBanners()
            }}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 분석 모달 */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>배너 분석</DialogTitle>
            <DialogDescription>
              {selectedBanner?.title}의 성과 데이터를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <BannerAnalytics
              bannerId={selectedBanner.id}
              bannerTitle={selectedBanner.title}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}