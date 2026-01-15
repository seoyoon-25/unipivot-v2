'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TextField } from './FormField'
import { Save, Loader2, RotateCcw, Eye, Instagram, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

interface InstagramSectionContent {
  account: string
  link: string
}

interface InstagramEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: InstagramSectionContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: InstagramSectionContent) => void
  onSave: (sectionKey: string) => void
}

export function InstagramEditor({ section, onUpdate, onSave }: InstagramEditorProps) {
  const [content, setContent] = useState<InstagramSectionContent>(section.content)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `instagram-section-${section.id}`,
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
          description: 'Instagram 섹션이 저장되었습니다.',
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

  const handleContentChange = (field: keyof InstagramSectionContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto-fill link when account changes
  const handleAccountChange = (account: string) => {
    handleContentChange('account', account)

    // Auto-generate Instagram URL if not manually set
    if (account && !content.link.includes('instagram.com')) {
      const cleanAccount = account.startsWith('@') ? account.slice(1) : account
      handleContentChange('link', `https://www.instagram.com/${cleanAccount}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Instagram 피드 섹션의 계정 정보를 편집합니다.
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
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instagram 계정 정보</CardTitle>
            <CardDescription>표시할 Instagram 계정의 정보를 입력합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField
              label="계정명"
              description="Instagram 계정명을 입력하세요 (@는 선택사항)"
              value={content.account}
              onChange={handleAccountChange}
              placeholder="예: unipivot.kr 또는 @unipivot.kr"
              required
            />

            <TextField
              label="Instagram 링크"
              type="url"
              description="Instagram 프로필 페이지의 전체 URL"
              value={content.link}
              onChange={(value) => handleContentChange('link', value)}
              placeholder="https://www.instagram.com/unipivot.kr"
              required
            />

            {/* Live Preview */}
            {content.link && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    <span className="font-medium">@{content.account.replace('@', '')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-6 px-2"
                  >
                    <a href={content.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">콘텐츠 미리보기</CardTitle>
          <CardDescription>현재 설정된 Instagram 섹션을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visual Preview */}
            <div className="border rounded-lg p-6 bg-background">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Instagram className="h-8 w-8 text-pink-600" />
                  <h2 className="text-2xl font-bold">Instagram</h2>
                </div>

                {content.account && content.link ? (
                  <div className="space-y-4">
                    <p className="text-lg">
                      팔로우하세요: <span className="font-bold">@{content.account.replace('@', '')}</span>
                    </p>

                    {/* Mock Instagram Posts Grid */}
                    <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="aspect-square bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg"></div>
                      ))}
                    </div>

                    <Button asChild>
                      <a href={content.link} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram에서 보기
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    계정 정보를 입력하면 미리보기가 표시됩니다
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
}