'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  CreditCard,
  Star,
  Trash2,
  Edit,
  Loader2,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BankAccountForm } from '@/components/refund/BankAccountForm'
import {
  getMyBankAccounts,
  addBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
} from '@/lib/actions/bank-account'

interface BankAccount {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault: boolean
  isVerified: boolean
  createdAt: Date
}

export default function BankAccountSettingsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadAccounts = async () => {
    try {
      const data = await getMyBankAccounts()
      setAccounts(data)
    } catch (error) {
      console.error('계좌 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const handleAdd = async (data: {
    bankCode: string
    bankName: string
    accountNumber: string
    accountHolder: string
    isDefault?: boolean
  }) => {
    await addBankAccount(data)
    setShowAddDialog(false)
    await loadAccounts()
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm('이 계좌를 삭제하시겠습니까?')) return

    setDeletingId(accountId)
    try {
      await deleteBankAccount(accountId)
      await loadAccounts()
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (accountId: string) => {
    try {
      await setDefaultBankAccount(accountId)
      await loadAccounts()
    } catch (error) {
      alert(error instanceof Error ? error.message : '설정에 실패했습니다.')
    }
  }

  // 계좌번호 마스킹
  const maskAccountNumber = (num: string) => {
    if (num.length <= 4) return num
    return num.slice(0, -4).replace(/./g, '*') + num.slice(-4)
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg border">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <Link
            href="/mypage"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            마이페이지로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">계좌 관리</h1>
              <p className="text-gray-600 mt-1">
                환급금 수령을 위한 계좌를 등록하세요.
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              계좌 추가
            </Button>
          </div>
        </div>

        {/* 계좌 목록 */}
        <div className="p-6">
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 계좌가 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                환급금 수령을 위해 계좌를 등록해주세요.
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                첫 계좌 등록하기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border ${
                    account.isDefault
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {account.bankName}
                          </span>
                          {account.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              <Star className="w-3 h-3" />
                              기본
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1 font-mono">
                          {maskAccountNumber(account.accountNumber)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          예금주: {account.accountHolder}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!account.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(account.id)}
                        >
                          기본으로 설정
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        disabled={deletingId === account.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === account.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 사항 */}
        <div className="p-6 bg-gray-50 border-t">
          <h3 className="font-medium text-gray-900 mb-2">안내 사항</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>등록된 기본 계좌로 환급금이 지급됩니다.</li>
            <li>계좌 정보가 정확한지 확인해주세요.</li>
            <li>예금주명은 실명과 동일해야 합니다.</li>
            <li>계좌 정보 변경 시 진행 중인 환급에 영향이 있을 수 있습니다.</li>
          </ul>
        </div>
      </div>

      {/* 계좌 추가 다이얼로그 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계좌 추가</DialogTitle>
          </DialogHeader>
          <BankAccountForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddDialog(false)}
            submitLabel="등록"
            showDefaultOption={accounts.length > 0}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
