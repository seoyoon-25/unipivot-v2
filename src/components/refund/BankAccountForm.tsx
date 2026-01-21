'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KOREAN_BANKS } from '@/lib/actions/bank-account'

interface BankAccountFormProps {
  initialData?: {
    bankCode?: string
    bankName?: string
    accountNumber?: string
    accountHolder?: string
    isDefault?: boolean
  }
  onSubmit: (data: {
    bankCode: string
    bankName: string
    accountNumber: string
    accountHolder: string
    isDefault?: boolean
  }) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  showDefaultOption?: boolean
}

export function BankAccountForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = '저장',
  showDefaultOption = false,
}: BankAccountFormProps) {
  const [bankCode, setBankCode] = useState(initialData?.bankCode || '')
  const [bankName, setBankName] = useState(initialData?.bankName || '')
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '')
  const [accountHolder, setAccountHolder] = useState(initialData?.accountHolder || '')
  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBankChange = (code: string) => {
    setBankCode(code)
    const bank = KOREAN_BANKS.find((b) => b.code === code)
    if (bank) {
      setBankName(bank.name)
    }
  }

  const formatAccountNumber = (value: string) => {
    // 숫자만 추출
    return value.replace(/[^0-9]/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!bankCode) {
      setError('은행을 선택해주세요.')
      return
    }

    const cleanAccountNumber = formatAccountNumber(accountNumber)
    if (cleanAccountNumber.length < 10) {
      setError('올바른 계좌번호를 입력해주세요.')
      return
    }

    if (!accountHolder || accountHolder.length < 2) {
      setError('예금주명을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        bankCode,
        bankName,
        accountNumber: cleanAccountNumber,
        accountHolder,
        isDefault,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 은행 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          은행 <span className="text-red-500">*</span>
        </label>
        <Select value={bankCode} onValueChange={handleBankChange}>
          <SelectTrigger>
            <SelectValue placeholder="은행을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {KOREAN_BANKS.map((bank) => (
              <SelectItem key={bank.code} value={bank.code}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 계좌번호 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          계좌번호 <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="'-' 없이 숫자만 입력"
          maxLength={20}
        />
      </div>

      {/* 예금주 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          예금주 <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          placeholder="예금주명을 입력하세요"
          maxLength={20}
        />
      </div>

      {/* 기본 계좌 설정 */}
      {showDefaultOption && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isDefault" className="text-sm text-gray-700">
            기본 계좌로 설정
          </label>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            취소
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
