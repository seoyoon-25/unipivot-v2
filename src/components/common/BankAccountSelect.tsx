'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, ChevronDown } from 'lucide-react'
import { BANKS, maskAccountNumber } from '@/lib/constants/banks'

interface BankAccount {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault: boolean
}

interface NewAccountData {
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolder: string
  saveToProfile: boolean
}

interface BankAccountSelectProps {
  value: string | null // 선택된 계좌 ID 또는 'new'
  onChange: (accountId: string | null, newAccount?: NewAccountData) => void
  allowNewAccount?: boolean
  label?: string
  required?: boolean
  className?: string
}

export function BankAccountSelect({
  value,
  onChange,
  allowNewAccount = true,
  label = '반환받을 계좌',
  required = false,
  className = '',
}: BankAccountSelectProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAccountData, setNewAccountData] = useState<NewAccountData>({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    saveToProfile: false,
  })

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/my/accounts')
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts)

          // 기본 계좌가 있으면 선택
          if (!value) {
            const defaultAccount = data.accounts.find((a: BankAccount) => a.isDefault)
            if (defaultAccount) {
              onChange(defaultAccount.id)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleAccountSelect = (accountId: string) => {
    if (accountId === 'new') {
      setShowNewForm(true)
      onChange('new')
    } else {
      setShowNewForm(false)
      onChange(accountId)
    }
  }

  const handleNewAccountChange = (field: keyof NewAccountData, fieldValue: string | boolean) => {
    const updated = { ...newAccountData, [field]: fieldValue }

    if (field === 'bankCode' && typeof fieldValue === 'string') {
      const bank = BANKS.find((b) => b.code === fieldValue)
      updated.bankName = bank?.name || ''
    }

    setNewAccountData(updated)
    onChange('new', updated)
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 계좌 선택 */}
      {accounts.length > 0 && (
        <div className="space-y-2 mb-3">
          {accounts.map((account) => (
            <label
              key={account.id}
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                value === account.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="bankAccount"
                value={account.id}
                checked={value === account.id}
                onChange={() => handleAccountSelect(account.id)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{account.bankName}</span>
                  {account.isDefault && (
                    <span className="text-xs text-primary">(기본)</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-mono">
                  {maskAccountNumber(account.accountNumber)} ({account.accountHolder})
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* 새 계좌 입력 옵션 */}
      {allowNewAccount && (
        <>
          <label
            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
              value === 'new' || showNewForm
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="bankAccount"
              value="new"
              checked={value === 'new' || showNewForm}
              onChange={() => handleAccountSelect('new')}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-gray-500" />
              <span className="font-medium">새 계좌 입력</span>
            </div>
          </label>

          {/* 새 계좌 입력 폼 */}
          {showNewForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
              {/* 은행 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">은행 선택</label>
                <div className="relative">
                  <select
                    value={newAccountData.bankCode}
                    onChange={(e) => handleNewAccountChange('bankCode', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">은행을 선택하세요</option>
                    {BANKS.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 계좌번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
                <input
                  type="text"
                  value={newAccountData.accountNumber}
                  onChange={(e) =>
                    handleNewAccountChange('accountNumber', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  placeholder="- 없이 숫자만 입력"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* 예금주 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
                <input
                  type="text"
                  value={newAccountData.accountHolder}
                  onChange={(e) => handleNewAccountChange('accountHolder', e.target.value)}
                  placeholder="예금주명"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* 프로필에 저장 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAccountData.saveToProfile}
                  onChange={(e) => handleNewAccountChange('saveToProfile', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">이 계좌를 내 프로필에 저장하기</span>
              </label>
            </div>
          )}
        </>
      )}

      {/* 등록된 계좌가 없을 때 */}
      {accounts.length === 0 && !allowNewAccount && (
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">등록된 계좌가 없습니다.</p>
          <a href="/my/accounts" className="text-sm text-primary hover:underline">
            계좌 등록하러 가기
          </a>
        </div>
      )}
    </div>
  )
}
