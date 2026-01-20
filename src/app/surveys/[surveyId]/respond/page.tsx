'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuestionRenderer } from '@/components/survey/QuestionRenderer'
import { getSurveyForResponse, submitSurveyResponse } from '@/lib/actions/survey'
import { SurveyQuestion, SurveyStructure } from '@/types/survey'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ surveyId: string }>
}

type AnswerValue = string | string[] | number | null

export default function SurveyRespondPage({ params }: PageProps) {
  const { surveyId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [surveyData, setSurveyData] = useState<{
    survey: {
      id: string
      title: string
      description: string | null
      programTitle: string
      status: string
      deadline: Date
      includeRefund: boolean
      questions: SurveyQuestion[]
    }
    applicationId?: string
    hasResponded: boolean
    bankAccounts: Array<{
      id: string
      bankName: string
      accountNumber: string
      accountHolder: string | null
      isDefault: boolean
    }>
  } | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // 환급 정보
  const [refundChoice, setRefundChoice] = useState<'REFUND' | 'DONATE'>('REFUND')
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('')
  const [newAccount, setNewAccount] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  })
  const [useNewAccount, setUseNewAccount] = useState(false)

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const data = await getSurveyForResponse(surveyId)
        if (!data) {
          toast({
            title: '오류',
            description: '설문을 찾을 수 없습니다',
            variant: 'destructive',
          })
          return
        }

        setSurveyData(data)

        if (data.hasResponded) {
          setIsCompleted(true)
          return
        }

        // Set questions from the survey
        const surveyQuestions = data.survey.questions
        setQuestions(surveyQuestions)

        // Initialize answers
        const initialAnswers: Record<string, AnswerValue> = {}
        surveyQuestions.forEach((q: SurveyQuestion) => {
          if (q.type === 'multi_choice') {
            initialAnswers[q.id] = []
          } else {
            initialAnswers[q.id] = null
          }
        })
        setAnswers(initialAnswers)

        // Set default bank account
        if (data.bankAccounts.length > 0) {
          const defaultAccount = data.bankAccounts.find(a => a.isDefault) || data.bankAccounts[0]
          setSelectedBankAccountId(defaultAccount.id)
        }
      } catch (error) {
        console.error('Failed to load survey:', error)
        toast({
          title: '오류',
          description: '설문을 불러오는데 실패했습니다',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSurvey()
  }, [surveyId, toast])

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Clear error when user answers
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateAnswers = () => {
    const newErrors: Record<string, string> = {}

    questions.forEach((q) => {
      if (q.required) {
        const answer = answers[q.id]
        if (answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[q.id] = '필수 응답 항목입니다'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      toast({
        title: '입력 확인',
        description: '필수 항목을 모두 입력해주세요',
        variant: 'destructive',
      })
      return
    }

    if (!surveyData?.applicationId) {
      toast({
        title: '오류',
        description: '신청 정보를 찾을 수 없습니다',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format answers (filter out nulls and convert to proper type)
      const formattedAnswers = questions
        .filter((q) => answers[q.id] !== null)
        .map((q) => ({
          questionId: q.id,
          value: answers[q.id] as string | string[] | number | boolean,
        }))

      // Build refund info if needed
      let refundInfo = undefined
      if (surveyData.survey.includeRefund) {
        if (refundChoice === 'REFUND') {
          if (useNewAccount) {
            refundInfo = {
              choice: 'REFUND' as const,
              newAccount: {
                bankCode: newAccount.bankCode,
                bankName: newAccount.bankName,
                accountNumber: newAccount.accountNumber,
                accountHolder: newAccount.accountHolder,
              },
            }
          } else {
            refundInfo = {
              choice: 'REFUND' as const,
              bankAccountId: selectedBankAccountId,
            }
          }
        } else {
          refundInfo = {
            choice: 'DONATE' as const,
          }
        }
      }

      await submitSurveyResponse({
        surveyId,
        applicationId: surveyData.applicationId,
        answers: formattedAnswers,
        refundInfo,
      })

      setIsCompleted(true)
      toast({
        title: '제출 완료',
        description: '설문이 성공적으로 제출되었습니다',
      })
    } catch (error) {
      console.error('Failed to submit survey:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '설문 제출에 실패했습니다',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold">설문을 찾을 수 없습니다</h2>
            <p className="mt-2 text-gray-500">요청하신 설문이 존재하지 않거나 접근 권한이 없습니다.</p>
            <Button className="mt-4" onClick={() => router.push('/mypage')}>
              마이페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold">설문 완료</h2>
            <p className="mt-2 text-gray-500">
              설문에 참여해 주셔서 감사합니다!
            </p>
            <Button className="mt-6" onClick={() => router.push('/mypage')}>
              마이페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deadline = new Date(surveyData.survey.deadline)
  const isExpired = new Date() > deadline

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{surveyData.survey.title}</h1>
          {surveyData.survey.description && (
            <p className="mt-2 text-gray-600">{surveyData.survey.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>{surveyData.survey.programTitle}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                마감: {deadline.toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {isExpired ? (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-lg font-semibold">마감된 설문입니다</h2>
              <p className="mt-2 text-gray-500">
                이 설문은 {deadline.toLocaleDateString('ko-KR')}에 마감되었습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Questions */}
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-500 mb-2">
                      질문 {index + 1}/{questions.length}
                    </div>
                    <QuestionRenderer
                      question={question}
                      value={answers[question.id]}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                      error={errors[question.id]}
                    />
                  </CardContent>
                </Card>
              ))}

              {/* Refund Section */}
              {surveyData.survey.includeRefund && (
                <Card>
                  <CardHeader>
                    <CardTitle>보증금 환급 안내</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={refundChoice === 'REFUND' ? 'default' : 'outline'}
                        onClick={() => setRefundChoice('REFUND')}
                        className="flex-1"
                      >
                        환급받기
                      </Button>
                      <Button
                        type="button"
                        variant={refundChoice === 'DONATE' ? 'default' : 'outline'}
                        onClick={() => setRefundChoice('DONATE')}
                        className="flex-1"
                      >
                        기부하기
                      </Button>
                    </div>

                    {refundChoice === 'REFUND' && (
                      <div className="space-y-4 mt-4">
                        {surveyData.bankAccounts.length > 0 && !useNewAccount && (
                          <div className="space-y-2">
                            <Label>등록된 계좌 선택</Label>
                            {surveyData.bankAccounts.map((account) => (
                              <div
                                key={account.id}
                                className={cn(
                                  'p-3 border rounded-lg cursor-pointer',
                                  selectedBankAccountId === account.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                )}
                                onClick={() => setSelectedBankAccountId(account.id)}
                              >
                                <div className="font-medium">{account.bankName}</div>
                                <div className="text-sm text-gray-500">
                                  {account.accountNumber}
                                  {account.accountHolder && ` (${account.accountHolder})`}
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setUseNewAccount(true)}
                            >
                              새 계좌 입력
                            </Button>
                          </div>
                        )}

                        {(useNewAccount || surveyData.bankAccounts.length === 0) && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="bankName">은행명</Label>
                              <Input
                                id="bankName"
                                value={newAccount.bankName}
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    bankName: e.target.value,
                                  }))
                                }
                                placeholder="예: 카카오뱅크"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="accountNumber">계좌번호</Label>
                              <Input
                                id="accountNumber"
                                value={newAccount.accountNumber}
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    accountNumber: e.target.value,
                                  }))
                                }
                                placeholder="- 없이 숫자만 입력"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="accountHolder">예금주</Label>
                              <Input
                                id="accountHolder"
                                value={newAccount.accountHolder}
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    accountHolder: e.target.value,
                                  }))
                                }
                                placeholder="예금주명"
                              />
                            </div>
                            {surveyData.bankAccounts.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setUseNewAccount(false)}
                              >
                                등록된 계좌 선택
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {refundChoice === 'DONATE' && (
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-amber-800">
                          보증금을 기부해 주시면 독서모임 운영에 큰 도움이 됩니다.
                          감사합니다! 🙏
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  '제출하기'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
