'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Save,
  RotateCcw,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ImageUploader } from '@/components/admin/sections/ImageUploader'

interface AboutContent {
  title: {
    ko: string
    en: string
  }
  paragraphs: Array<{
    ko: string
    en: string
  }>
  images: string[]
}

const defaultContent: AboutContent = {
  title: {
    ko: '유니피벗은 어떤 곳인가요?',
    en: 'About UNIPIVOT'
  },
  paragraphs: [
    {
      ko: '유니피벗은 남북청년이 수평적으로 만나 성장하고 협력하여 더 나은 나, 공동체, 대한민국을 만들어 가기 위해 2015년 남북한걸음으로 시작되었습니다.',
      en: 'UNIPIVOT was founded in 2015 as Nambukhangeoleum to create a better self, community, and Korea through horizontal meetings, growth, and cooperation between North and South Korean youth.'
    },
    {
      ko: '남북청년 뿐만 아니라 유니피벗이 추구하는 방향에 대해 공감하는 사람이라면 인종, 성별, 나이, 국적, 종교, 성적지향과 무관하게 모두와 함께합니다.',
      en: 'We welcome everyone who resonates with our vision, regardless of race, gender, age, nationality, religion, or sexual orientation.'
    },
    {
      ko: '유니피벗은 비정치적, 비종교적이며 우리 사회의 다양한 구성원들과 연대하여 분단체제를 해체하고 분단으로 인해 생긴 상처를 치유하고 회복하여 남북이 함께 살기 좋은 새로운 한반도를 만들어가고자 합니다.',
      en: 'UNIPIVOT is non-political and non-religious, working with diverse members of our society to dismantle the division system, heal wounds caused by division, and create a new Korean Peninsula where both Koreas can live together.'
    }
  ],
  images: [
    'https://cdn.imweb.me/thumbnail/20230611/9837611e1ecc4.jpg',
    'https://cdn.imweb.me/thumbnail/20230611/ff3fae27e81d6.jpg',
    'https://cdn.imweb.me/thumbnail/20230611/38424c39d1b97.jpg'
  ]
}

export default function AboutEditorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<AboutContent>(defaultContent)
  const [originalContent, setOriginalContent] = useState<AboutContent>(defaultContent)
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    title: true,
    paragraphs: true,
    images: true
  })

  // Check admin permission
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      router.push('/admin')
    }
  }, [session, status, router])

  // Fetch existing content
  useEffect(() => {
    fetchContent()
  }, [])

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(content) !== JSON.stringify(originalContent))
  }, [content, originalContent])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/design/sections')
      if (!response.ok) throw new Error('Failed to fetch sections')

      const data = await response.json()
      const aboutSection = data.sections?.find((s: any) => s.sectionKey === 'page.about')

      if (aboutSection?.content) {
        // Map existing content to our new structure
        const existingContent = aboutSection.content

        // Check if it's the new format or old format
        if (existingContent.title?.ko) {
          // New format
          setContent(existingContent)
          setOriginalContent(existingContent)
        } else {
          // Need to create the section with default content
          setContent(defaultContent)
          setOriginalContent(defaultContent)
        }
      } else {
        // Section doesn't exist, will create on save
        setContent(defaultContent)
        setOriginalContent(defaultContent)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: '오류',
        description: '콘텐츠를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch('/api/admin/design/sections/page.about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        // If section doesn't exist, create it
        if (response.status === 404) {
          const createResponse = await fetch('/api/admin/design/sections/page.about', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sectionKey: 'page.about',
              sectionName: '소개 페이지',
              content,
              order: 20
            })
          })

          if (!createResponse.ok) throw new Error('Failed to create section')
        } else {
          throw new Error('Failed to save')
        }
      }

      setOriginalContent(content)
      toast({
        title: '성공',
        description: '소개 페이지 콘텐츠가 저장되었습니다.',
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: '오류',
        description: '저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContent(originalContent)
    toast({
      title: '초기화됨',
      description: '변경사항이 취소되었습니다.',
    })
  }

  const updateTitle = (lang: 'ko' | 'en', value: string) => {
    setContent(prev => ({
      ...prev,
      title: { ...prev.title, [lang]: value }
    }))
  }

  const updateParagraph = (index: number, lang: 'ko' | 'en', value: string) => {
    setContent(prev => ({
      ...prev,
      paragraphs: prev.paragraphs.map((p, i) =>
        i === index ? { ...p, [lang]: value } : p
      )
    }))
  }

  const addParagraph = () => {
    setContent(prev => ({
      ...prev,
      paragraphs: [...prev.paragraphs, { ko: '', en: '' }]
    }))
  }

  const removeParagraph = (index: number) => {
    if (content.paragraphs.length <= 1) {
      toast({
        title: '알림',
        description: '최소 1개의 단락이 필요합니다.',
        variant: 'destructive',
      })
      return
    }
    setContent(prev => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index)
    }))
  }

  const moveParagraph = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= content.paragraphs.length) return

    setContent(prev => {
      const newParagraphs = [...prev.paragraphs]
      const temp = newParagraphs[index]
      newParagraphs[index] = newParagraphs[newIndex]
      newParagraphs[newIndex] = temp
      return { ...prev, paragraphs: newParagraphs }
    })
  }

  const updateImage = (index: number, url: string) => {
    setContent(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }))
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/design">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              소개 페이지 편집
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  미저장
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              /about 페이지의 콘텐츠를 편집합니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/about" target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              미리보기
            </Button>
          </Link>
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
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            저장
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title Section */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('title')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">제목 섹션</CardTitle>
                <CardDescription>한글과 영문 제목을 편집합니다.</CardDescription>
              </div>
              {expandedSections.title ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {expandedSections.title && (
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title-ko">한글 제목</Label>
                <Input
                  id="title-ko"
                  value={content.title.ko}
                  onChange={(e) => updateTitle('ko', e.target.value)}
                  placeholder="유니피벗은 어떤 곳인가요?"
                />
              </div>
              <div>
                <Label htmlFor="title-en">영문 제목</Label>
                <Input
                  id="title-en"
                  value={content.title.en}
                  onChange={(e) => updateTitle('en', e.target.value)}
                  placeholder="About UNIPIVOT"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Paragraphs Section */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('paragraphs')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">본문 단락</CardTitle>
                <CardDescription>
                  한글과 영문이 나란히 표시됩니다. ({content.paragraphs.length}개 단락)
                </CardDescription>
              </div>
              {expandedSections.paragraphs ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {expandedSections.paragraphs && (
            <CardContent className="space-y-4">
              {content.paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50/50 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">단락 {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveParagraph(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveParagraph(index, 'down')}
                        disabled={index === content.paragraphs.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeParagraph(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">한글</Label>
                      <Textarea
                        value={paragraph.ko}
                        onChange={(e) => updateParagraph(index, 'ko', e.target.value)}
                        placeholder="한글 내용을 입력하세요..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">English</Label>
                      <Textarea
                        value={paragraph.en}
                        onChange={(e) => updateParagraph(index, 'en', e.target.value)}
                        placeholder="Enter English content..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addParagraph}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                단락 추가
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Images Section */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('images')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">이미지 섹션</CardTitle>
                <CardDescription>3개의 이미지가 나란히 표시됩니다.</CardDescription>
              </div>
              {expandedSections.images ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {expandedSections.images && (
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <ImageUploader
                    key={index}
                    label={`이미지 ${index + 1}`}
                    value={content.images[index] || ''}
                    onChange={(url) => updateImage(index, url)}
                    aspectRatio="square"
                  />
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Preview JSON (for debugging) */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">데이터 미리보기 (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto p-4 bg-white rounded border max-h-64">
              {JSON.stringify(content, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
