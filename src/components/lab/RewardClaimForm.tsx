'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Gift,
  Phone,
  User,
  CreditCard,
  ChevronDown,
  MessageCircle,
} from 'lucide-react'
import { BANKS } from '@/lib/constants/banks'
import confetti from 'canvas-confetti'

interface RewardClaimFormProps {
  surveyId: string
  rewardAmount: number
  surveyTitle: string
  onSuccess?: () => void
}

interface ExistingClaim {
  id: string
  status: string
  amount: number
  bankName: string
  accountNumber: string
  realName: string
  createdAt: string
  paidAt: string | null
}

export function RewardClaimForm({
  surveyId,
  rewardAmount,
  surveyTitle,
  onSuccess,
}: RewardClaimFormProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingClaim, setExistingClaim] = useState<ExistingClaim | null>(null)

  // 폼 데이터
  const [formData, setFormData] = useState({
    realName: '',
    phoneNumber: '',
    bankCode: '',
    bankName: '',
    accountNumber: '',
  })

  // 기존 계좌 사용
  const [useExistingAccount, setUseExistingAccount] = useState(false)
  const [existingAccounts, setExistingAccounts] = useState<any[]>([])

  // 기존 신청 확인
  useEffect(() => {
    const checkExistingClaim = async () => {
      try {
        const res = await fetch(`/api/lab/surveys/${surveyId}/claim`)
        const data = await res.json()

        if (data.hasClaim) {
          setExistingClaim(data.claim)
        }

        // 사용자 정보로 폼 초기화
        if (session?.user) {
          setFormData((prev) => ({
            ...prev,
            realName: session.user.name || '',
          }))
        }

        // 기존 계좌 목록 가져오기
        const accountRes = await fetch('/api/my/accounts')
        if (accountRes.ok) {
          const accountData = await accountRes.json()
          setExistingAccounts(accountData.accounts || [])
        }
      } catch (err) {
        console.error('Failed to check existing claim:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      checkExistingClaim()
    } else {
      setIsLoading(false)
    }
  }, [surveyId, session])

  const handleBankChange = (bankCode: string) => {
    const bank = BANKS.find((b) => b.code === bankCode)
    setFormData({
      ...formData,
      bankCode,
      bankName: bank?.name || '',
    })
  }

  const handleExistingAccountSelect = (account: any) => {
    setFormData({
      ...formData,
      bankCode: account.bankCode,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      realName: account.accountHolder,
    })
    setUseExistingAccount(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/lab/surveys/${surveyId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '신청에 실패했습니다.')
      }

      // 성공!
      setSuccess(true)

      // Confetti 효과
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1E3A5F', '#2563eb', '#10b981', '#f59e0b'],
      })

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            승인 대기중
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            승인됨
          </span>
        )
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            지급 완료
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            거절됨
          </span>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // 이미 신청한 경우
  if (existingClaim) {
    return (
      <div className="bg-white rounded-2xl p-6 border">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">사례비 신청 완료</h3>
          <div className="mb-4">{getStatusBadge(existingClaim.status)}</div>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">신청일</span>
              <span>{new Date(existingClaim.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">금액</span>
              <span className="font-medium">{existingClaim.amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">계좌</span>
              <span>
                {existingClaim.bankName} {existingClaim.accountNumber}
              </span>
            </div>
            {existingClaim.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">지급일</span>
                <span>{new Date(existingClaim.paidAt).toLocaleDateString('ko-KR')}</span>
              </div>
            )}
          </div>

          {existingClaim.status === 'PENDING' && (
            <p className="text-sm text-gray-500 mt-4">
              관리자 승인 후 영업일 기준 2-3일 내에 지급됩니다.
            </p>
          )}
        </div>
      </div>
    )
  }

  // 신청 성공
  if (success) {
    return (
      <div className="bg-white rounded-2xl p-6 border text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-600 mb-2">신청 완료!</h3>
        <p className="text-gray-600 mb-4">
          사례비 {rewardAmount.toLocaleString()}원 신청이 완료되었습니다.
        </p>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <p>관리자 승인 후 영업일 기준 2-3일 내에 지급됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Wallet className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">사례비 신청</h3>
          <p className="text-primary font-medium">{rewardAmount.toLocaleString()}원</p>
        </div>
      </div>

      {/* 기존 계좌 선택 */}
      {existingAccounts.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            등록된 계좌 사용
          </label>
          <div className="space-y-2">
            {existingAccounts.map((account) => (
              <label
                key={account.id}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  useExistingAccount &&
                  formData.accountNumber === account.accountNumber
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="existingAccount"
                  checked={
                    useExistingAccount &&
                    formData.accountNumber === account.accountNumber
                  }
                  onChange={() => handleExistingAccountSelect(account)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="font-medium">{account.bankName}</span>
                  <p className="text-sm text-gray-500">
                    {account.accountNumber.slice(0, 4)}****
                    {account.accountNumber.slice(-4)} ({account.accountHolder})
                  </p>
                </div>
                {account.isDefault && (
                  <span className="text-xs text-primary">기본</span>
                )}
              </label>
            ))}
            <label
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                !useExistingAccount
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="existingAccount"
                checked={!useExistingAccount}
                onChange={() => {
                  setUseExistingAccount(false)
                  setFormData({
                    ...formData,
                    bankCode: '',
                    bankName: '',
                    accountNumber: '',
                  })
                }}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="font-medium">새 계좌 입력</span>
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 실명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            실명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.realName}
            onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
            placeholder="예금주와 동일한 이름"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="w-4 h-4 inline mr-1" />
            전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                phoneNumber: e.target.value.replace(/[^0-9]/g, ''),
              })
            }
            placeholder="01012345678"
            required
            maxLength={11}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* 은행 선택 */}
        {!useExistingAccount && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CreditCard className="w-4 h-4 inline mr-1" />
                은행 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.bankCode}
                  onChange={(e) => handleBankChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl appearance-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">은행 선택</option>
                  {BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 계좌번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                계좌번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountNumber: e.target.value.replace(/[^0-9]/g, ''),
                  })
                }
                placeholder="- 없이 숫자만 입력"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700">{error}</p>
              <a
                href="/contact"
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline mt-2"
              >
                <MessageCircle className="w-4 h-4" />
                문의하기
              </a>
            </div>
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
              <Loader2 className="w-5 h-5 animate-spin" />
              신청 중...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              사례비 {rewardAmount.toLocaleString()}원 신청하기
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          신청 후 관리자 승인을 거쳐 영업일 기준 2-3일 내에 지급됩니다.
        </p>
      </form>
    </div>
  )
}
