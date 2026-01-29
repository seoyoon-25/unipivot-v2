'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Users,
  CheckCircle2,
  Heart,
  MessageSquare,
  Loader2,
  Calendar,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SurveyOption {
  id: string
  text: string
  responseCount: number
}

interface SurveyResponse {
  id: string
  optionId: string
  comment?: string
  createdAt: string
  likeCount: number
  user?: { name: string } | null
  option: { text: string }
}

interface Survey {
  id: string
  title: string
  description?: string | null
  type: string
  status: string
  startDate?: string | null
  endDate?: string | null
  isAnonymous: boolean
  responseCount: number
  options: SurveyOption[]
  responses?: SurveyResponse[]
  hasResponded: boolean
  userResponse?: { optionId: string } | null
}

export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.surveyId as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [likedResponses, setLikedResponses] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/issue-surveys/${surveyId}`)
      if (!res.ok) throw new Error('Survey not found')
      const data = await res.json()
      setSurvey(data.survey)

      // 이미 응답한 경우 결과 표시
      if (data.survey.hasResponded) {
        setShowResults(true)
        if (data.survey.userResponse) {
          setSelectedOption(data.survey.userResponse.optionId)
        }
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '설문을 불러오는데 실패했습니다',
        variant: 'destructive'
      })
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLikeResponse = async (responseId: string) => {
    if (likedResponses.has(responseId)) return

    try {
      const res = await fetch(`/api/issue-surveys/${surveyId}/responses/${responseId}/like`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '공감 실패')
      }

      const data = await res.json()

      // 로컬 상태 업데이트
      if (survey) {
        setSurvey({
          ...survey,
          responses: survey.responses?.map(r =>
            r.id === responseId ? { ...r, likeCount: data.likeCount } : r
          )
        })
      }

      setLikedResponses(prev => {
        const newSet = new Set(prev)
        newSet.add(responseId)
        return newSet
      })

      toast({
        title: '공감!',
        description: '의견에 공감했습니다'
      })
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast({
        title: '선택 필요',
        description: '답변을 선택해주세요',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`/api/issue-surveys/${surveyId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId: selectedOption,
          comment: comment.trim() || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '응답 저장에 실패했습니다')
      }

      toast({
        title: '응답 완료',
        description: '소중한 의견 감사합니다!'
      })

      // 새로고침하여 결과 표시
      fetchSurvey()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: survey?.title,
        text: survey?.description || '설문에 참여해주세요!',
        url: window.location.href
      })
    } catch (error) {
      // 공유 실패 시 URL 복사
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: '링크 복사됨',
        description: 'URL이 클립보드에 복사되었습니다'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">설문을 찾을 수 없습니다</p>
        <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
      </div>
    )
  }

  const totalResponses = survey.responseCount

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            벽보판으로 돌아가기
          </Link>
        </div>

        {/* 설문 카드 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    설문조사
                  </Badge>
                  {survey.status === 'ACTIVE' && (
                    <Badge className="bg-green-100 text-green-700">진행 중</Badge>
                  )}
                  {survey.status === 'CLOSED' && (
                    <Badge variant="secondary">종료됨</Badge>
                  )}
                </div>
                <CardTitle className="text-xl md:text-2xl">{survey.title}</CardTitle>
                {survey.description && (
                  <CardDescription className="mt-2 text-base">
                    {survey.description}
                  </CardDescription>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* 통계 */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalResponses}명 참여
              </span>
              {survey.endDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(survey.endDate).toLocaleDateString('ko-KR')}까지
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* 이미 응답했거나 결과 보기 */}
            {showResults || survey.hasResponded ? (
              <div className="space-y-6">
                {/* 결과 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">투표 결과</h3>
                  {survey.options.map(option => {
                    const percentage = totalResponses > 0
                      ? Math.round((option.responseCount / totalResponses) * 100)
                      : 0
                    const isUserChoice = option.id === selectedOption

                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn(
                            'flex items-center gap-2',
                            isUserChoice && 'font-semibold text-primary'
                          )}>
                            {isUserChoice && <CheckCircle2 className="w-4 h-4" />}
                            {option.text}
                          </span>
                          <span className="text-gray-500">{percentage}%</span>
                        </div>
                        <div className="survey-progress-bar">
                          <div
                            className="survey-progress-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-right">
                          {option.responseCount}명
                        </p>
                      </div>
                    )
                  })}
                </div>

                {survey.hasResponded && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    응답이 저장되었습니다
                  </div>
                )}

                {/* 응답 목록 */}
                {survey.responses && survey.responses.length > 0 && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      참여자 의견 ({survey.responses.length})
                    </h3>
                    <div className="space-y-3">
                      {survey.responses.map(response => (
                        <div
                          key={response.id}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {response.option.text}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {new Date(response.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              {response.comment && (
                                <p className="text-sm text-gray-700">{response.comment}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                {response.user?.name || '익명'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleLikeResponse(response.id)}
                              disabled={likedResponses.has(response.id)}
                              className={cn(
                                'flex items-center gap-1 transition-colors',
                                likedResponses.has(response.id)
                                  ? 'text-red-500'
                                  : 'text-gray-400 hover:text-red-500'
                              )}
                            >
                              <Heart className={cn(
                                'w-4 h-4',
                                likedResponses.has(response.id) && 'fill-current'
                              )} />
                              <span className="text-xs">{response.likeCount}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!survey.hasResponded && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowResults(false)}
                  >
                    투표하러 가기
                  </Button>
                )}
              </div>
            ) : (
              /* 투표 폼 */
              <div className="space-y-6">
                <RadioGroup
                  value={selectedOption || ''}
                  onValueChange={setSelectedOption}
                  className="space-y-3"
                >
                  {survey.options.map(option => (
                    <div
                      key={option.id}
                      className={cn(
                        'flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                        selectedOption === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                      onClick={() => setSelectedOption(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* 추가 의견 (선택) */}
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-sm text-gray-600">
                    추가 의견 (선택사항)
                  </Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="선택 이유나 추가 의견을 남겨주세요..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowResults(true)}
                  >
                    결과 먼저 보기
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={handleSubmit}
                    disabled={!selectedOption || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      '투표하기'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 안내 문구 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {survey.isAnonymous
            ? '이 설문은 익명으로 진행됩니다.'
            : '이 설문의 응답은 공개됩니다.'}
        </p>
      </div>
    </div>
  )
}
