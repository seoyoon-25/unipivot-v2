'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TextField } from './FormField'
import { ImageUploader } from './ImageUploader'
import { StatCounter, CTAButtonManager, StatItem, CTAButton } from './StatCounter'
import { SectionPreview } from './SectionPreview'
import { Save, Loader2, RotateCcw, Eye } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

interface HeroContent {
  title: string
  subtitle: string
  backgroundImage: string
  stats: StatItem[]
  ctaButtons: CTAButton[]
}

interface HeroEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: HeroContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: HeroContent) => void
  onSave: (sectionKey: string) => void
}

export const HeroEditor = React.memo(function HeroEditor({ section, onUpdate, onSave }: HeroEditorProps) {
  const [content, setContent] = useState<HeroContent>(section.content)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `hero-section-${section.id}`,
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
      // Update parent with latest content before saving
      onUpdate(section.sectionKey, content)
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0))
      await onSave(section.sectionKey)
      setHasChanges(false)

      if (showToast) {
        toast({
          title: '성공',
          description: 'Hero 섹션이 저장되었습니다.',
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

  const handleContentChange = (field: keyof HeroContent, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
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
                Hero 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                메인 페이지 상단의 히어로 섹션을 편집합니다.
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
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? '편집 모드' : '미리보기'}
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
        {/* Left Column - Text Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">텍스트 콘텐츠</CardTitle>
              <CardDescription>제목과 부제목을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="메인 제목"
                description="히어로 섹션의 주요 제목입니다"
                value={content.title}
                onChange={(value) => handleContentChange('title', value)}
                placeholder="예: 유 니 피 벗"
                required
              />
              <TextField
                label="부제목"
                description="제목 아래에 표시되는 설명 문구입니다"
                value={content.subtitle}
                onChange={(value) => handleContentChange('subtitle', value)}
                placeholder="예: 남북청년이 함께 새로운 한반도를 만들어갑니다."
                multiline
                rows={2}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">배경 이미지</CardTitle>
              <CardDescription>히어로 섹션의 배경 이미지를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                label="배경 이미지"
                description="권장 크기: 1920x1080px (16:9 비율)"
                value={content.backgroundImage}
                onChange={(value) => handleContentChange('backgroundImage', value)}
                aspectRatio="video"
                maxSizeMB={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Interactive Elements */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">통계 정보</CardTitle>
              <CardDescription>히어로 섹션에 표시할 통계 수치입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatCounter
                label="통계 항목"
                description="최대 3개까지 통계를 표시할 수 있습니다"
                stats={content.stats}
                onChange={(value) => handleContentChange('stats', value)}
                maxCount={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">행동 유도 버튼</CardTitle>
              <CardDescription>사용자에게 특정 행동을 유도하는 버튼입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <CTAButtonManager
                label="CTA 버튼"
                description="최대 2개의 버튼을 추가할 수 있습니다"
                buttons={content.ctaButtons}
                onChange={(value) => handleContentChange('ctaButtons', value)}
                maxCount={2}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview ? (
        <SectionPreview
          section={{
            ...section,
            content
          }}
        />
      ) : (
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
      )}
    </div>
  )
})