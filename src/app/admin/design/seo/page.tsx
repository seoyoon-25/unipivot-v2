'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Loader2,
  Save,
  Search,
  Globe,
  Image as ImageIcon,
  FileCode,
  Eye,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface SeoSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  defaultImage: string
  twitterHandle: string
  facebookPage: string
  linkedinPage: string
  youtubeChannel: string
  googleSiteVerification: string
  googleAnalyticsId: string
  googleTagManagerId: string
  naverSiteVerification: string
  bingSiteVerification: string
  robotsTxt: string
  sitemapEnabled: boolean
  sitemapPriority: number
  sitemapChangefreq: string
}

const defaultSettings: SeoSettings = {
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
  robotsTxt: `User-agent: *
Allow: /
Sitemap: https://bestcome.org/sitemap.xml`,
  sitemapEnabled: true,
  sitemapPriority: 0.5,
  sitemapChangefreq: 'weekly',
}

export default function SeoSettingsPage() {
  const { data: session, status } = useSession()
  const [settings, setSettings] = useState<SeoSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      redirect('/admin')
    }
  }, [session, status])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/seo/global')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      if (data.settings?.default) {
        setSettings({ ...defaultSettings, ...data.settings.default })
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const res = await fetch('/api/admin/seo/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settingKey: 'default',
          ...settings,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      toast({
        title: '저장 완료',
        description: 'SEO 설정이 저장되었습니다.',
      })
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
          <h1 className="text-2xl font-bold">SEO 설정</h1>
          <p className="text-muted-foreground">
            검색 엔진 최적화 및 메타 태그를 설정합니다.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          저장
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <Globe className="h-4 w-4 mr-2" />
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4 mr-2" />
            소셜 미디어
          </TabsTrigger>
          <TabsTrigger value="verification">
            <Search className="h-4 w-4 mr-2" />
            사이트 인증
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <FileCode className="h-4 w-4 mr-2" />
            고급 설정
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사이트 기본 정보</CardTitle>
              <CardDescription>
                검색 엔진에 표시될 사이트의 기본 정보입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">사이트 이름</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="유니피벗"
                />
              </div>

              <div>
                <Label htmlFor="siteDescription">사이트 설명</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  placeholder="남북청년이 함께 새로운 한반도를 만들어갑니다."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  권장 길이: 150-160자
                </p>
              </div>

              <div>
                <Label htmlFor="siteUrl">사이트 URL</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  placeholder="https://bestcome.org"
                />
              </div>

              <div>
                <Label htmlFor="defaultImage">기본 OG 이미지</Label>
                <Input
                  id="defaultImage"
                  value={settings.defaultImage}
                  onChange={(e) => setSettings({ ...settings, defaultImage: e.target.value })}
                  placeholder="https://bestcome.org/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  권장 크기: 1200 x 630 픽셀
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Google 검색 결과 미리보기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm text-green-700 mb-1">
                  {settings.siteUrl || 'https://bestcome.org'}
                </div>
                <div className="text-xl text-blue-600 hover:underline mb-1 cursor-pointer">
                  {settings.siteName || '사이트 이름'} - 유니피벗
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {settings.siteDescription || '사이트 설명이 여기에 표시됩니다.'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kakao Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                카카오톡 공유 미리보기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-w-sm bg-white">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  {settings.defaultImage ? (
                    <img
                      src={settings.defaultImage}
                      alt="OG Image"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm mb-1">
                    {settings.siteName || '사이트 이름'}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {settings.siteDescription || '사이트 설명'}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {settings.siteUrl?.replace(/^https?:\/\//, '') || 'bestcome.org'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">소셜 미디어 링크</CardTitle>
              <CardDescription>
                사이트와 연결된 소셜 미디어 계정입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="twitterHandle">Twitter 핸들</Label>
                <Input
                  id="twitterHandle"
                  value={settings.twitterHandle}
                  onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                  placeholder="@unipivot"
                />
              </div>

              <div>
                <Label htmlFor="facebookPage">Facebook 페이지</Label>
                <Input
                  id="facebookPage"
                  value={settings.facebookPage}
                  onChange={(e) => setSettings({ ...settings, facebookPage: e.target.value })}
                  placeholder="https://facebook.com/unipivot"
                />
              </div>

              <div>
                <Label htmlFor="linkedinPage">LinkedIn 페이지</Label>
                <Input
                  id="linkedinPage"
                  value={settings.linkedinPage}
                  onChange={(e) => setSettings({ ...settings, linkedinPage: e.target.value })}
                  placeholder="https://linkedin.com/company/unipivot"
                />
              </div>

              <div>
                <Label htmlFor="youtubeChannel">YouTube 채널</Label>
                <Input
                  id="youtubeChannel"
                  value={settings.youtubeChannel}
                  onChange={(e) => setSettings({ ...settings, youtubeChannel: e.target.value })}
                  placeholder="https://youtube.com/@unipivot"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">검색 엔진 인증</CardTitle>
              <CardDescription>
                검색 엔진에서 발급받은 사이트 인증 코드를 입력합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="googleSiteVerification">Google Search Console</Label>
                <Input
                  id="googleSiteVerification"
                  value={settings.googleSiteVerification}
                  onChange={(e) => setSettings({ ...settings, googleSiteVerification: e.target.value })}
                  placeholder="google-site-verification 코드"
                />
              </div>

              <div>
                <Label htmlFor="naverSiteVerification">Naver Search Advisor</Label>
                <Input
                  id="naverSiteVerification"
                  value={settings.naverSiteVerification}
                  onChange={(e) => setSettings({ ...settings, naverSiteVerification: e.target.value })}
                  placeholder="naver-site-verification 코드"
                />
              </div>

              <div>
                <Label htmlFor="bingSiteVerification">Bing Webmaster</Label>
                <Input
                  id="bingSiteVerification"
                  value={settings.bingSiteVerification}
                  onChange={(e) => setSettings({ ...settings, bingSiteVerification: e.target.value })}
                  placeholder="msvalidate.01 코드"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">분석 도구</CardTitle>
              <CardDescription>
                방문자 분석 도구의 추적 ID를 입력합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                <Input
                  id="googleTagManagerId"
                  value={settings.googleTagManagerId}
                  onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사이트맵 설정</CardTitle>
              <CardDescription>
                검색 엔진을 위한 사이트맵 생성 설정입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="sitemapEnabled"
                  checked={settings.sitemapEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, sitemapEnabled: checked })}
                />
                <Label htmlFor="sitemapEnabled" className="font-normal">사이트맵 자동 생성</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sitemapPriority">기본 우선순위</Label>
                  <Select
                    value={settings.sitemapPriority.toString()}
                    onValueChange={(value) => setSettings({ ...settings, sitemapPriority: parseFloat(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0 (최고)</SelectItem>
                      <SelectItem value="0.8">0.8</SelectItem>
                      <SelectItem value="0.5">0.5 (보통)</SelectItem>
                      <SelectItem value="0.3">0.3</SelectItem>
                      <SelectItem value="0.1">0.1 (최저)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sitemapChangefreq">변경 빈도</Label>
                  <Select
                    value={settings.sitemapChangefreq}
                    onValueChange={(value) => setSettings({ ...settings, sitemapChangefreq: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">항상</SelectItem>
                      <SelectItem value="hourly">매시간</SelectItem>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                      <SelectItem value="yearly">매년</SelectItem>
                      <SelectItem value="never">없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">robots.txt</CardTitle>
              <CardDescription>
                검색 엔진 크롤러에 대한 접근 규칙을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.robotsTxt}
                onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
