'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { submitBookReport } from '@/lib/actions/review'
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

interface PageProps {
  params: Promise<{ programId: string; sessionId: string }>
}

export default function WriteReviewPage({ params }: PageProps) {
  const { programId, sessionId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // Placeholder session data (would be fetched from API in real implementation)
  const [sessionData, setSessionData] = useState<{
    sessionNumber: number
    title: string | null
    date: Date
    book?: { title: string }
  } | null>(null)

  // Load draft on mount
  useEffect(() => {
    const draft = loadReviewDraft(programId, sessionId)
    if (draft) {
      setTitle(draft.title)
      setContent(draft.content)
      setIsPublic(draft.isPublic)
      setLastSaved(draft.savedAt)
    }

    // Fetch session data
    // In real implementation, this would call an API
    setSessionData({
      sessionNumber: 1,
      title: null,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    })
  }, [programId, sessionId])

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

  // Save on blur
  const handleBlur = () => {
    saveDraft()
  }

  const handleSubmit = async () => {
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

      // Clear draft on successful submission
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

  const urgency = sessionData ? getDeadlineUrgency(sessionData.date) : 'safe'
  const deadlineText = sessionData ? formatTimeUntilDeadline(sessionData.date) : ''

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

        {/* Writing Form */}
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

            {/* Public Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
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
            disabled={isSubmitting || content.length < REVIEW_GUIDELINES.minLength}
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
