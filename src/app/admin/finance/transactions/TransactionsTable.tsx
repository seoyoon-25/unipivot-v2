'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, TrendingDown, Wallet, X, Save } from 'lucide-react'
import { createTransaction } from '@/lib/actions/admin'

interface Transaction {
  id: string
  type: string
  category: string | null
  amount: number
  description: string | null
  date: Date
}

interface Props {
  transactions: Transaction[]
  total: number
  pages: number
  currentPage: number
  summary: { income: number; expense: number; balance: number }
  searchParams: { type?: string }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
}

const categories: Record<string, string> = {
  'DONATION': '후원금',
  'PROGRAM_FEE': '프로그램 참가비',
  'GRANT': '보조금',
  'SALARY': '급여',
  'RENT': '임대료',
  'SUPPLIES': '운영비',
  'OTHER': '기타'
}

export default function TransactionsTable({ transactions, total, pages, currentPage, summary, searchParams }: Props) {
  const router = useRouter()
  const [type, setType] = useState(searchParams.type || '')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: 'INCOME',
    category: 'OTHER',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

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

    setSaving(true)
    try {
      await createTransaction({
        ...form,
        date: new Date(form.date)
      })
      setShowModal(false)
      setForm({
        type: 'INCOME',
        category: 'OTHER',
        amount: 0,
        description: '',
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
        <h1 className="text-2xl font-bold text-gray-900">수입/지출 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 거래
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 수입</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 지출</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">잔액</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-primary' : 'text-red-600'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
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
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            거래 내역이 없습니다.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">날짜</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">유형</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">분류</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">내용</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(tx.date).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      tx.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'INCOME' ? '수입' : '지출'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {categories[tx.category || 'OTHER'] || tx.category}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {tx.description || '-'}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
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
            <div className="flex gap-2">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (type) params.set('type', type)
                    params.set('page', (i + 1).toString())
                    router.push(`/admin/finance/transactions?${params.toString()}`)
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">새 거래 추가</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'INCOME' })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      form.type === 'INCOME'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    수입
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'EXPENSE' })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      form.type === 'EXPENSE'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    지출
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">분류</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {Object.entries(categories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">금액 (원)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="거래 내용"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
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
