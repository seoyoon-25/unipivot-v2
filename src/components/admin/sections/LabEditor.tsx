'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TextField } from './FormField'
import { StatCounter, StatItem } from './StatCounter'
import { Save, Loader2, RotateCcw, Eye } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

interface LabSectionContent {
  title: string
  description: string
  stats: StatItem[]
  link: string
}

interface LabEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: LabSectionContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: LabSectionContent) => void
  onSave: (sectionKey: string) => void
}

export const LabEditor = React.memo(function LabEditor({ section, onUpdate, onSave }: LabEditorProps) {
  const [content, setContent] = useState<LabSectionContent>(section.content)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `lab-section-${section.id}`,
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
          description: '리서치랩 섹션이 저장되었습니다.',
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

  const handleContentChange = (field: keyof LabSectionContent, value: any) => {
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
                리서치랩 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                리서치랩 플랫폼의 소개와 통계를 편집합니다.
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
              <CardTitle className="text-base">기본 정보</CardTitle>
              <CardDescription>리서치랩의 제목과 설명을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="제목"
                description="리서치랩 섹션의 제목"
                value={content.title}
                onChange={(value) => handleContentChange('title', value)}
                placeholder="예: 리서치랩"
                required
              />
              <TextField
                label="설명"
                description="리서치랩에 대한 간단한 소개"
                value={content.description}
                onChange={(value) => handleContentChange('description', value)}
                placeholder="연구와 인사이트를 통한 사회 기여"
                multiline
                rows={3}
                required
              />
              <TextField
                label="링크"
                type="url"
                description="리서치랩 페이지로의 링크"
                value={content.link}
                onChange={(value) => handleContentChange('link', value)}
                placeholder="/lab 또는 https://lab.unipivot.kr"
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">통계 정보</CardTitle>
              <CardDescription>리서치랩의 성과와 현황을 나타내는 통계입니다.</CardDescription>
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
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">{content.title || '제목을 입력하세요'}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {content.description || '설명을 입력하세요'}
                </p>

                {/* Stats Preview */}
                {content.stats.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {content.stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stat.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                        {stat.autoCalculate && (
                          <div className="text-xs text-blue-600 mt-1">자동 계산</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Link Preview */}
                {content.link && (
                  <div className="mt-4">
                    <Button asChild>
                      <a href={content.link} target={content.link.startsWith('http') ? '_blank' : undefined}>
                        자세히 보기
                      </a>
                    </Button>
                  </div>
                )}
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