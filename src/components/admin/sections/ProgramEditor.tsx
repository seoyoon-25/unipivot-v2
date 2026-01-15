'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TextField } from './FormField'
import { Save, Loader2, RotateCcw, Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

// Program types based on existing system
const PROGRAM_TYPES = [
  { value: 'BOOKCLUB', label: '독서모임', description: '책을 읽고 함께 토론하는 모임' },
  { value: 'SEMINAR', label: '세미나', description: '다양한 주제의 세미나와 강연' },
  { value: 'KMOVE', label: 'K-move', description: '해외 진출 지원 프로그램' },
  { value: 'DEBATE', label: '토론', description: '주제별 토론 프로그램' },
  { value: 'WORKSHOP', label: '워크샵', description: '실습 중심의 워크샵' },
  { value: 'OTHER', label: '기타', description: '기타 다양한 프로그램' }
]

interface ProgramSectionContent {
  title: string
  programTypes: string[]
  displayCount?: number
}

interface ProgramEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: ProgramSectionContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: ProgramSectionContent) => void
  onSave: (sectionKey: string) => void
}

export const ProgramEditor = React.memo(function ProgramEditor({ section, onUpdate, onSave }: ProgramEditorProps) {
  const [content, setContent] = useState<ProgramSectionContent>(section.content)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `${section.sectionKey}-section-${section.id}`,
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
          description: `${section.sectionName} 섹션이 저장되었습니다.`,
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

  const handleContentChange = (field: keyof ProgramSectionContent, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProgramTypeToggle = (programType: string, checked: boolean) => {
    if (checked) {
      setContent(prev => ({
        ...prev,
        programTypes: [...prev.programTypes, programType]
      }))
    } else {
      setContent(prev => ({
        ...prev,
        programTypes: prev.programTypes.filter(type => type !== programType)
      }))
    }
  }

  const isRecentProgramsSection = section.sectionKey === 'recent'

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {section.sectionName} 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isRecentProgramsSection
                  ? '현재 진행중인 프로그램의 표시 설정을 관리합니다.'
                  : '핵심 프로그램 타입을 선택하여 표시할 프로그램을 설정합니다.'
                }
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
        {/* Left Column - Basic Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 설정</CardTitle>
              <CardDescription>섹션의 기본 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                label="제목"
                description="섹션에 표시될 제목"
                value={content.title}
                onChange={(value) => handleContentChange('title', value)}
                placeholder={isRecentProgramsSection ? "예: 진행중인 프로그램" : "예: 핵심 프로그램"}
                required
              />
              {isRecentProgramsSection && (
                <TextField
                  label="표시 개수"
                  type="number"
                  description="표시할 프로그램의 개수"
                  value={content.displayCount?.toString() || '6'}
                  onChange={(value) => handleContentChange('displayCount', parseInt(value) || 6)}
                  placeholder="6"
                  required
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Program Types */}
        {!isRecentProgramsSection && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">프로그램 타입 선택</CardTitle>
                <CardDescription>표시할 프로그램 타입을 선택하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PROGRAM_TYPES.map((type) => (
                    <div key={type.value} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <Checkbox
                        id={type.value}
                        checked={content.programTypes.includes(type.value)}
                        onCheckedChange={(checked) => handleProgramTypeToggle(type.value, !!checked)}
                      />
                      <div className="space-y-1 flex-1">
                        <label
                          htmlFor={type.value}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {type.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    선택된 타입: {content.programTypes.length > 0
                      ? content.programTypes.map(type =>
                          PROGRAM_TYPES.find(t => t.value === type)?.label || type
                        ).join(', ')
                      : '없음'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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

                {isRecentProgramsSection ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: content.displayCount || 6 }, (_, i) => (
                      <div key={i} className="p-4 border rounded-lg bg-muted/50">
                        <div className="h-32 bg-muted rounded mb-2"></div>
                        <div className="text-sm font-medium">프로그램 {i + 1}</div>
                        <div className="text-xs text-muted-foreground">프로그램 설명...</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {content.programTypes.length > 0 ? (
                      content.programTypes.map((typeValue) => {
                        const type = PROGRAM_TYPES.find(t => t.value === typeValue)
                        return (
                          <div key={typeValue} className="p-4 border rounded-lg bg-muted/50">
                            <div className="text-lg font-bold mb-2">{type?.label}</div>
                            <div className="text-sm text-muted-foreground">{type?.description}</div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-full text-muted-foreground">
                        프로그램 타입을 선택해주세요
                      </div>
                    )}
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