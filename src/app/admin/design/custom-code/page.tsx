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
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Code,
  Eye,
  AlertTriangle,
  Shield,
  ArrowLeft,
  Copy,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  Info
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
  { value: 'head', label: '<head> 태그 내', description: 'Google Analytics, Meta Pixel 등' },
  { value: 'before_closing_head', label: '</head> 태그 직전', description: 'CSS 스타일시트' },
  { value: 'after_opening_body', label: '<body> 태그 직후', description: 'GTM noscript' },
  { value: 'body_start', label: 'Body 시작', description: '초기 로딩 스크립트' },
  { value: 'body_end', label: 'Body 종료', description: '채널톡, 카카오 상담' }
]

// 빠른 추가 템플릿
const CODE_TEMPLATES = [
  {
    name: 'Google Analytics 4',
    type: 'javascript' as const,
    position: 'head',
    code: `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`,
    description: 'Google Analytics 4 추적 코드'
  },
  {
    name: 'Meta Pixel',
    type: 'javascript' as const,
    position: 'head',
    code: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>`,
    description: 'Facebook/Meta 픽셀 추적 코드'
  },
  {
    name: '채널톡',
    type: 'javascript' as const,
    position: 'body_end',
    code: `<script>
(function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();

ChannelIO('boot', {
  "pluginKey": "YOUR_PLUGIN_KEY"
});
</script>`,
    description: '채널톡 채팅 위젯'
  },
  {
    name: '카카오 채널',
    type: 'javascript' as const,
    position: 'body_end',
    code: `<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.1.0/kakao.min.js" integrity="sha384-dpu02ieKC6NUeKFoGMOKz6102CLEWi9+5RQjWSV0ikYSFFd8M3Wp2reIcquJOemx" crossorigin="anonymous"></script>
<script>
  Kakao.init('YOUR_JAVASCRIPT_KEY');
  Kakao.Channel.createChatButton({
    container: '#kakao-talk-channel-chat-button',
    channelPublicId: '_YOUR_CHANNEL_ID'
  });
</script>
<div id="kakao-talk-channel-chat-button"></div>`,
    description: '카카오 채널 상담 버튼'
  },
  {
    name: '네이버 애널리틱스',
    type: 'javascript' as const,
    position: 'head',
    code: `<script type="text/javascript" src="//wcs.naver.net/wcslog.js"></script>
<script type="text/javascript">
if(!wcs_add) var wcs_add = {};
wcs_add["wa"] = "YOUR_ACCOUNT_ID";
if(window.wcs) {
  wcs_do();
}
</script>`,
    description: '네이버 애널리틱스 추적 코드'
  },
  {
    name: '커스텀 CSS',
    type: 'css' as const,
    position: 'before_closing_head',
    code: `/* 커스텀 CSS 스타일 */
:root {
  --custom-color: #3B82F6;
}

.custom-class {
  /* 스타일 작성 */
}`,
    description: '사용자 정의 CSS 스타일시트'
  }
]

export default function DesignCustomCodePage() {
  const { toast } = useToast()

  const [codes, setCodes] = useState<CustomCode[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedCode, setSelectedCode] = useState<CustomCode | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // 필터 상태
  const [filters, setFilters] = useState({
    type: '',
    position: ''
  })

  // 폼 데이터
  const [formData, setFormData] = useState<CodeFormData>({
    name: '',
    description: '',
    type: 'javascript',
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
    isTrusted: true,
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

  // 활성화 토글
  const handleToggleActive = async (code: CustomCode) => {
    try {
      const response = await fetch(`/api/admin/custom-code/${code.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !code.isActive })
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: `코드가 ${!code.isActive ? '활성화' : '비활성화'}되었습니다.`
        })
        loadCustomCodes()
      }
    } catch (error) {
      console.error('Error toggling code:', error)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'javascript',
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
      isTrusted: true,
      isActive: true,
      isDevelopment: false
    })
    setSecurityWarnings([])
  }

  // 템플릿 선택
  const handleSelectTemplate = (template: typeof CODE_TEMPLATES[0]) => {
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      type: template.type,
      code: template.code,
      position: template.position
    })
    setShowTemplateDialog(false)
    setShowCreateDialog(true)
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

  // 코드 복사
  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  useEffect(() => {
    loadCustomCodes()
  }, [])

  useEffect(() => {
    loadCustomCodes()
  }, [filters])

  // 위치별 코드 그룹화
  const groupedCodes = POSITION_OPTIONS.reduce((acc, pos) => {
    acc[pos.value] = codes.filter(c => c.position === pos.value)
    return acc
  }, {} as Record<string, CustomCode[]>)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/design">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">커스텀 코드 삽입</h1>
            <p className="text-muted-foreground">
              분석 스크립트, 채팅 위젯, 커스텀 CSS 등을 삽입할 수 있습니다.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
            <Code className="h-4 w-4 mr-2" />
            템플릿에서 추가
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            직접 추가
          </Button>
        </div>
      </div>

      {/* 가이드 카드 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-blue-900">삽입 위치 안내</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">head</Badge>
                  <span>GA, Meta Pixel 등 분석 코드</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">body_start</Badge>
                  <span>GTM noscript, 초기 스크립트</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">body_end</Badge>
                  <span>채널톡, 카카오 상담 위젯</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 위치별 코드 섹션 */}
      <Tabs defaultValue="head" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {POSITION_OPTIONS.map(pos => (
            <TabsTrigger key={pos.value} value={pos.value} className="text-xs">
              {pos.label.replace(/<|>/g, '')}
              {groupedCodes[pos.value]?.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {groupedCodes[pos.value].length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {POSITION_OPTIONS.map(pos => (
          <TabsContent key={pos.value} value={pos.value}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{pos.label}</CardTitle>
                <CardDescription>{pos.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {groupedCodes[pos.value]?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    이 위치에 등록된 코드가 없습니다.
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, position: pos.value }))
                          setShowCreateDialog(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        코드 추가
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedCodes[pos.value].map(code => (
                      <div
                        key={code.id}
                        className={`border rounded-lg p-4 ${code.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={code.isActive}
                              onCheckedChange={() => handleToggleActive(code)}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{code.name}</span>
                                <Badge variant={getTypeBadgeVariant(code.type)}>
                                  {code.type.toUpperCase()}
                                </Badge>
                                {code.isTrusted && (
                                  <Shield className="h-4 w-4 text-green-600" />
                                )}
                                {!code.hashVerified && (
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                )}
                              </div>
                              {code.description && (
                                <p className="text-sm text-muted-foreground">{code.description}</p>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                로드: {code.loadCount.toLocaleString()}회
                                {code.errorCount > 0 && (
                                  <span className="text-red-600 ml-2">오류: {code.errorCount}회</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCode(code.code, code.id)}
                            >
                              {copiedCode === code.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedCode(code)
                                setShowPreviewDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(code)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedCode(code)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* 템플릿 선택 다이얼로그 */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>템플릿에서 추가</DialogTitle>
            <DialogDescription>
              자주 사용하는 코드 템플릿을 선택하세요. 선택 후 필요한 값을 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {CODE_TEMPLATES.map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant={getTypeBadgeVariant(template.type)}>
                      {template.type.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    삽입 위치: {POSITION_OPTIONS.find(p => p.value === template.position)?.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 코드 생성/편집 다이얼로그 */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? '코드 수정' : '새 코드 추가'}</DialogTitle>
            <DialogDescription>
              {showEditDialog ? '커스텀 코드를 수정합니다.' : 'CSS, JavaScript 또는 HTML 코드를 추가합니다.'}
            </DialogDescription>
          </DialogHeader>

          {securityWarnings.length > 0 && (
            <Alert variant="destructive">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="code">코드</TabsTrigger>
              <TabsTrigger value="advanced">고급 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    placeholder="예: Google Analytics 4"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
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
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Input
                  id="description"
                  placeholder="코드에 대한 간단한 설명"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
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
                        {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">우선순위 (0-999, 높을수록 먼저 로드)</Label>
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
                  placeholder={
                    formData.type === 'css' ? '/* CSS 코드를 입력하세요 */\n.my-class { color: red; }' :
                    formData.type === 'javascript' ? '<!-- JavaScript 코드를 입력하세요 -->\n<script>\n  console.log("Hello");\n</script>' :
                    '<!-- HTML 코드를 입력하세요 -->\n<div>Hello World</div>'
                  }
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  rows={15}
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
                    <Label htmlFor="async">비동기 (async)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="defer"
                      checked={formData.defer}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, defer: checked }))}
                    />
                    <Label htmlFor="defer">지연 로딩 (defer)</Label>
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
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetPages">대상 페이지 (빈값=전체)</Label>
                  <Input
                    id="targetPages"
                    placeholder="/, /about, /contact"
                    value={formData.targetPages}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetPages: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">쉼표로 구분</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excludePages">제외 페이지</Label>
                  <Input
                    id="excludePages"
                    placeholder="/admin, /login"
                    value={formData.excludePages}
                    onChange={(e) => setFormData(prev => ({ ...prev, excludePages: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">쉼표로 구분</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDevices">대상 디바이스</Label>
                <Input
                  id="targetDevices"
                  placeholder="desktop, mobile, tablet"
                  value={formData.targetDevices}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDevices: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isScheduled"
                  checked={formData.isScheduled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isScheduled: checked }))}
                />
                <Label htmlFor="isScheduled">기간 설정 사용</Label>
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

              <div className="flex items-center space-x-4">
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
                  <Label htmlFor="isDevelopment">개발 모드에서만</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              setShowEditDialog(false)
              resetForm()
            }}>
              취소
            </Button>
            <Button onClick={showEditDialog ? handleEditCode : handleCreateCode}>
              {showEditDialog ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 코드 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>코드 상세</DialogTitle>
            <DialogDescription>
              {selectedCode?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCode && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">타입</div>
                  <Badge variant={getTypeBadgeVariant(selectedCode.type)}>
                    {selectedCode.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">위치</div>
                  <div>{POSITION_OPTIONS.find(p => p.value === selectedCode.position)?.label}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">상태</div>
                  <Badge variant={selectedCode.isActive ? 'default' : 'secondary'}>
                    {selectedCode.isActive ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">로드 횟수</div>
                  <div className="font-medium">{selectedCode.loadCount.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">오류 횟수</div>
                  <div className={`font-medium ${selectedCode.errorCount > 0 ? 'text-red-600' : ''}`}>
                    {selectedCode.errorCount}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">우선순위</div>
                  <div className="font-medium">{selectedCode.priority}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>코드</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCode(selectedCode.code, selectedCode.id)}
                  >
                    {copiedCode === selectedCode.id ? (
                      <><Check className="h-4 w-4 mr-2" /> 복사됨</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-2" /> 복사</>
                    )}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-80 font-mono">
                  <code>{selectedCode.code}</code>
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              닫기
            </Button>
            <Button onClick={() => {
              setShowPreviewDialog(false)
              if (selectedCode) openEditDialog(selectedCode)
            }}>
              수정
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
              정말로 이 코드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedCode && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">{selectedCode.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedCode.type.toUpperCase()} - {POSITION_OPTIONS.find(p => p.value === selectedCode.position)?.label}
              </div>
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
