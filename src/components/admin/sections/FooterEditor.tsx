'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TextField } from './FormField'
import { Save, Loader2, RotateCcw, Eye, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

interface SocialLinks {
  instagram?: string
  youtube?: string
  linkedin?: string
  facebook?: string
}

interface FooterContent {
  organizationName: string
  representative: string
  businessNumber: string
  address: string
  phone: string
  email: string
  businessHours: string
  socialLinks: SocialLinks
}

interface FooterEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: FooterContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: FooterContent) => void
  onSave: (sectionKey: string) => void
}

export const FooterEditor = React.memo(function FooterEditor({ section, onUpdate, onSave }: FooterEditorProps) {
  const [content, setContent] = useState<FooterContent>(section.content)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `footer-section-${section.id}`,
    value: JSON.stringify(content),
    onSave: async (data) => {
      const parsedContent = JSON.parse(data)
      onUpdate(section.sectionKey, parsedContent)
      await handleSave(false) // Auto-save silently
    },
    delay: 5000,
    enabled: hasChanges
  })

  // Track changes
  useEffect(() => {
    const hasContentChanged = JSON.stringify(content) !== JSON.stringify(section.content)
    setHasChanges(hasContentChanged)
  }, [content, section.content])

  const handleSave = async (showToast = true) => {
    try {
      setSaving(true)
      onUpdate(section.sectionKey, content)
      await new Promise(resolve => setTimeout(resolve, 0))
      await onSave(section.sectionKey)
      setHasChanges(false)

      if (showToast) {
        toast({
          title: '성공',
          description: 'Footer 섹션이 저장되었습니다.',
        })
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: '오류',
          description: '저장 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContent(section.content)
    setHasChanges(false)
    toast({
      title: '초기화',
      description: '변경사항이 초기화되었습니다.',
    })
  }

  const handleContentChange = (field: keyof FooterContent, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinksChange = (platform: keyof SocialLinks, value: string) => {
    setContent(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Footer 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                사이트 하단 푸터의 연락처 정보와 소셜 링크를 편집합니다.
                {lastSaved && (
                  <span className="text-xs text-muted-foreground block mt-1">
                    마지막 저장: {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                초기화
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast({
                    title: '미리보기',
                    description: '미리보기 기능은 곧 추가될 예정입니다.',
                  })
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                미리보기
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={!hasChanges || saving}
                className="min-w-[80px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Organization Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">조직 정보</CardTitle>
              <CardDescription>단체의 기본 정보를 입력합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="단체명"
                description="공식 단체명을 입력하세요"
                value={content.organizationName}
                onChange={(value) => handleContentChange('organizationName', value)}
                placeholder="예: (사)유니피벗"
                required
              />
              <TextField
                label="대표자"
                description="단체의 대표자명을 입력하세요"
                value={content.representative}
                onChange={(value) => handleContentChange('representative', value)}
                placeholder="예: 홍길동"
                required
              />
              <TextField
                label="사업자등록번호"
                description="사업자등록번호를 입력하세요"
                value={content.businessNumber}
                onChange={(value) => handleContentChange('businessNumber', value)}
                placeholder="예: 123-45-67890"
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">연락처 정보</CardTitle>
              <CardDescription>방문자가 연락할 수 있는 정보를 입력합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="주소"
                description="단체의 소재지를 입력하세요"
                value={content.address}
                onChange={(value) => handleContentChange('address', value)}
                placeholder="예: 서울특별시 종로구 ..."
                multiline
                rows={2}
                required
              />
              <TextField
                label="전화번호"
                description="대표 전화번호를 입력하세요"
                value={content.phone}
                onChange={(value) => handleContentChange('phone', value)}
                placeholder="예: 02-1234-5678"
                required
              />
              <TextField
                label="이메일"
                type="email"
                description="공식 이메일 주소를 입력하세요"
                value={content.email}
                onChange={(value) => handleContentChange('email', value)}
                placeholder="예: contact@unipivot.kr"
                required
              />
              <TextField
                label="업무시간"
                description="업무 가능한 시간을 입력하세요"
                value={content.businessHours}
                onChange={(value) => handleContentChange('businessHours', value)}
                placeholder="예: 평일 09:00-18:00"
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Social Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">소셜 미디어 링크</CardTitle>
              <CardDescription>단체의 소셜 미디어 계정 링크를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <TextField
                  label="Instagram"
                  type="url"
                  description="Instagram 프로필 링크"
                  value={content.socialLinks.instagram || ''}
                  onChange={(value) => handleSocialLinksChange('instagram', value)}
                  placeholder="https://www.instagram.com/unipivot.kr"
                />

                <TextField
                  label="YouTube"
                  type="url"
                  description="YouTube 채널 링크"
                  value={content.socialLinks.youtube || ''}
                  onChange={(value) => handleSocialLinksChange('youtube', value)}
                  placeholder="https://www.youtube.com/channel/..."
                />

                <TextField
                  label="LinkedIn"
                  type="url"
                  description="LinkedIn 페이지 링크"
                  value={content.socialLinks.linkedin || ''}
                  onChange={(value) => handleSocialLinksChange('linkedin', value)}
                  placeholder="https://www.linkedin.com/company/..."
                />

                <TextField
                  label="Facebook"
                  type="url"
                  description="Facebook 페이지 링크"
                  value={content.socialLinks.facebook || ''}
                  onChange={(value) => handleSocialLinksChange('facebook', value)}
                  placeholder="https://www.facebook.com/..."
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">소셜 링크 미리보기</h4>
                <div className="space-y-2">
                  {Object.entries(content.socialLinks).map(([platform, link]) => {
                    if (!link) return null
                    return (
                      <div key={platform} className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{platform}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-6 px-2"
                        >
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )
                  })}
                  {Object.values(content.socialLinks).every(link => !link) && (
                    <p className="text-xs text-muted-foreground">설정된 소셜 링크가 없습니다.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">콘텐츠 미리보기</CardTitle>
          <CardDescription>현재 설정된 내용을 JSON 형식으로 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
            {JSON.stringify(content, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
})