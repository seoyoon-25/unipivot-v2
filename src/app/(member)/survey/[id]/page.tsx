'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ClipboardList,
  CheckCircle2,
  Calendar,
  Users,
  BookOpen,
  Wallet,
  Heart,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { BankAccountSelect } from '@/components/common/BankAccountSelect'
import { BANKS } from '@/lib/constants/banks'
import { formatCurrency } from '@/lib/utils/deposit-calculator'

interface SurveyQuestion {
  id: string
  type: 'rating' | 'single' | 'multiple' | 'text'
  question: string
  options?: string[]
  required: boolean
}

export default function SurveyResponsePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [survey, setSurvey] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [refundCalc, setRefundCalc] = useState<any>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  // 폼 데이터
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [refundChoice, setRefundChoice] = useState<'REFUND' | 'DONATE'>('REFUND')
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [newAccountData, setNewAccountData] = useState<any>(null)
  const [donationMessage, setDonationMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [receiptRequested, setReceiptRequested] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [id])

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${id}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '만족도 조사를 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      setSurvey(data.survey)
      setStats(data.stats)
      setRefundCalc(data.refundCalculation)
      setAlreadySubmitted(data.alreadySubmitted)

      if (data.bankAccounts?.length > 0) {
        const defaultAccount = data.bankAccounts.find((a: any) => a.isDefault)
        if (defaultAccount) {
          setSelectedAccountId(defaultAccount.id)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 필수 응답 확인
    const questions: SurveyQuestion[] = JSON.parse(survey.questions)
    for (const q of questions) {
      if (q.required && !answers[q.id]) {
        setError(`"${q.question}" 항목에 응답해주세요.`)
        return
      }
    }

    // 반환 선택 시 계좌 확인
    if (refundChoice === 'REFUND') {
      if (!selectedAccountId && selectedAccountId !== 'new') {
        setError('반환받을 계좌를 선택해주세요.')
        return
      }
      if (
        selectedAccountId === 'new' &&
        (!newAccountData?.bankCode || !newAccountData?.accountNumber || !newAccountData?.accountHolder)
      ) {
        setError('계좌 정보를 모두 입력해주세요.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const submitData: any = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
        refundChoice,
      }

      if (refundChoice === 'REFUND') {
        if (selectedAccountId && selectedAccountId !== 'new') {
          submitData.bankAccountId = selectedAccountId
        } else if (newAccountData) {
          submitData.newBankCode = newAccountData.bankCode
          submitData.newBankName = newAccountData.bankName
          submitData.newAccountNumber = newAccountData.accountNumber
          submitData.newAccountHolder = newAccountData.accountHolder
          submitData.saveNewAccount = newAccountData.saveToProfile
        }
      } else {
        submitData.donationMessage = donationMessage
        submitData.isAnonymous = isAnonymous
        submitData.receiptRequested = receiptRequested
      }

      const response = await fetch(`/api/surveys/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '제출에 실패했습니다.')
      }

      const data = await response.json()
      setSuccess(data.message)
      setAlreadySubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
        <Link href="/my" className="mt-4 inline-block text-primary hover:underline">
          마이페이지로 돌아가기
        </Link>
      </div>
    )
  }

  if (success || alreadySubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">응답 완료</h1>
        <p className="text-gray-600 mb-6">{success || '이미 응답하셨습니다.'}</p>
        <Link
          href="/my"
          className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          마이페이지로 돌아가기
        </Link>
      </div>
    )
  }

  const questions: SurveyQuestion[] = JSON.parse(survey.questions)

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">만족도 조사</h1>
        <p className="text-gray-600 mt-2">{survey.program.title}</p>
      </div>

      {/* 참여 현황 */}
      {stats && (
        <div className="bg-white rounded-2xl p-6 border mb-6">
          <h2 className="font-bold mb-4">참여 현황</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">출석</span>
              </div>
              <p className="text-lg font-bold">
                {stats.attendedSessions}/{stats.totalSessions}회
              </p>
              <p className="text-sm text-gray-500">({stats.attendanceRate}%)</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">독후감</span>
              </div>
              <p className="text-lg font-bold">
                {stats.submittedReports}/{stats.totalSessions}회
              </p>
              <p className="text-sm text-gray-500">({stats.reportRate}%)</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">예상 반환</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {refundCalc ? formatCurrency(refundCalc.refundAmount) : '-'}
              </p>
              <p className="text-sm text-gray-500">
                ({refundCalc?.refundRate || 0}%)
              </p>
            </div>
          </div>
          {refundCalc && !refundCalc.eligible && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {refundCalc.ineligibleReason}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 질문들 */}
        <div className="bg-white rounded-2xl p-6 border">
          <h2 className="font-bold mb-6">설문 응답</h2>
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id}>
                <label className="block font-medium mb-3">
                  {index + 1}. {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'rating' && question.options && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                          answers[question.id] === optIndex + 1
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optIndex + 1}
                          checked={answers[question.id] === optIndex + 1}
                          onChange={() => handleAnswerChange(question.id, optIndex + 1)}
                          className="sr-only"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'single' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'text' && (
                  <textarea
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="자유롭게 작성해주세요..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 보증금 처리 */}
        {refundCalc && refundCalc.refundAmount > 0 && (
          <div className="bg-white rounded-2xl p-6 border">
            <h2 className="font-bold mb-4">보증금 처리 방법</h2>

            <div className="space-y-3 mb-6">
              <label
                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                  refundChoice === 'REFUND'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="refundChoice"
                  value="REFUND"
                  checked={refundChoice === 'REFUND'}
                  onChange={() => setRefundChoice('REFUND')}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-primary" />
                  <div>
                    <span className="font-medium">보증금 반환받기</span>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(refundCalc.refundAmount)}
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                  refundChoice === 'DONATE'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="refundChoice"
                  value="DONATE"
                  checked={refundChoice === 'DONATE'}
                  onChange={() => setRefundChoice('DONATE')}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-pink-500" />
                  <div>
                    <span className="font-medium">유니피벗에 후원하기</span>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(refundCalc.refundAmount)}을 후원금으로 전환
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* 반환 선택 시 계좌 */}
            {refundChoice === 'REFUND' && (
              <BankAccountSelect
                value={selectedAccountId}
                onChange={(accountId, newAccount) => {
                  setSelectedAccountId(accountId)
                  setNewAccountData(newAccount)
                }}
                allowNewAccount={true}
                label="반환받을 계좌"
                required
              />
            )}

            {/* 후원 선택 시 */}
            {refundChoice === 'DONATE' && (
              <div className="space-y-4 p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-pink-700">
                  후원해 주셔서 감사합니다! 기부금 영수증 발급이 가능합니다.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    후원 메시지 (선택)
                  </label>
                  <textarea
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    placeholder="유니피벗에 응원 메시지를 남겨주세요..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">익명으로 후원하기</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptRequested}
                      onChange={(e) => setReceiptRequested(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">기부금 영수증 받기</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              제출 중...
            </>
          ) : (
            '제출하기'
          )}
        </button>

        {/* 기한 안내 */}
        <p className="text-center text-sm text-gray-500">
          응답 기한: {new Date(survey.deadline).toLocaleDateString('ko-KR')}까지
        </p>
      </form>
    </div>
  )
}
