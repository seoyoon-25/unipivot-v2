'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { SelectRoot as Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Clock,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Eye,
  Calendar as CalendarIcon,
  Filter,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format, isValid } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

// 타입 정의
interface ChangeHistory {
  id: string
  entityType: string
  entityId: string
  action: string
  fieldName?: string
  previousValue?: any
  newValue?: any
  fullSnapshot: any
  userId: string
  description?: string
  changeVersion: number
  isAutoSave: boolean
  createdAt: string
  rollbacks: any[]
}

interface RestorePoint {
  id: string
  name: string
  description?: string
  userId: string
  isAutomatic: boolean
  createdAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function HistoryPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('history')

  // History state
  const [history, setHistory] = useState<ChangeHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyPagination, setHistoryPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Restore points state
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([])
  const [restorePointsLoading, setRestorePointsLoading] = useState(false)
  const [restorePointsPagination, setRestorePointsPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Filter state
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
    search: ''
  })

  // Dialog state
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)
  const [showCreateRestoreDialog, setShowCreateRestoreDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<ChangeHistory | null>(null)
  const [selectedRestorePoint, setSelectedRestorePoint] = useState<RestorePoint | null>(null)
  const [rollbackReason, setRollbackReason] = useState('')
  const [restorePointForm, setRestorePointForm] = useState({
    name: '',
    description: ''
  })

  // 변경 이력 로드
  const loadHistory = async (page = 1) => {
    setHistoryLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const response = await fetch(`/api/admin/history?${params}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
        setHistoryPagination(data.pagination)
      } else {
        toast({
        title: "오류",
        description: "변경 이력을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
      }
    } catch (error) {
      console.error('Error loading history:', error)
      toast({
        title: "오류",
        description: "변경 이력을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  // 복원 지점 로드
  const loadRestorePoints = async (page = 1) => {
    setRestorePointsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/admin/history/restore-points?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRestorePoints(data.restorePoints)
        setRestorePointsPagination(data.pagination)
      } else {
        toast({
        title: "오류",
        description: "복원 지점을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
      }
    } catch (error) {
      console.error('Error loading restore points:', error)
      toast({
        title: "오류",
        description: "복원 지점을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setRestorePointsLoading(false)
    }
  }

  // 롤백 실행
  const handleRollback = async () => {
    if (!selectedHistory) return

    try {
      const response = await fetch('/api/admin/history/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId: selectedHistory.id,
          reason: rollbackReason
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
        title: "성공",
        description: "성공적으로 롤백되었습니다."
      })
        setShowRollbackDialog(false)
        setSelectedHistory(null)
        setRollbackReason('')
        loadHistory(historyPagination.currentPage)
      } else {
        const error = await response.json()
        toast({
        title: "오류",
        description: error.error || "롤백에 실패했습니다.",
        variant: "destructive"
      })
      }
    } catch (error) {
      console.error('Error rolling back:', error)
      toast({
        title: "오류",
        description: "롤백에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 복원 지점 생성
  const handleCreateRestorePoint = async () => {
    if (!restorePointForm.name.trim()) {
      toast({
        title: "오류",
        description: "이름을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/admin/history/restore-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restorePointForm)
      })

      if (response.ok) {
        toast({
        title: "성공",
        description: "복원 지점이 생성되었습니다."
      })
        setShowCreateRestoreDialog(false)
        setRestorePointForm({ name: '', description: '' })
        loadRestorePoints(restorePointsPagination.currentPage)
      } else {
        const error = await response.json()
        toast({
        title: "오류",
        description: error.error || "복원 지점 생성에 실패했습니다.",
        variant: "destructive"
      })
      }
    } catch (error) {
      console.error('Error creating restore point:', error)
      toast({
        title: "오류",
        description: "복원 지점 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 복원 실행
  const handleRestore = async () => {
    if (!selectedRestorePoint) return

    try {
      const response = await fetch(`/api/admin/history/restore-points/${selectedRestorePoint.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmRestore: true })
      })

      if (response.ok) {
        toast({
        title: "성공",
        description: "성공적으로 복원되었습니다."
      })
        setShowRestoreDialog(false)
        setSelectedRestorePoint(null)
        // 페이지 새로고침으로 변경사항 반영
        window.location.reload()
      } else {
        const error = await response.json()
        toast({
        title: "오류",
        description: error.error || "복원에 실패했습니다.",
        variant: "destructive"
      })
      }
    } catch (error) {
      console.error('Error restoring:', error)
      toast({
        title: "오류",
        description: "복원에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 엔티티 타입 한글화
  const getEntityTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'SiteSection': '사이트 섹션',
      'SiteSettings': '사이트 설정',
      'AnnouncementBanner': '공지 배너',
      'FloatingButton': '플로팅 버튼',
      'SEOSettings': 'SEO 설정',
      'Popup': '팝업',
      'PopupTemplate': '팝업 템플릿',
      'RestorePoint': '복원 지점'
    }
    return labels[type] || type
  }

  // 액션 한글화
  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'CREATE': '생성',
      'UPDATE': '수정',
      'DELETE': '삭제',
      'RESTORE': '복원'
    }
    return labels[action] || action
  }

  // 액션 배지 색상
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE': return 'default'
      case 'UPDATE': return 'secondary'
      case 'DELETE': return 'destructive'
      case 'RESTORE': return 'outline'
      default: return 'outline'
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    } else if (activeTab === 'restore-points') {
      loadRestorePoints()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory(1)
    }
  }, [filters])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">변경 이력 관리</h1>
        <p className="text-muted-foreground">사이트 변경 내역을 확인하고 이전 상태로 롤백할 수 있습니다.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">변경 이력</TabsTrigger>
          <TabsTrigger value="restore-points">복원 지점</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>변경 이력</CardTitle>
                  <CardDescription>
                    사이트의 모든 변경 사항이 기록됩니다.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateRestoreDialog(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  복원 지점 생성
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 필터 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Select
                  value={filters.entityType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, entityType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="엔티티 타입" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    <SelectItem value="SiteSection">사이트 섹션</SelectItem>
                    <SelectItem value="SiteSettings">사이트 설정</SelectItem>
                    <SelectItem value="AnnouncementBanner">공지 배너</SelectItem>
                    <SelectItem value="FloatingButton">플로팅 버튼</SelectItem>
                    <SelectItem value="SEOSettings">SEO 설정</SelectItem>
                    <SelectItem value="Popup">팝업</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.action}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="액션" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    <SelectItem value="CREATE">생성</SelectItem>
                    <SelectItem value="UPDATE">수정</SelectItem>
                    <SelectItem value="DELETE">삭제</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="시작 날짜"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />

                <Input
                  placeholder="종료 날짜"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ entityType: '', action: '', startDate: '', endDate: '', search: '' })}
                  >
                    초기화
                  </Button>
                </div>
              </div>

              {/* 변경 이력 테이블 */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시간</TableHead>
                    <TableHead>엔티티</TableHead>
                    <TableHead>액션</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>버전</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        로딩 중...
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        변경 이력이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(item.createdAt), 'MM-dd HH:mm', { locale: ko })}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{getEntityTypeLabel(item.entityType)}</div>
                            <div className="text-xs text-muted-foreground font-mono">{item.entityId.slice(-8)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(item.action)}>
                            {getActionLabel(item.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.description || `${getEntityTypeLabel(item.entityType)} ${getActionLabel(item.action)}`}
                        </TableCell>
                        <TableCell>v{item.changeVersion}</TableCell>
                        <TableCell>
                          {item.rollbacks.length > 0 ? (
                            <Badge variant="outline" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              롤백됨
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              활성
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={item.rollbacks.length > 0}
                              onClick={() => {
                                setSelectedHistory(item)
                                setShowRollbackDialog(true)
                              }}
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  총 {historyPagination.totalCount}개 중 {((historyPagination.currentPage - 1) * 20) + 1}-{Math.min(historyPagination.currentPage * 20, historyPagination.totalCount)}개
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!historyPagination.hasPrevPage || historyLoading}
                    onClick={() => loadHistory(historyPagination.currentPage - 1)}
                  >
                    이전
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!historyPagination.hasNextPage || historyLoading}
                    onClick={() => loadHistory(historyPagination.currentPage + 1)}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore-points" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>복원 지점</CardTitle>
                  <CardDescription>
                    전체 사이트 구성을 저장하고 복원할 수 있습니다.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateRestoreDialog(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  복원 지점 생성
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead>타입</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restorePointsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        로딩 중...
                      </TableCell>
                    </TableRow>
                  ) : restorePoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        복원 지점이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    restorePoints.map((point) => (
                      <TableRow key={point.id}>
                        <TableCell className="font-medium">{point.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{point.description || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(point.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={point.isAutomatic ? 'secondary' : 'default'}>
                            {point.isAutomatic ? '자동' : '수동'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRestorePoint(point)
                                setShowRestoreDialog(true)
                              }}
                            >
                              <Upload className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  총 {restorePointsPagination.totalCount}개 중 {((restorePointsPagination.currentPage - 1) * 20) + 1}-{Math.min(restorePointsPagination.currentPage * 20, restorePointsPagination.totalCount)}개
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!restorePointsPagination.hasPrevPage || restorePointsLoading}
                    onClick={() => loadRestorePoints(restorePointsPagination.currentPage - 1)}
                  >
                    이전
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!restorePointsPagination.hasNextPage || restorePointsLoading}
                    onClick={() => loadRestorePoints(restorePointsPagination.currentPage + 1)}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 롤백 확인 다이얼로그 */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              변경사항 롤백
            </DialogTitle>
            <DialogDescription>
              이 작업은 되돌릴 수 없습니다. 정말로 롤백하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">엔티티:</span> {getEntityTypeLabel(selectedHistory.entityType)}</div>
                  <div><span className="font-medium">액션:</span> {getActionLabel(selectedHistory.action)}</div>
                  <div><span className="font-medium">시간:</span> {format(new Date(selectedHistory.createdAt), 'yyyy-MM-dd HH:mm')}</div>
                  <div><span className="font-medium">버전:</span> v{selectedHistory.changeVersion}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollback-reason">롤백 사유 (선택사항)</Label>
                <Textarea
                  id="rollback-reason"
                  placeholder="롤백 사유를 입력해주세요..."
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleRollback}>
              롤백 실행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 복원 지점 생성 다이얼로그 */}
      <Dialog open={showCreateRestoreDialog} onOpenChange={setShowCreateRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>복원 지점 생성</DialogTitle>
            <DialogDescription>
              현재 사이트 구성을 복원 지점으로 저장합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restore-name">이름 *</Label>
              <Input
                id="restore-name"
                placeholder="복원 지점 이름을 입력하세요"
                value={restorePointForm.name}
                onChange={(e) => setRestorePointForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-description">설명</Label>
              <Textarea
                id="restore-description"
                placeholder="복원 지점에 대한 설명을 입력하세요"
                value={restorePointForm.description}
                onChange={(e) => setRestorePointForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRestoreDialog(false)}>
              취소
            </Button>
            <Button onClick={handleCreateRestorePoint}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 복원 확인 다이얼로그 */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              사이트 복원
            </DialogTitle>
            <DialogDescription>
              이 작업은 전체 사이트를 선택한 복원 지점으로 되돌립니다. 현재 상태는 자동으로 백업됩니다.
            </DialogDescription>
          </DialogHeader>
          {selectedRestorePoint && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">복원 지점:</span> {selectedRestorePoint.name}</div>
                  <div><span className="font-medium">설명:</span> {selectedRestorePoint.description || '-'}</div>
                  <div><span className="font-medium">생성일:</span> {format(new Date(selectedRestorePoint.createdAt), 'yyyy-MM-dd HH:mm')}</div>
                  <div><span className="font-medium">타입:</span> {selectedRestorePoint.isAutomatic ? '자동' : '수동'}</div>
                </div>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>주의:</strong> 이 작업은 되돌릴 수 없으며, 현재 사이트의 모든 설정과 콘텐츠가 복원 지점의 상태로 변경됩니다.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleRestore}>
              복원 실행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}