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
import { SelectRoot as Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Edit,
  Trash2,
  Code,
  Play,
  Eye,
  AlertTriangle,
  Shield,
  Clock,
  Target,
  Zap,
  Activity,
  FileText,
  Globe,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// 타입 정의
interface CustomCode {
  id: string
  name: string
  description?: string
  type: 'css' | 'javascript' | 'html'
  code: string
  language?: string
  position: string
  priority: number
  conditionalLoad: boolean
  conditions?: any
  targetPages?: string
  excludePages?: string
  targetDevices?: string
  targetRoles?: string
  isScheduled: boolean
  startDate?: string
  endDate?: string
  async: boolean
  defer: boolean
  preload: boolean
  version: string
  changelog?: string
  isTrusted: boolean
  hashVerified: boolean
  codeHash?: string
  isActive: boolean
  isDevelopment: boolean
  loadCount: number
  errorCount: number
  lastLoaded?: string
  lastError?: string
  createdAt: string
  updatedAt: string
  _count?: {
    executions: number
  }
}

interface CodeFormData {
  name: string
  description: string
  type: 'css' | 'javascript' | 'html'
  code: string
  language: string
  position: string
  priority: number
  conditionalLoad: boolean
  targetPages: string
  excludePages: string
  targetDevices: string
  targetRoles: string
  isScheduled: boolean
  startDate: string
  endDate: string
  async: boolean
  defer: boolean
  preload: boolean
  version: string
  changelog: string
  isTrusted: boolean
  isActive: boolean
  isDevelopment: boolean
}

const POSITION_OPTIONS = [
  { value: 'head', label: '<head> 태그 내' },
  { value: 'before_closing_head', label: '</head> 태그 직전' },
  { value: 'after_opening_body', label: '<body> 태그 직후' },
  { value: 'body_start', label: 'Body 시작' },
  { value: 'body_end', label: 'Body 종료' }
]

const DEVICE_OPTIONS = [
  { value: 'desktop', label: '데스크톱', icon: Monitor },
  { value: 'mobile', label: '모바일', icon: Smartphone },
  { value: 'tablet', label: '태블릿', icon: Tablet }
]

const ROLE_OPTIONS = [
  { value: 'USER', label: '일반 사용자' },
  { value: 'ADMIN', label: '관리자' },
  { value: 'SUPER_ADMIN', label: '슈퍼 관리자' }
]

export default function CustomCodePage() {
  const { toast } = useToast()

  const [codes, setCodes] = useState<CustomCode[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedCode, setSelectedCode] = useState<CustomCode | null>(null)

  // 필터 상태
  const [filters, setFilters] = useState({
    type: '',
    position: '',
    isActive: ''
  })

  // 폼 데이터
  const [formData, setFormData] = useState<CodeFormData>({
    name: '',
    description: '',
    type: 'css',
    code: '',
    language: '',
    position: 'head',
    priority: 0,
    conditionalLoad: false,
    targetPages: '',
    excludePages: '',
    targetDevices: '',
    targetRoles: '',
    isScheduled: false,
    startDate: '',
    endDate: '',
    async: false,
    defer: false,
    preload: false,
    version: '1.0.0',
    changelog: '',
    isTrusted: false,
    isActive: true,
    isDevelopment: false
  })

  // 보안 경고
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([])

  // 커스텀 코드 목록 로드
  const loadCustomCodes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.position) params.append('position', filters.position)

      const response = await fetch(`/api/admin/custom-code?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCodes(data.customCodes)
      } else {
        toast({
          title: "오류",
          description: "커스텀 코드 목록을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading custom codes:', error)
      toast({
        title: "오류",
        description: "커스텀 코드 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 커스텀 코드 생성
  const handleCreateCode = async () => {
    try {
      // JSON 배열 변환
      const processedData = {
        ...formData,
        targetPages: formData.targetPages ? JSON.stringify(formData.targetPages.split(',').map(p => p.trim())) : undefined,
        excludePages: formData.excludePages ? JSON.stringify(formData.excludePages.split(',').map(p => p.trim())) : undefined,
        targetDevices: formData.targetDevices ? JSON.stringify(formData.targetDevices.split(',').map(d => d.trim())) : undefined,
        targetRoles: formData.targetRoles ? JSON.stringify(formData.targetRoles.split(',').map(r => r.trim())) : undefined
      }

      const response = await fetch('/api/admin/custom-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "성공",
          description: "커스텀 코드가 생성되었습니다."
        })

        if (result.securityWarnings?.length > 0) {
          setSecurityWarnings(result.securityWarnings)
        }

        setShowCreateDialog(false)
        resetForm()
        loadCustomCodes()
      } else {
        const error = await response.json()
        toast({
          title: "오류",
          description: error.error || "커스텀 코드 생성에 실패했습니다.",
          variant: "destructive"
        })

        if (error.warnings) {
          setSecurityWarnings(error.warnings)
        }
      }
    } catch (error) {
      console.error('Error creating custom code:', error)
      toast({
        title: "오류",
        description: "커스텀 코드 생성에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 커스텀 코드 수정
  const handleEditCode = async () => {
    if (!selectedCode) return

    try {
      const processedData = {
        ...formData,
        targetPages: formData.targetPages ? JSON.stringify(formData.targetPages.split(',').map(p => p.trim())) : undefined,
        excludePages: formData.excludePages ? JSON.stringify(formData.excludePages.split(',').map(p => p.trim())) : undefined,
        targetDevices: formData.targetDevices ? JSON.stringify(formData.targetDevices.split(',').map(d => d.trim())) : undefined,
        targetRoles: formData.targetRoles ? JSON.stringify(formData.targetRoles.split(',').map(r => r.trim())) : undefined
      }

      const response = await fetch(`/api/admin/custom-code/${selectedCode.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "커스텀 코드가 수정되었습니다."
        })
        setShowEditDialog(false)
        setSelectedCode(null)
        resetForm()
        loadCustomCodes()
      } else {
        const error = await response.json()
        toast({
          title: "오류",
          description: error.error || "커스텀 코드 수정에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error editing custom code:', error)
      toast({
        title: "오류",
        description: "커스텀 코드 수정에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 커스텀 코드 삭제
  const handleDeleteCode = async () => {
    if (!selectedCode) return

    try {
      const response = await fetch(`/api/admin/custom-code/${selectedCode.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "커스텀 코드가 삭제되었습니다."
        })
        setShowDeleteDialog(false)
        setSelectedCode(null)
        loadCustomCodes()
      } else {
        const error = await response.json()
        toast({
          title: "오류",
          description: error.error || "커스텀 코드 삭제에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting custom code:', error)
      toast({
        title: "오류",
        description: "커스텀 코드 삭제에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'css',
      code: '',
      language: '',
      position: 'head',
      priority: 0,
      conditionalLoad: false,
      targetPages: '',
      excludePages: '',
      targetDevices: '',
      targetRoles: '',
      isScheduled: false,
      startDate: '',
      endDate: '',
      async: false,
      defer: false,
      preload: false,
      version: '1.0.0',
      changelog: '',
      isTrusted: false,
      isActive: true,
      isDevelopment: false
    })
    setSecurityWarnings([])
  }

  // 편집 시 폼 데이터 설정
  const openEditDialog = (code: CustomCode) => {
    setSelectedCode(code)
    setFormData({
      name: code.name,
      description: code.description || '',
      type: code.type,
      code: code.code,
      language: code.language || '',
      position: code.position,
      priority: code.priority,
      conditionalLoad: code.conditionalLoad,
      targetPages: code.targetPages ? JSON.parse(code.targetPages).join(', ') : '',
      excludePages: code.excludePages ? JSON.parse(code.excludePages).join(', ') : '',
      targetDevices: code.targetDevices ? JSON.parse(code.targetDevices).join(', ') : '',
      targetRoles: code.targetRoles ? JSON.parse(code.targetRoles).join(', ') : '',
      isScheduled: code.isScheduled,
      startDate: code.startDate ? code.startDate.split('T')[0] : '',
      endDate: code.endDate ? code.endDate.split('T')[0] : '',
      async: code.async,
      defer: code.defer,
      preload: code.preload,
      version: code.version,
      changelog: code.changelog || '',
      isTrusted: code.isTrusted,
      isActive: code.isActive,
      isDevelopment: code.isDevelopment
    })
    setShowEditDialog(true)
  }

  // 코드 타입별 배지 색상
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'css': return 'default'
      case 'javascript': return 'secondary'
      case 'html': return 'outline'
      default: return 'outline'
    }
  }

  useEffect(() => {
    loadCustomCodes()
  }, [])

  useEffect(() => {
    loadCustomCodes()
  }, [filters])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">커스텀 코드 관리</h1>
        <p className="text-muted-foreground">사이트에 CSS, JavaScript, HTML을 삽입하여 기능을 확장할 수 있습니다.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>커스텀 코드 목록</CardTitle>
              <CardDescription>
                등록된 커스텀 코드를 확인하고 관리할 수 있습니다.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              새 코드 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 필터 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="코드 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.position}
              onValueChange={(value) => setFilters(prev => ({ ...prev, position: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="삽입 위치" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {POSITION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ type: '', position: '', isActive: '' })}
            >
              필터 초기화
            </Button>
          </div>

          {/* 커스텀 코드 테이블 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>통계</TableHead>
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
              ) : codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    등록된 커스텀 코드가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {code.name}
                          {!code.hashVerified && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          {code.isTrusted && (
                            <Shield className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {code.description && (
                          <div className="text-xs text-muted-foreground">
                            {code.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(code.type)}>
                        {code.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {POSITION_OPTIONS.find(p => p.value === code.position)?.label || code.position}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {code.isActive ? (
                          <Badge variant="default">활성</Badge>
                        ) : (
                          <Badge variant="secondary">비활성</Badge>
                        )}
                        {code.isDevelopment && (
                          <Badge variant="outline" className="text-xs">개발</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>로드: {code.loadCount.toLocaleString()}</div>
                        {code.errorCount > 0 && (
                          <div className="text-red-600">오류: {code.errorCount}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCode(code)
                            setShowPreviewDialog(true)
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(code)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCode(code)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 코드 생성 다이얼로그 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 커스텀 코드 추가</DialogTitle>
            <DialogDescription>
              새로운 CSS, JavaScript 또는 HTML 코드를 추가합니다.
            </DialogDescription>
          </DialogHeader>

          {securityWarnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>보안 경고:</div>
                <ul className="list-disc list-inside mt-2">
                  {securityWarnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="code">코드</TabsTrigger>
              <TabsTrigger value="targeting">타겟팅</TabsTrigger>
              <TabsTrigger value="advanced">고급 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    placeholder="코드 이름"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">버전</Label>
                  <Input
                    id="version"
                    placeholder="1.0.0"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="코드에 대한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">코드 타입 *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'css' | 'javascript' | 'html' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">삽입 위치 *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITION_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">우선순위 (0-999)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="999"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">코드 *</Label>
                <Textarea
                  id="code"
                  placeholder={formData.type === 'css' ? '.my-class { color: red; }' :
                              formData.type === 'javascript' ? 'console.log("Hello World");' :
                              '<div>Hello World</div>'}
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              {formData.type === 'javascript' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="async"
                      checked={formData.async}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, async: checked }))}
                    />
                    <Label htmlFor="async">비동기 로딩</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="defer"
                      checked={formData.defer}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, defer: checked }))}
                    />
                    <Label htmlFor="defer">지연 로딩</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isTrusted"
                      checked={formData.isTrusted}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTrusted: checked }))}
                    />
                    <Label htmlFor="isTrusted">신뢰할 수 있는 코드</Label>
                  </div>
                </div>
              )}

              {formData.type === 'css' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="preload"
                    checked={formData.preload}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, preload: checked }))}
                  />
                  <Label htmlFor="preload">프리로드</Label>
                </div>
              )}
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetPages">대상 페이지 (쉼표로 구분)</Label>
                <Input
                  id="targetPages"
                  placeholder="/, /about, /contact"
                  value={formData.targetPages}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetPages: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excludePages">제외 페이지 (쉼표로 구분)</Label>
                <Input
                  id="excludePages"
                  placeholder="/admin, /login"
                  value={formData.excludePages}
                  onChange={(e) => setFormData(prev => ({ ...prev, excludePages: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDevices">대상 디바이스 (쉼표로 구분)</Label>
                <Input
                  id="targetDevices"
                  placeholder="desktop, mobile, tablet"
                  value={formData.targetDevices}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDevices: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRoles">대상 권한 (쉼표로 구분)</Label>
                <Input
                  id="targetRoles"
                  placeholder="USER, ADMIN, SUPER_ADMIN"
                  value={formData.targetRoles}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetRoles: e.target.value }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isScheduled"
                  checked={formData.isScheduled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isScheduled: checked }))}
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
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">활성화</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDevelopment"
                  checked={formData.isDevelopment}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDevelopment: checked }))}
                />
                <Label htmlFor="isDevelopment">개발 모드에서만 적용</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="changelog">변경 로그</Label>
                <Textarea
                  id="changelog"
                  placeholder="변경 사항에 대한 설명을 입력하세요"
                  value={formData.changelog}
                  onChange={(e) => setFormData(prev => ({ ...prev, changelog: e.target.value }))}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              resetForm()
            }}>
              취소
            </Button>
            <Button onClick={handleCreateCode}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 코드 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>코드 미리보기</DialogTitle>
            <DialogDescription>
              {selectedCode?.name}의 상세 정보와 코드를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedCode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>타입:</strong> {selectedCode.type.toUpperCase()}</div>
                <div><strong>위치:</strong> {POSITION_OPTIONS.find(p => p.value === selectedCode.position)?.label}</div>
                <div><strong>우선순위:</strong> {selectedCode.priority}</div>
                <div><strong>버전:</strong> {selectedCode.version}</div>
                <div><strong>로드 횟수:</strong> {selectedCode.loadCount.toLocaleString()}</div>
                <div><strong>오류 횟수:</strong> {selectedCode.errorCount}</div>
              </div>

              <div className="space-y-2">
                <Label>코드</Label>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  <code>{selectedCode.code}</code>
                </pre>
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

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>코드 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 커스텀 코드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedCode && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">{selectedCode.name}</div>
              <div className="text-sm text-muted-foreground">{selectedCode.type.toUpperCase()}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteCode}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}