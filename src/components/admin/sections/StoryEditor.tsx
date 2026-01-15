'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TextField } from './FormField'
import { ImageUploader } from './ImageUploader'
import { StatCounter, StatItem } from './StatCounter'
import { Save, Loader2, RotateCcw, Eye } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

interface StorySectionContent {
  title: string
  content: string
  image: string
  stats: StatItem[]
}

interface StoryEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: StorySectionContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: StorySectionContent) => void
  onSave: (sectionKey: string) => void
}

export const StoryEditor = React.memo(function StoryEditor({ section, onUpdate, onSave }: StoryEditorProps) {
  const [content, setContent] = useState<StorySectionContent>(section.content)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `story-section-${section.id}`,
    value: JSON.stringify(content),
    onSave: async (data) => {
      const parsedContent = JSON.parse(data)
      onUpdate(section.sectionKey, parsedContent)
      await handleSave(false)
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
          description: 'Our Story 섹션이 저장되었습니다.',
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

  const handleContentChange = (field: keyof StorySectionContent, value: any) => {
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
                Our Story 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                유니피벳의 이야기와 통계를 편집합니다.
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
        {/* Left Column - Text Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">스토리 콘텐츠</CardTitle>
              <CardDescription>유니피벳의 이야기를 작성합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="제목"
                description="스토리 섹션의 제목"
                value={content.title}
                onChange={(value) => handleContentChange('title', value)}
                placeholder="예: 우리의 이야기"
                required
              />
              <TextField
                label="본문"
                description="유니피벳의 여정과 비전을 설명하는 본문"
                value={content.content}
                onChange={(value) => handleContentChange('content', value)}
                placeholder="유니피벳의 여정과 비전을 소개합니다..."
                multiline
                rows={6}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">이미지</CardTitle>
              <CardDescription>스토리와 함께 표시될 이미지를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                label="스토리 이미지"
                description="권장 크기: 600x400px 이상"
                value={content.image}
                onChange={(value) => handleContentChange('image', value)}
                aspectRatio="video"
                maxSizeMB={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">주요 통계</CardTitle>
              <CardDescription>창립연도, 참여청년 등 주요 통계를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatCounter
                label="통계 항목"
                description="창립연도, 참여청년 수 등 최대 2개까지 통계를 표시할 수 있습니다"
                stats={content.stats}
                onChange={(value) => handleContentChange('stats', value)}
                maxCount={2}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">콘텐츠 미리보기</CardTitle>
          <CardDescription>현재 설정된 내용을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visual Preview */}
            <div className="border rounded-lg p-6 bg-background">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* Text Content */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">{content.title || '제목을 입력하세요'}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {content.content || '본문을 입력하세요'}
                  </p>

                  {/* Stats */}
                  {content.stats.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {content.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-primary">{stat.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                          {stat.autoCalculate && (
                            <div className="text-xs text-blue-600 mt-1">자동 계산</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image */}
                <div className="flex justify-center">
                  {content.image ? (
                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={content.image}
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground">
                      이미지를 업로드하세요
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* JSON Preview */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground group-open:text-foreground">
                JSON 데이터 보기
              </summary>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-32 mt-2">
                {JSON.stringify(content, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})