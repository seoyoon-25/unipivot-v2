'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  LayoutTemplate,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { submitBookReport, submitStructuredReport, getReportTemplate } from '@/lib/actions/review'
import {
  formatTimeUntilDeadline,
  getDeadlineUrgency,
  getUrgencyColorClass,
  validateReview,
  REVIEW_GUIDELINES,
  formatCharCount,
  saveReviewDraft,
  loadReviewDraft,
  clearReviewDraft,
} from '@/lib/utils/review'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { StructuredReportEditor } from '@/components/report/StructuredReportEditor'
import { ReportStructureSelector } from '@/components/program/ReportStructureSelector'
import type {
  ReportStructureCode,
  ReportTemplateStructure,
  StructuredReportData,
  REPORT_STRUCTURES,
} from '@/types/report'

interface PageProps {
  params: Promise<{ programId: string; sessionId: string }>
}

interface SessionData {
  sessionNumber: number
  title: string | null
  date: Date
  book?: { title: string }
  reportStructure?: ReportStructureCode | null
}

export default function WriteReviewPage({ params }: PageProps) {
  const { programId, sessionId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  // Mode: 'free' or 'structured'
  const [mode, setMode] = useState<'free' | 'structured'>('free')
  const [selectedStructure, setSelectedStructure] = useState<ReportStructureCode | null>(null)
  const [template, setTemplate] = useState<ReportTemplateStructure | null>(null)
  const [structuredData, setStructuredData] = useState<StructuredReportData>({ sections: {} })

  // Free-form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch session data and program's report structure
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session and program data (API uses [id] not [programId])
        const response = await fetch(`/api/programs/${programId}/sessions/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setSessionData({
            sessionNumber: data.sessionNo || 1,
            title: data.title,
            date: new Date(data.date),
            book: data.bookTitle ? { title: data.bookTitle } : undefined,
            reportStructure: data.program?.reportStructure || null,
          })

          // If program has a report structure, auto-select it
          if (data.program?.reportStructure) {
            setSelectedStructure(data.program.reportStructure)
            setMode('structured')
            // Fetch template
            const tmpl = await getReportTemplate(data.program.reportStructure)
            if (tmpl) {
              setTemplate(tmpl.structure)
            }
          }
        } else {
          // Fallback
          setSessionData({
            sessionNumber: 1,
            title: null,
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          })
        }
      } catch {
        setSessionData({
          sessionNumber: 1,
          title: null,
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [programId, sessionId])

  // Load draft on mount
  useEffect(() => {
    const draft = loadReviewDraft(programId, sessionId)
    if (draft) {
      setTitle(draft.title)
      setContent(draft.content)
      setIsPublic(draft.isPublic)
      setLastSaved(draft.savedAt)
    }
  }, [programId, sessionId])

  // Fetch template when structure is selected
  useEffect(() => {
    const fetchTemplate = async () => {
      if (selectedStructure) {
        const tmpl = await getReportTemplate(selectedStructure)
        if (tmpl) {
          setTemplate(tmpl.structure)
        }
      }
    }
    fetchTemplate()
  }, [selectedStructure])

  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (title || content) {
      saveReviewDraft(programId, sessionId, { title, content, isPublic })
      setLastSaved(new Date().toISOString())
    }
  }, [programId, sessionId, title, content, isPublic])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveDraft, 30000)
    return () => clearInterval(interval)
  }, [saveDraft])

  const handleBlur = () => {
    saveDraft()
  }

  const handleStructureSelect = async (code: ReportStructureCode) => {
    setSelectedStructure(code)
    const tmpl = await getReportTemplate(code)
    if (tmpl) {
      setTemplate(tmpl.structure)
      setStructuredData({ sections: {} })
    }
  }

  const handleFreeFormSubmit = async () => {
    const validation = validateReview(title, content)
    if (!validation.isValid) {
      setErrors(validation.errors)
      toast({
        title: '입력 오류',
        description: Object.values(validation.errors)[0],
        variant: 'destructive',
      })
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const result = await submitBookReport({
        programId,
        sessionId,
        title,
        content,
        isPublic,
      })

      clearReviewDraft(programId, sessionId)

      toast({
        title: '제출 완료',
        description: result.isLate
          ? '독후감이 제출되었습니다 (마감 후 제출)'
          : '독후감이 제출되었습니다!',
      })

      router.push(`/mypage/programs/${programId}`)
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '제출에 실패했습니다',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStructuredSubmit = async () => {
    if (!selectedStructure || !template) {
      toast({
        title: '오류',
        description: '템플릿을 선택해주세요',
        variant: 'destructive',
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: '입력 오류',
        description: '제목을 입력해주세요',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitStructuredReport({
        programId,
        sessionId,
        title,
        structure: selectedStructure,
        template,
        data: structuredData,
        isPublic,
      })

      clearReviewDraft(programId, sessionId)
      // Clear structured draft
      localStorage.removeItem(`structured-report-draft-${programId}-${sessionId}`)

      toast({
        title: '제출 완료',
        description: result.isLate
          ? '독후감이 제출되었습니다 (마감 후 제출)'
          : '독후감이 제출되었습니다!',
      })

      router.push(`/mypage/programs/${programId}`)
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '제출에 실패했습니다',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = () => {
    if (mode === 'structured') {
      handleStructuredSubmit()
    } else {
      handleFreeFormSubmit()
    }
  }

  const urgency = sessionData ? getDeadlineUrgency(sessionData.date) : 'safe'
  const deadlineText = sessionData ? formatTimeUntilDeadline(sessionData.date) : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로
            </Button>
            {lastSaved && (
              <span className="text-xs text-gray-400">
                자동저장: {new Date(lastSaved).toLocaleTimeString('ko-KR')}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-xl font-bold">독후감 작성</h1>
          {sessionData && (
            <p className="text-sm text-gray-500">
              {sessionData.sessionNumber}회차
              {sessionData.title && ` - ${sessionData.title}`}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-6">
        {/* Deadline Warning */}
        {sessionData && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-3',
              getUrgencyColorClass(urgency)
            )}
          >
            <Clock className="h-5 w-5" />
            <span className="font-medium">마감: {deadlineText}</span>
            {urgency === 'expired' && (
              <span className="text-sm">(마감 후 제출)</span>
            )}
          </div>
        )}

        {/* Mode Selector */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'free' | 'structured')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="free" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              자유 형식
            </TabsTrigger>
            <TabsTrigger value="structured" className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              템플릿 사용
            </TabsTrigger>
          </TabsList>

          {/* Free Form Content */}
          <TabsContent value="free" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>독후감</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="독후감 제목을 입력하세요"
                    maxLength={REVIEW_GUIDELINES.titleMaxLength}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {title.length} / {REVIEW_GUIDELINES.titleMaxLength}자
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">내용 *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="책을 읽고 느낀 점, 인상 깊었던 부분, 배운 점 등을 자유롭게 작성해주세요..."
                    rows={15}
                    className="resize-none"
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        'text-xs',
                        content.length < REVIEW_GUIDELINES.minLength
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      )}
                    >
                      {formatCharCount(content.length, REVIEW_GUIDELINES.maxLength)}
                    </p>
                    {content.length < REVIEW_GUIDELINES.minLength && (
                      <p className="text-xs text-yellow-600">
                        최소 {REVIEW_GUIDELINES.minLength}자 이상 작성해주세요
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 작성 가이드</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 책의 내용을 간단히 요약해보세요</li>
                  <li>• 가장 인상 깊었던 부분과 그 이유를 적어보세요</li>
                  <li>• 책을 통해 새롭게 알게 된 점이나 배운 점을 공유해주세요</li>
                  <li>• 일상이나 다른 경험과 연결지어 생각해보세요</li>
                  <li>• 다른 참가자들에게 추천하고 싶은 이유가 있다면 적어주세요</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structured Content */}
          <TabsContent value="structured" className="mt-6 space-y-6">
            {/* Title Input for Structured */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="structured-title">제목 *</Label>
                  <Input
                    id="structured-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="독후감 제목을 입력하세요"
                    maxLength={REVIEW_GUIDELINES.titleMaxLength}
                  />
                  <p className="text-xs text-gray-400">
                    {title.length} / {REVIEW_GUIDELINES.titleMaxLength}자
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Structure Selector */}
            {!selectedStructure && (
              <Card>
                <CardHeader>
                  <CardTitle>템플릿 선택</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportStructureSelector
                    value={selectedStructure}
                    onChange={handleStructureSelect}
                    recommendedStructure={sessionData?.reportStructure || undefined}
                  />
                </CardContent>
              </Card>
            )}

            {/* Structured Editor */}
            {selectedStructure && template && (
              <>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStructure(null)
                      setTemplate(null)
                      setStructuredData({ sections: {} })
                    }}
                  >
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    템플릿 변경
                  </Button>
                </div>

                <StructuredReportEditor
                  structure={selectedStructure}
                  template={template}
                  value={structuredData}
                  onChange={setStructuredData}
                  programId={programId}
                  sessionId={sessionId}
                />
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Public Toggle - shared between modes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <Label htmlFor="isPublic" className="font-medium">
                    공개 설정
                  </Label>
                  <p className="text-sm text-gray-500">
                    {isPublic
                      ? '다른 참가자들이 볼 수 있습니다'
                      : '나만 볼 수 있습니다'}
                  </p>
                </div>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed bottom submit button */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        <div className="container mx-auto flex max-w-3xl gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={saveDraft}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            임시저장
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (mode === 'free' && content.length < REVIEW_GUIDELINES.minLength) ||
              (mode === 'structured' && !selectedStructure)
            }
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            제출하기
          </Button>
        </div>
      </div>
    </div>
  )
}
