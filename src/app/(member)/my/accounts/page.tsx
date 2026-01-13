'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, Star, Trash2, Edit2, AlertCircle, Building2 } from 'lucide-react'
import { BankAccountModal } from '@/components/mypage/BankAccountModal'
import { maskAccountNumber } from '@/lib/constants/banks'

interface BankAccount {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault: boolean
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/my/accounts')
      if (!response.ok) throw new Error('계좌 목록을 불러오는데 실패했습니다.')
      const data = await response.json()
      setAccounts(data.accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleSave = (savedAccount: BankAccount) => {
    if (editingAccount) {
      // 수정
      setAccounts(accounts.map((a) => (a.id === savedAccount.id ? savedAccount : a)))
    } else {
      // 새로 추가
      setAccounts([...accounts, savedAccount])
    }
    // 기본 계좌 변경 시 다른 계좌의 기본 상태 업데이트
    if (savedAccount.isDefault) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === savedAccount.id ? savedAccount : { ...a, isDefault: false }
        )
      )
    }
    setEditingAccount(null)
  }

  const handleSetDefault = async (accountId: string) => {
    try {
      const response = await fetch(`/api/my/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })

      if (!response.ok) throw new Error('기본 계좌 설정에 실패했습니다.')

      setAccounts(
        accounts.map((a) => ({
          ...a,
          isDefault: a.id === accountId,
        }))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm('이 계좌를 삭제하시겠습니까?')) return

    setDeletingId(accountId)

    try {
      const response = await fetch(`/api/my/accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('계좌 삭제에 실패했습니다.')

      // 삭제 후 목록 새로고침 (기본 계좌 변경 처리를 위해)
      fetchAccounts()
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  const openEditModal = (account: BankAccount) => {
    setEditingAccount(account)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setEditingAccount(null)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-primary" />
          계좌 관리
        </h1>
        <p className="text-gray-600 mt-2">보증금 반환 시 사용할 계좌를 등록해주세요.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* 계좌 목록 */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">등록된 계좌가 없습니다.</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />첫 계좌 등록하기
            </button>
          </div>
        ) : (
          <>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{account.bankName}</span>
                        {account.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            <Star className="w-3 h-3" />
                            기본 계좌
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1 font-mono">
                        {maskAccountNumber(account.accountNumber)}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        예금주: {account.accountHolder}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  {!account.isDefault && (
                    <button
                      onClick={() => handleSetDefault(account.id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      기본으로 설정
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(account)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {/* 새 계좌 추가 버튼 */}
            {accounts.length < 5 && (
              <button
                onClick={openAddModal}
                className="w-full p-5 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />새 계좌 추가하기
              </button>
            )}
          </>
        )}
      </div>

      {/* 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
        <p>최대 5개까지 등록할 수 있습니다. ({accounts.length}/5)</p>
      </div>

      {/* 모달 */}
      <BankAccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAccount(null)
        }}
        onSave={handleSave}
        account={editingAccount}
      />
    </div>
  )
}
