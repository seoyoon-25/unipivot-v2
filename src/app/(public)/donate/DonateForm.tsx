'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, CreditCard, Building2, Check } from 'lucide-react'
import { createDonation } from '@/lib/actions/public'

const donationOptions = [
  { amount: 10000, label: '1만원', description: '독서모임 책 1권' },
  { amount: 30000, label: '3만원', description: '세미나 운영비' },
  { amount: 50000, label: '5만원', description: '프로그램 기획비' },
  { amount: 100000, label: '10만원', description: '탐방 교통비' },
]

export default function DonateForm() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState<'CARD' | 'BANK_TRANSFER' | null>(null)
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0)

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount < 1000) {
      setError('최소 후원 금액은 1,000원입니다.')
      return
    }
    if (!method) {
      setError('결제 방법을 선택해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createDonation({
        amount: finalAmount,
        method,
        message: message || undefined,
        anonymous
      })
      setSuccess(true)
    } catch (err) {
      setError('후원 신청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">후원 신청이 완료되었습니다!</h2>
        <p className="text-gray-600 mb-2">
          {method === 'BANK_TRANSFER'
            ? '아래 계좌로 입금해주시면 확인 후 처리됩니다.'
            : '카드 결제가 정상적으로 접수되었습니다.'
          }
        </p>
        {method === 'BANK_TRANSFER' && (
          <div className="bg-white rounded-xl p-4 inline-block mt-4">
            <p className="font-bold text-gray-900">우리은행 1002-000-000000</p>
            <p className="text-sm text-gray-500">예금주: 사단법인 유니피벗</p>
            <p className="text-primary font-bold mt-2">₩{finalAmount.toLocaleString()}</p>
          </div>
        )}
        <div className="mt-8">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Amount Selection */}
      <div className="bg-primary-light rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">후원금 선택</h2>
            <p className="text-gray-600 text-sm">원하시는 금액을 선택해주세요</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {donationOptions.map((option) => (
            <button
              key={option.amount}
              onClick={() => {
                setSelectedAmount(option.amount)
                setCustomAmount('')
              }}
              className={`rounded-xl p-4 text-center transition-all ${
                selectedAmount === option.amount
                  ? 'bg-primary text-white ring-2 ring-primary'
                  : 'bg-white hover:ring-2 hover:ring-primary'
              }`}
            >
              <p className={`text-2xl font-bold ${selectedAmount === option.amount ? 'text-white' : 'text-primary'}`}>
                {option.label}
              </p>
              <p className={`text-xs mt-1 ${selectedAmount === option.amount ? 'text-white/80' : 'text-gray-500'}`}>
                {option.description}
              </p>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">직접 입력</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
              }}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="금액 입력"
              min="1000"
              step="1000"
            />
            <span className="flex items-center px-4 text-gray-500">원</span>
          </div>
        </div>

        {finalAmount > 0 && (
          <div className="mt-4 p-4 bg-white rounded-xl">
            <p className="text-gray-600">선택한 금액</p>
            <p className="text-3xl font-bold text-primary">₩{finalAmount.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => setMethod('CARD')}
          className={`bg-white rounded-2xl p-6 border-2 transition-all text-left ${
            method === 'CARD' ? 'border-primary' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              method === 'CARD' ? 'bg-primary' : 'bg-blue-100'
            }`}>
              <CreditCard className={`w-5 h-5 ${method === 'CARD' ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">카드 결제</h3>
              <p className="text-gray-500 text-sm">신용카드, 체크카드</p>
            </div>
          </div>
          {method === 'CARD' && (
            <p className="text-sm text-primary">카드 결제가 선택되었습니다</p>
          )}
        </button>

        <button
          onClick={() => setMethod('BANK_TRANSFER')}
          className={`bg-white rounded-2xl p-6 border-2 transition-all text-left ${
            method === 'BANK_TRANSFER' ? 'border-primary' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              method === 'BANK_TRANSFER' ? 'bg-primary' : 'bg-green-100'
            }`}>
              <Building2 className={`w-5 h-5 ${method === 'BANK_TRANSFER' ? 'text-white' : 'text-green-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">계좌 이체</h3>
              <p className="text-gray-500 text-sm">무통장 입금</p>
            </div>
          </div>
          {method === 'BANK_TRANSFER' && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">우리은행 1002-000-000000</p>
              <p className="text-xs text-gray-400">예금주: 사단법인 유니피벗</p>
            </div>
          )}
        </button>
      </div>

      {/* Message & Options */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">추가 정보 (선택)</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">응원 메시지</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            rows={3}
            placeholder="유니피벗에 응원의 메시지를 남겨주세요"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-5 h-5 text-primary rounded focus:ring-primary"
          />
          <span className="text-gray-700">익명으로 후원하기</span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !finalAmount || !method}
        className="w-full py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '처리 중...' : `₩${finalAmount.toLocaleString()} 후원하기`}
      </button>
    </div>
  )
}
