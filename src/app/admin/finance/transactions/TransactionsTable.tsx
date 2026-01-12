'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown, Wallet, X, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { createFinanceTransaction } from '@/lib/actions/admin'

interface FinanceAccount {
  id: string
  code: string
  name: string
  type: string
  category: string
}

interface Fund {
  id: string
  name: string
  type: string
  balance: number
}

interface Transaction {
  id: string
  date: Date
  type: string
  amount: number
  description: string
  vendor: string | null
  paymentMethod: string | null
  evidenceType: string | null
  fund: { id: string; name: string }
  financeAccount: { id: string; code: string; name: string }
}

interface Props {
  transactions: Transaction[]
  total: number
  pages: number
  currentPage: number
  summary: { income: number; expense: number; balance: number }
  searchParams: { type?: string; page?: string }
  accounts: FinanceAccount[]
  funds: Fund[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR').format(amount)
}

const evidenceTypes: Record<string, string> = {
  'TAX_INVOICE': '세금계산서',
  'CASH_RECEIPT': '현금영수증',
  'CARD_SLIP': '카드전표',
  'SIMPLE': '간이영수증',
  'NONE': '증빙없음'
}

const paymentMethods: Record<string, string> = {
  'TRANSFER': '계좌이체',
  'CARD': '카드결제',
  'CASH': '현금'
}

export default function TransactionsTable({
  transactions,
  total,
  pages,
  currentPage,
  summary,
  searchParams,
  accounts,
  funds
}: Props) {
  const router = useRouter()
  const [type, setType] = useState(searchParams.type || '')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: 'INCOME',
    fundId: funds[0]?.id || '',
    financeAccountId: '',
    amount: 0,
    description: '',
    vendor: '',
    paymentMethod: 'TRANSFER',
    evidenceType: 'NONE',
    date: new Date().toISOString().split('T')[0]
  })

  const filteredAccounts = accounts.filter(a => a.type === form.type)

  const handleFilter = (newType: string) => {
    setType(newType)
    const params = new URLSearchParams()
    if (newType) params.set('type', newType)
    router.push(`/admin/finance/transactions?${params.toString()}`)
  }

  const handleSave = async () => {
    if (!form.amount || form.amount <= 0) {
      alert('금액을 입력해주세요.')
      return
    }
    if (!form.fundId) {
      alert('기금을 선택해주세요.')
      return
    }
    if (!form.financeAccountId) {
      alert('계정과목을 선택해주세요.')
      return
    }
    if (!form.description.trim()) {
      alert('적요를 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      await createFinanceTransaction({
        date: new Date(form.date),
        type: form.type,
        fundId: form.fundId,
        financeAccountId: form.financeAccountId,
        amount: form.amount,
        description: form.description,
        vendor: form.vendor || undefined,
        paymentMethod: form.paymentMethod,
        evidenceType: form.evidenceType
      })
      setShowModal(false)
      setForm({
        type: 'INCOME',
        fundId: funds[0]?.id || '',
        financeAccountId: '',
        amount: 0,
        description: '',
        vendor: '',
        paymentMethod: 'TRANSFER',
        evidenceType: 'NONE',
        date: new Date().toISOString().split('T')[0]
      })
      router.refresh()
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">거래 내역</h1>
          <p className="text-gray-600">수입/지출 거래 관리</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          거래 등록
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 수입</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}원</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 지출</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}원</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">잔액</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(summary.balance)}원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex gap-2">
          {['', 'INCOME', 'EXPENSE'].map((t) => (
            <button
              key={t}
              onClick={() => handleFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === '' ? '전체' : t === 'INCOME' ? '수입' : '지출'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            거래 내역이 없습니다.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">계정</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">적요</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">거래처</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">증빙</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(tx.date).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg font-medium ${
                      tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.type === 'INCOME' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {tx.type === 'INCOME' ? '수입' : '지출'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-sm">{tx.financeAccount.code}</span>
                    <span className="ml-2 text-gray-900">{tx.financeAccount.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {tx.vendor || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {tx.evidenceType ? evidenceTypes[tx.evidenceType] : '-'}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">총 {total}건</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    const params = new URLSearchParams()
                    if (type) params.set('type', type)
                    params.set('page', (currentPage - 1).toString())
                    router.push(`/admin/finance/transactions?${params.toString()}`)
                  }
                }}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">{currentPage} / {pages}</span>
              <button
                onClick={() => {
                  if (currentPage < pages) {
                    const params = new URLSearchParams()
                    if (type) params.set('type', type)
                    params.set('page', (currentPage + 1).toString())
                    router.push(`/admin/finance/transactions?${params.toString()}`)
                  }
                }}
                disabled={currentPage === pages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">거래 등록</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'INCOME', financeAccountId: '' })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      form.type === 'INCOME'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    수입
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'EXPENSE', financeAccountId: '' })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      form.type === 'EXPENSE'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    지출
                  </button>
                </div>
              </div>

              {/* 기금 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기금</label>
                <select
                  value={form.fundId}
                  onChange={(e) => setForm({ ...form, fundId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">기금 선택</option>
                  {funds.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name} ({formatCurrency(fund.balance)}원)
                    </option>
                  ))}
                </select>
              </div>

              {/* 계정과목 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">계정과목</label>
                <select
                  value={form.financeAccountId}
                  onChange={(e) => setForm({ ...form, financeAccountId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">계정과목 선택</option>
                  {filteredAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">금액 (원)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="1000"
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* 적요 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">적요</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="거래 내용을 입력하세요"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* 거래처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">거래처 (선택)</label>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  placeholder="거래처명"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* 결제수단 & 증빙 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">결제수단</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {Object.entries(paymentMethods).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">증빙</label>
                  <select
                    value={form.evidenceType}
                    onChange={(e) => setForm({ ...form, evidenceType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {Object.entries(evidenceTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
