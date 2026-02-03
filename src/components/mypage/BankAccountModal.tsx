'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, CreditCard } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { BANKS, type Bank } from '@/lib/constants/banks'

interface BankAccount {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault: boolean
}

interface BankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (account: BankAccount) => void
  account?: BankAccount | null
}

export function BankAccountModal({ isOpen, onClose, onSave, account }: BankAccountModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen)

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEsc])

  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountHolder: '',
    isDefault: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (account) {
      setFormData({
        bankCode: account.bankCode,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder,
        isDefault: account.isDefault,
      })
    } else {
      setFormData({
        bankCode: '',
        accountNumber: '',
        accountHolder: '',
        isDefault: false,
      })
    }
    setErrors({})
  }, [account, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.bankCode) {
      newErrors.bankCode = '은행을 선택해주세요.'
    }
    if (!formData.accountNumber) {
      newErrors.accountNumber = '계좌번호를 입력해주세요.'
    } else if (formData.accountNumber.replace(/\D/g, '').length < 10) {
      newErrors.accountNumber = '유효한 계좌번호를 입력해주세요.'
    }
    if (!formData.accountHolder) {
      newErrors.accountHolder = '예금주를 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const url = account ? `/api/my/accounts/${account.id}` : '/api/my/accounts'
      const method = account ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '저장에 실패했습니다.')
      }

      const { account: savedAccount } = await response.json()
      onSave(savedAccount)
      onClose()
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : '저장에 실패했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedBank = BANKS.find((b) => b.code === formData.bankCode)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="bank-modal-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h2 id="bank-modal-title" className="text-lg font-bold">{account ? '계좌 수정' : '계좌 등록'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* 은행 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">은행 선택</label>
            <select
              value={formData.bankCode}
              onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.bankCode ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">은행을 선택하세요</option>
              {BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            {errors.bankCode && <p className="mt-1 text-sm text-red-500">{errors.bankCode}</p>}
          </div>

          {/* 계좌번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">계좌번호</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) =>
                setFormData({ ...formData, accountNumber: e.target.value.replace(/[^0-9-]/g, '') })
              }
              placeholder="- 없이 숫자만 입력"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.accountNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.accountNumber}</p>
            )}
          </div>

          {/* 예금주 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">예금주</label>
            <input
              type="text"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              placeholder="예금주명"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.accountHolder ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.accountHolder && (
              <p className="mt-1 text-sm text-red-500">{errors.accountHolder}</p>
            )}
          </div>

          {/* 기본 계좌 설정 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">기본 계좌로 설정</span>
          </label>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{errors.submit}</div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : account ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
