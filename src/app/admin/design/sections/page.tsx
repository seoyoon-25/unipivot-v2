'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Eye, RotateCcw, ExternalLink, PanelRightClose, PanelRight } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { SectionPreview } from '@/components/admin/sections/SectionPreview'
import { HeroEditor } from '@/components/admin/sections/HeroEditor'
import { FooterEditor } from '@/components/admin/sections/FooterEditor'
import { TextSectionEditor } from '@/components/admin/sections/TextSectionEditor'
import { LabEditor } from '@/components/admin/sections/LabEditor'
import { StoryEditor } from '@/components/admin/sections/StoryEditor'
import { ProgramEditor } from '@/components/admin/sections/ProgramEditor'
import { InstagramEditor } from '@/components/admin/sections/InstagramEditor'
import { SectionManager } from '@/components/admin/sections/SectionManager'
import { AboutPageEditor, DonatePageEditor, PageHeaderEditor, AboutUsPageEditor, HistoryPageEditor } from '@/components/admin/sections/PageSectionEditor'

interface SiteSection {
  id: string
  sectionKey: string
  sectionName: string
  content: any
  isVisible: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface SectionEditorProps {
  section: SiteSection
  onUpdate: (sectionKey: string, content: any) => void
  onSave: (sectionKey: string) => void
}

// Placeholder editors - HeroEditor is now implemented
const PlaceholderHeroEditor = ({ section, onUpdate, onSave }: SectionEditorProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Hero 섹션 (구 버전)</CardTitle>
      <CardDescription>메인 페이지 상단 히어로 섹션을 편집합니다.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-muted-foreground">
        Hero 편집기 (Phase 1.2에서 구현 예정)
      </div>
      <pre className="mt-4 text-xs bg-muted p-4 rounded">
        {JSON.stringify(section.content, null, 2)}
      </pre>
      <Button onClick={() => onSave(section.sectionKey)} className="mt-4">
        <Save className="h-4 w-4 mr-2" />
        저장
      </Button>
    </CardContent>
  </Card>
)

const SimpleTextEditor = ({ section, onUpdate, onSave }: SectionEditorProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{section.sectionName} 섹션</CardTitle>
      <CardDescription>{section.sectionName} 섹션을 편집합니다.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-muted-foreground">
        {section.sectionName} 편집기 (Phase 1.3에서 구현 예정)
      </div>
      <pre className="mt-4 text-xs bg-muted p-4 rounded">
        {JSON.stringify(section.content, null, 2)}
      </pre>
      <Button onClick={() => onSave(section.sectionKey)} className="mt-4">
        <Save className="h-4 w-4 mr-2" />
        저장
      </Button>
    </CardContent>
  </Card>
)

const PlaceholderFooterEditor = ({ section, onUpdate, onSave }: SectionEditorProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Footer 섹션 (구 버전)</CardTitle>
      <CardDescription>사이트 하단 푸터를 편집합니다.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-muted-foreground">
        Footer 편집기 (Phase 1.2에서 구현 예정)
      </div>
      <pre className="mt-4 text-xs bg-muted p-4 rounded">
        {JSON.stringify(section.content, null, 2)}
      </pre>
      <Button onClick={() => onSave(section.sectionKey)} className="mt-4">
        <Save className="h-4 w-4 mr-2" />
        저장
      </Button>
    </CardContent>
  </Card>
)

export default function SectionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sections, setSections] = useState<SiteSection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [saving, setSaving] = useState<string | null>(null)
  const [previewSection, setPreviewSection] = useState<string | null>('hero') // 미리보기 기본 활성화
  const [showPreview, setShowPreview] = useState(true) // 미리보기 패널 표시 상태

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      router.push('/admin')
    }
  }, [session, status, router])

  // Fetch sections
  useEffect(() => {
    fetchSections()
  }, [])

  // activeTab 변경 시 previewSection도 동기화
  useEffect(() => {
    if (showPreview) {
      setPreviewSection(activeTab)
    }
  }, [activeTab, showPreview])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/design/sections')
      if (!response.ok) {
        throw new Error('Failed to fetch sections')
      }
      const data = await response.json()

      // If no sections exist, create default ones
      if (!data.sections || data.sections.length === 0) {
        await createDefaultSections()
        return
      }

      setSections(data.sections || [])
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast({
        title: '오류',
        description: '섹션을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createDefaultSections = async () => {
    try {
      const response = await fetch('/api/admin/design/sections', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to create default sections')
      }

      const data = await response.json()
      toast({
        title: '성공',
        description: `${data.created}개의 기본 섹션이 생성되었습니다.`,
      })

      // Refetch sections
      await fetchSections()
    } catch (error) {
      console.error('Error creating default sections:', error)
      toast({
        title: '오류',
        description: '기본 섹션 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleSectionUpdate = (sectionKey: string, content: any) => {
    setSections(prev => prev.map(section =>
      section.sectionKey === sectionKey
        ? { ...section, content }
        : section
    ))
  }

  const handleSectionSave = async (sectionKey: string) => {
    try {
      setSaving(sectionKey)
      const section = sections.find(s => s.sectionKey === sectionKey)
      if (!section) return

      const response = await fetch(`/api/admin/design/sections/${sectionKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: section.content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save section')
      }

      toast({
        title: '성공',
        description: `${section.sectionName} 섹션이 저장되었습니다.`,
      })
    } catch (error) {
      console.error('Error saving section:', error)
      toast({
        title: '오류',
        description: '섹션 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(null)
    }
  }

  const handleVisibilityToggle = async (sectionKey: string, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/design/sections/${sectionKey}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible }),
      })

      if (!response.ok) {
        throw new Error('Failed to update visibility')
      }

      setSections(prev => prev.map(section =>
        section.sectionKey === sectionKey
          ? { ...section, isVisible }
          : section
      ))

      toast({
        title: '성공',
        description: `섹션이 ${isVisible ? '표시' : '숨김'}로 설정되었습니다.`,
      })
    } catch (error) {
      console.error('Error updating visibility:', error)
      toast({
        title: '오류',
        description: '표시 설정 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleReorder = async (sectionKeys: string[]) => {
    try {
      const response = await fetch('/api/admin/design/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionKeys }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder sections')
      }

      // Update local state with new order
      const reorderedSections = sectionKeys.map((sectionKey, index) => {
        const section = sections.find(s => s.sectionKey === sectionKey)
        return section ? { ...section, order: index + 1 } : null
      }).filter(Boolean) as SiteSection[]

      setSections(reorderedSections)
    } catch (error) {
      console.error('Error reordering sections:', error)
      throw error // Re-throw for SectionManager to handle
    }
  }

  const renderSectionEditor = (section: SiteSection) => {
    const editorProps = {
      section,
      onUpdate: handleSectionUpdate,
      onSave: handleSectionSave
    }

    switch (section.sectionKey) {
      case 'hero':
        return <HeroEditor {...editorProps} />
      case 'footer':
        return <FooterEditor {...editorProps} />
      case 'uni':
      case 'pivot':
      case 'interests':
        return <TextSectionEditor {...editorProps} />
      case 'lab':
        return <LabEditor {...editorProps} />
      case 'story':
        return <StoryEditor {...editorProps} />
      case 'programs':
      case 'recent':
        return <ProgramEditor {...editorProps} />
      case 'instagram':
        return <InstagramEditor {...editorProps} />
      // Page section editors
      case 'page.about':
        return <AboutPageEditor {...editorProps} />
      case 'page.about-us':
        return <AboutUsPageEditor {...editorProps} />
      case 'page.history':
        return <HistoryPageEditor {...editorProps} />
      case 'page.donate':
        return <DonatePageEditor {...editorProps} />
      case 'page.programs':
      case 'page.blog':
      case 'page.notice':
        return <PageHeaderEditor {...editorProps} />
      default:
        return <SimpleTextEditor {...editorProps} />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // 섹션이 없으면 빈 화면 표시
  if (!sections || sections.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">섹션별 편집</h1>
          <p className="text-muted-foreground">
            메인 페이지의 각 섹션을 개별적으로 편집하고 관리합니다.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">등록된 섹션이 없습니다.</p>
            <Button onClick={createDefaultSections}>
              기본 섹션 생성
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">섹션별 편집</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          각 섹션을 개별적으로 편집하고 관리합니다.
        </p>
      </div>

      {/* Section Management */}
      <SectionManager
        sections={sections || []}
        onReorder={handleReorder}
        onToggleVisibility={handleVisibilityToggle}
        className="mb-4 sm:mb-6"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Homepage Sections */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">홈페이지 섹션</h3>
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            {(sections || []).filter(s => !s.sectionKey.startsWith('page.')).map((section) => (
              <TabsTrigger
                key={section.sectionKey}
                value={section.sectionKey}
                className="relative text-xs sm:text-sm px-2 sm:px-3 py-1.5"
              >
                <span className="mr-1 sm:mr-2">{section.sectionName}</span>
                <div className="flex items-center gap-1">
                  {!section.isVisible && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0">
                      숨김
                    </Badge>
                  )}
                  {saving === section.sectionKey && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Page Sections */}
        {(sections || []).filter(s => s.sectionKey.startsWith('page.')).length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">페이지별 콘텐츠</h3>
            <TabsList className="flex flex-wrap gap-1 h-auto p-1">
              {(sections || []).filter(s => s.sectionKey.startsWith('page.')).map((section) => (
                <TabsTrigger
                  key={section.sectionKey}
                  value={section.sectionKey}
                  className="relative text-xs sm:text-sm px-2 sm:px-3 py-1.5"
                >
                  <span className="mr-1 sm:mr-2">{section.sectionName}</span>
                  <div className="flex items-center gap-1">
                    {!section.isVisible && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0">
                        숨김
                      </Badge>
                    )}
                    {saving === section.sectionKey && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

        {(sections || []).map((section) => (
          <TabsContent key={section.sectionKey} value={section.sectionKey}>
            {/* Section Actions */}
            <Card className="mb-4">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      {section.sectionName} 섹션
                      <Badge variant={section.isVisible ? 'default' : 'secondary'}>
                        {section.isVisible ? '표시' : '숨김'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      순서: {section.order}번째 • 수정: {new Date(section.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVisibilityToggle(section.sectionKey, !section.isVisible)}
                    >
                      <Eye className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{section.isVisible ? '숨기기' : '표시하기'}</span>
                    </Button>
                    <Button
                      variant={showPreview ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setShowPreview(!showPreview)
                        if (!showPreview) {
                          setPreviewSection(activeTab)
                        }
                      }}
                    >
                      {showPreview ? (
                        <><PanelRightClose className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">미리보기 닫기</span></>
                      ) : (
                        <><PanelRight className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">미리보기 열기</span></>
                      )}
                    </Button>
                    <Link href="/admin/preview">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">전체 미리보기</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Side-by-side layout: Editor + Preview */}
            <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Section Editor */}
              <div className="space-y-6">
                {renderSectionEditor(section)}
              </div>

              {/* Section Preview - 미리보기 활성화시 표시 */}
              {showPreview && previewSection === section.sectionKey && (
                <div className="lg:sticky lg:top-4 lg:self-start">
                  <SectionPreview section={section} />
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}