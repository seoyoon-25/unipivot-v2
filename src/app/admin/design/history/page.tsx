'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Loader2,
  History,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileEdit,
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

interface ChangeHistory {
  id: string
  entityType: string
  entityId: string
  action: string
  fieldName?: string | null
  previousValue?: any
  newValue?: any
  fullSnapshot: any
  userId: string
  ipAddress?: string | null
  description?: string | null
  changeVersion: number
  isAutoSave: boolean
  createdAt: string
  rollbacks: Array<{
    id: string
    rollbackType: string
    rolledBackAt: string
    userId: string
  }>
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const entityTypes: Record<string, string> = {
  SiteSection: '섹션',
  AnnouncementBanner: '공지 배너',
  FloatingButton: '플로팅 버튼',
  Popup: '팝업',
  SeoSetting: 'SEO 설정',
  GlobalSeoSetting: '전역 SEO',
  SiteSetting: '사이트 설정',
}

const actions: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  CREATE: { label: '생성', variant: 'default' },
  UPDATE: { label: '수정', variant: 'secondary' },
  DELETE: { label: '삭제', variant: 'destructive' },
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const [history, setHistory] = useState<ChangeHistory[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedHistory, setSelectedHistory] = useState<ChangeHistory | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false)
  const [rollbackLoading, setRollbackLoading] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      redirect('/admin')
    }
  }, [session, status])

  useEffect(() => {
    fetchHistory()
  }, [filters])

  const fetchHistory = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (filters.entityType) params.set('entityType', filters.entityType)
      if (filters.action) params.set('action', filters.action)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      params.set('page', filters.page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/admin/history?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setHistory(data.history || [])
      setPagination(data.pagination)
    } catch (error) {
      toast({
        title: '오류',
        description: '변경 이력을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (item: ChangeHistory) => {
    setSelectedHistory(item)
    setIsDetailOpen(true)
  }

  const handleRollback = (item: ChangeHistory) => {
    setSelectedHistory(item)
    setIsRollbackDialogOpen(true)
  }

  const confirmRollback = async () => {
    if (!selectedHistory) return

    try {
      setRollbackLoading(true)

      const res = await fetch('/api/admin/history/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeHistoryId: selectedHistory.id,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to rollback')
      }

      toast({
        title: '복원 완료',
        description: '이전 버전으로 복원되었습니다.',
      })

      setIsRollbackDialogOpen(false)
      fetchHistory()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '복원에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setRollbackLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4" />
      case 'UPDATE':
        return <FileEdit className="h-4 w-4" />
      case 'DELETE':
        return <Trash2 className="h-4 w-4" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
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
      <div>
        <h1 className="text-2xl font-bold">변경 히스토리</h1>
        <p className="text-muted-foreground">
          디자인 변경 내역을 확인하고 이전 버전으로 복원할 수 있습니다.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            필터
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="entityType">유형</Label>
              <Select
                value={filters.entityType}
                onValueChange={(value) => setFilters({ ...filters, entityType: value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {Object.entries(entityTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action">작업</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters({ ...filters, action: value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {Object.entries(actions).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">종료일</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">변경 내역</CardTitle>
          <CardDescription>
            총 {pagination?.totalCount || 0}개의 변경 기록이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>변경 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const actionInfo = actions[item.action] || { label: item.action, variant: 'secondary' as const }
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getActionIcon(item.action)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={actionInfo.variant}>
                          {actionInfo.label}
                        </Badge>
                        <Badge variant="outline">
                          {entityTypes[item.entityType] || item.entityType}
                        </Badge>
                        {item.isAutoSave && (
                          <Badge variant="secondary" className="text-xs">자동저장</Badge>
                        )}
                        {item.rollbacks.length > 0 && (
                          <Badge variant="outline" className="text-xs text-orange-500">복원됨</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </span>
                        {item.fieldName && (
                          <span>필드: {item.fieldName}</span>
                        )}
                        {item.description && (
                          <span className="truncate max-w-xs">{item.description}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        상세보기
                      </Button>
                      {item.action !== 'DELETE' && item.previousValue && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(item)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          복원
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                페이지 {pagination.currentPage} / {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={!pagination.hasNextPage}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>변경 상세</DialogTitle>
            <DialogDescription>
              버전 #{selectedHistory?.changeVersion}의 변경 내용입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedHistory && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">유형</Label>
                  <p>{entityTypes[selectedHistory.entityType] || selectedHistory.entityType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">작업</Label>
                  <p>{actions[selectedHistory.action]?.label || selectedHistory.action}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">시간</Label>
                  <p>{formatDate(selectedHistory.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP 주소</Label>
                  <p>{selectedHistory.ipAddress || '-'}</p>
                </div>
              </div>

              {selectedHistory.previousValue && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">이전 값</Label>
                  <pre className="text-xs bg-red-50 border border-red-200 p-4 rounded-lg overflow-auto max-h-48">
                    {JSON.stringify(selectedHistory.previousValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedHistory.newValue && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">새 값</Label>
                  <pre className="text-xs bg-green-50 border border-green-200 p-4 rounded-lg overflow-auto max-h-48">
                    {JSON.stringify(selectedHistory.newValue, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground mb-2 block">전체 스냅샷</Label>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                  {JSON.stringify(selectedHistory.fullSnapshot, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              닫기
            </Button>
            {selectedHistory?.action !== 'DELETE' && selectedHistory?.previousValue && (
              <Button onClick={() => {
                setIsDetailOpen(false)
                handleRollback(selectedHistory)
              }}>
                <RotateCcw className="h-4 w-4 mr-2" />
                이 버전으로 복원
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollback Confirmation */}
      <AlertDialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버전 복원</AlertDialogTitle>
            <AlertDialogDescription>
              버전 #{selectedHistory?.changeVersion}으로 복원하시겠습니까?
              현재 설정이 이전 버전으로 대체됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRollback} disabled={rollbackLoading}>
              {rollbackLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              복원
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
