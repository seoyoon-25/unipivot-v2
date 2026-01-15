'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Settings,
  Globe,
  FileText,
  Eye,
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SeoSetting {
  id: string
  pageKey: string
  pageName: string
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogImageAlt?: string
  ogType?: string
  ogUrl?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterImageAlt?: string
  twitterSite?: string
  twitterCreator?: string
  schemaType?: string
  schemaData?: string
  customHead?: string
  robots?: string
  isActive: boolean
  priority: number
  updatedAt: string
}

interface GlobalSeoSettings {
  'site-info': {
    id: string
    siteName?: string
    siteDescription?: string
    siteUrl?: string
    defaultImage?: string
    twitterHandle?: string
    facebookPage?: string
    linkedinPage?: string
    youtubeChannel?: string
    googleSiteVerification?: string
    googleAnalyticsId?: string
    googleTagManagerId?: string
    naverSiteVerification?: string
    bingSiteVerification?: string
    robotsTxt?: string
    sitemapEnabled: boolean
    sitemapPriority: number
    sitemapChangefreq: string
    updatedAt: string
  }
}

interface SeoMetadataPreview {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  robots?: string
  openGraph: {
    title?: string
    description?: string
    image?: string
    imageAlt?: string
    type?: string
    url?: string
    siteName?: string
  }
  twitter: {
    card?: string
    title?: string
    description?: string
    image?: string
    imageAlt?: string
    site?: string
    creator?: string
  }
  schema?: object
  customHead?: string
}

export default function SeoAdminPage() {
  const [seoSettings, setSeoSettings] = useState<SeoSetting[]>([])
  const [globalSettings, setGlobalSettings] = useState<GlobalSeoSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [selectedSetting, setSelectedSetting] = useState<SeoSetting | null>(null)
  const [previewData, setPreviewData] = useState<SeoMetadataPreview | null>(null)
  const [globalFormData, setGlobalFormData] = useState({
    settingKey: 'site-info',
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    defaultImage: '',
    twitterHandle: '',
    facebookPage: '',
    linkedinPage: '',
    youtubeChannel: '',
    googleSiteVerification: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    naverSiteVerification: '',
    bingSiteVerification: '',
    robotsTxt: '',
    sitemapEnabled: true,
    sitemapPriority: 0.5,
    sitemapChangefreq: 'weekly'
  })
  const [settingFormData, setSettingFormData] = useState({
    pageKey: '',
    pageName: '',
    title: '',
    description: '',
    keywords: '',
    canonical: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImageAlt: '',
    ogType: 'website',
    ogUrl: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterImageAlt: '',
    twitterSite: '',
    twitterCreator: '',
    schemaType: '',
    schemaData: '',
    customHead: '',
    robots: 'index,follow',
    isActive: true,
    priority: 0
  })

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [settingsRes, globalRes] = await Promise.all([
        fetch('/api/admin/seo/settings'),
        fetch('/api/admin/seo/global')
      ])

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSeoSettings(settingsData.settings || [])
      }

      if (globalRes.ok) {
        const globalData = await globalRes.json()
        setGlobalSettings(globalData.settings || null)
        if (globalData.settings?.['site-info']) {
          setGlobalFormData({
            settingKey: 'site-info',
            siteName: globalData.settings['site-info'].siteName || '',
            siteDescription: globalData.settings['site-info'].siteDescription || '',
            siteUrl: globalData.settings['site-info'].siteUrl || '',
            defaultImage: globalData.settings['site-info'].defaultImage || '',
            twitterHandle: globalData.settings['site-info'].twitterHandle || '',
            facebookPage: globalData.settings['site-info'].facebookPage || '',
            linkedinPage: globalData.settings['site-info'].linkedinPage || '',
            youtubeChannel: globalData.settings['site-info'].youtubeChannel || '',
            googleSiteVerification: globalData.settings['site-info'].googleSiteVerification || '',
            googleAnalyticsId: globalData.settings['site-info'].googleAnalyticsId || '',
            googleTagManagerId: globalData.settings['site-info'].googleTagManagerId || '',
            naverSiteVerification: globalData.settings['site-info'].naverSiteVerification || '',
            bingSiteVerification: globalData.settings['site-info'].bingSiteVerification || '',
            robotsTxt: globalData.settings['site-info'].robotsTxt || '',
            sitemapEnabled: globalData.settings['site-info'].sitemapEnabled ?? true,
            sitemapPriority: globalData.settings['site-info'].sitemapPriority ?? 0.5,
            sitemapChangefreq: globalData.settings['site-info'].sitemapChangefreq || 'weekly'
          })
        }
      }
    } catch (error) {
      console.error('SEO 데이터 로드 실패:', error)
      toast({
        title: "오류",
        description: "SEO 설정을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveGlobalSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/seo/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalFormData)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "전역 SEO 설정이 저장되었습니다.",
        })
        loadData()
      } else {
        throw new Error('저장 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "전역 SEO 설정 저장에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const createSeoSetting = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/seo/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingFormData)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "SEO 설정이 생성되었습니다.",
        })
        setSettingFormData({
          pageKey: '',
          pageName: '',
          title: '',
          description: '',
          keywords: '',
          canonical: '',
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          ogImageAlt: '',
          ogType: 'website',
          ogUrl: '',
          twitterCard: 'summary_large_image',
          twitterTitle: '',
          twitterDescription: '',
          twitterImage: '',
          twitterImageAlt: '',
          twitterSite: '',
          twitterCreator: '',
          schemaType: '',
          schemaData: '',
          customHead: '',
          robots: 'index,follow',
          isActive: true,
          priority: 0
        })
        loadData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '생성 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "SEO 설정 생성에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSeoSetting = async (id: string, data: Partial<SeoSetting>) => {
    try {
      const response = await fetch(`/api/admin/seo/settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "SEO 설정이 업데이트되었습니다.",
        })
        loadData()
      } else {
        throw new Error('업데이트 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "SEO 설정 업데이트에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const deleteSeoSetting = async (id: string) => {
    if (!confirm('이 SEO 설정을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/seo/settings/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "SEO 설정이 삭제되었습니다.",
        })
        loadData()
      } else {
        throw new Error('삭제 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "SEO 설정 삭제에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  const generatePreview = async (seoData: any) => {
    try {
      const response = await fetch('/api/seo/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seoData })
      })

      if (response.ok) {
        const previewData = await response.json()
        setPreviewData(previewData.metadata)
      }
    } catch (error) {
      console.error('미리보기 생성 실패:', error)
    }
  }

  const filteredSettings = seoSettings.filter(setting => {
    const matchesSearch = searchTerm === '' ||
      setting.pageKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterActive === null || setting.isActive === filterActive

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">SEO 설정을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SEO 설정 관리</h1>
        <Badge variant="secondary">Phase 4</Badge>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            전역 설정
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            페이지 설정
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 설정
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            미리보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                전역 SEO 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">사이트 이름</Label>
                  <Input
                    id="siteName"
                    value={globalFormData.siteName}
                    onChange={(e) => setGlobalFormData(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="사이트 이름을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">사이트 URL</Label>
                  <Input
                    id="siteUrl"
                    value={globalFormData.siteUrl}
                    onChange={(e) => setGlobalFormData(prev => ({ ...prev, siteUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">사이트 설명</Label>
                <Textarea
                  id="siteDescription"
                  value={globalFormData.siteDescription}
                  onChange={(e) => setGlobalFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="사이트에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultImage">기본 OG 이미지 URL</Label>
                <Input
                  id="defaultImage"
                  value={globalFormData.defaultImage}
                  onChange={(e) => setGlobalFormData(prev => ({ ...prev, defaultImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterHandle">트위터 핸들</Label>
                  <Input
                    id="twitterHandle"
                    value={globalFormData.twitterHandle}
                    onChange={(e) => setGlobalFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={globalFormData.googleAnalyticsId}
                    onChange={(e) => setGlobalFormData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                    placeholder="GA_MEASUREMENT_ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                  <Input
                    id="googleTagManagerId"
                    value={globalFormData.googleTagManagerId}
                    onChange={(e) => setGlobalFormData(prev => ({ ...prev, googleTagManagerId: e.target.value }))}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleSiteVerification">Google Search Console 인증</Label>
                  <Input
                    id="googleSiteVerification"
                    value={globalFormData.googleSiteVerification}
                    onChange={(e) => setGlobalFormData(prev => ({ ...prev, googleSiteVerification: e.target.value }))}
                    placeholder="google-site-verification 코드"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sitemapEnabled"
                  checked={globalFormData.sitemapEnabled}
                  onCheckedChange={(checked) => setGlobalFormData(prev => ({ ...prev, sitemapEnabled: checked }))}
                />
                <Label htmlFor="sitemapEnabled">사이트맵 자동 생성</Label>
              </div>

              <div className="pt-4">
                <Button onClick={saveGlobalSettings} disabled={saving} className="w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '저장 중...' : '전역 설정 저장'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                페이지별 SEO 설정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="페이지 키, 이름, 제목으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterActive === null ? "default" : "outline"}
                    onClick={() => setFilterActive(null)}
                  >
                    전체
                  </Button>
                  <Button
                    variant={filterActive === true ? "default" : "outline"}
                    onClick={() => setFilterActive(true)}
                  >
                    활성
                  </Button>
                  <Button
                    variant={filterActive === false ? "default" : "outline"}
                    onClick={() => setFilterActive(false)}
                  >
                    비활성
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredSettings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || filterActive !== null ?
                      '검색 조건에 맞는 SEO 설정이 없습니다.' :
                      'SEO 설정이 없습니다. 새 설정을 만들어보세요.'
                    }
                  </div>
                ) : (
                  filteredSettings.map(setting => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{setting.pageName}</span>
                          <Badge variant="outline">{setting.pageKey}</Badge>
                          <Badge variant={setting.isActive ? "default" : "secondary"}>
                            {setting.isActive ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {setting.title || "제목 없음"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          마지막 수정: {new Date(setting.updatedAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generatePreview(setting)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSetting(setting)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSeoSetting(setting.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                새 SEO 설정 생성
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pageKey">페이지 키 *</Label>
                  <Input
                    id="pageKey"
                    value={settingFormData.pageKey}
                    onChange={(e) => setSettingFormData(prev => ({ ...prev, pageKey: e.target.value }))}
                    placeholder="home, about, contact 등"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pageName">페이지 이름 *</Label>
                  <Input
                    id="pageName"
                    value={settingFormData.pageName}
                    onChange={(e) => setSettingFormData(prev => ({ ...prev, pageName: e.target.value }))}
                    placeholder="홈페이지, 소개, 연락처 등"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">페이지 제목</Label>
                <Input
                  id="title"
                  value={settingFormData.title}
                  onChange={(e) => setSettingFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="페이지 제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">메타 설명</Label>
                <Textarea
                  id="description"
                  value={settingFormData.description}
                  onChange={(e) => setSettingFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="페이지에 대한 설명을 입력하세요 (160자 이내 권장)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">키워드</Label>
                <Input
                  id="keywords"
                  value={settingFormData.keywords}
                  onChange={(e) => setSettingFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="키워드1, 키워드2, 키워드3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">OG 제목</Label>
                  <Input
                    id="ogTitle"
                    value={settingFormData.ogTitle}
                    onChange={(e) => setSettingFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                    placeholder="소셜 미디어용 제목"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG 이미지 URL</Label>
                  <Input
                    id="ogImage"
                    value={settingFormData.ogImage}
                    onChange={(e) => setSettingFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={createSeoSetting} disabled={saving} className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {saving ? '생성 중...' : 'SEO 설정 생성'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                메타데이터 미리보기
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">검색 결과 미리보기</h3>
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                        {previewData.title}
                      </div>
                      <div className="text-green-700 text-sm">
                        {previewData.canonical || "https://example.com"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {previewData.description}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">소셜 미디어 미리보기</h3>
                    <div className="p-4 border rounded-lg space-y-4">
                      {previewData.openGraph.image && (
                        <div className="bg-gray-100 h-48 flex items-center justify-center rounded">
                          <img
                            src={previewData.openGraph.image}
                            alt={previewData.openGraph.imageAlt || ''}
                            className="max-h-full max-w-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {previewData.openGraph.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {previewData.openGraph.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  {previewData.schema && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">구조화된 데이터</h3>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                        {JSON.stringify(previewData.schema, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  SEO 설정을 선택하고 미리보기 버튼을 클릭하세요.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}