'use client'

import { useEffect, useState } from 'react'
import { PiggyBank, Plus, TrendingUp, TrendingDown } from 'lucide-react'

interface Fund {
  id: string
  name: string
  type: string
  description: string | null
  balance: number
  isActive: boolean
  createdAt: string
  financeProject: { name: string } | null
  _count: { transactions: number }
}

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'GENERAL',
    description: ''
  })

  useEffect(() => {
    fetchFunds()
  }, [])

  const fetchFunds = async () => {
    try {
      const res = await fetch('/api/finance/funds')
      if (res.ok) {
        const data = await res.json()
        setFunds(data)
      }
    } catch (error) {
      console.error('Error fetching funds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/finance/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ name: '', type: 'GENERAL', description: '' })
        fetchFunds()
      }
    } catch (error) {
      console.error('Error creating fund:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const totalBalance = funds.reduce((sum, fund) => sum + fund.balance, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">기금 관리</h1>
          <p className="text-gray-600">총 {funds.length}개 기금</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          기금 추가
        </button>
      </div>

      {/* 총 잔액 카드 */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white">
        <p className="text-sm opacity-80">총 기금 잔액</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}원</p>
      </div>

      {/* 기금 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funds.map((fund) => (
          <div
            key={fund.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  fund.type === 'GENERAL' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  <PiggyBank className={`w-5 h-5 ${
                    fund.type === 'GENERAL' ? 'text-blue-600' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{fund.name}</h3>
                  <p className="text-xs text-gray-500">
                    {fund.type === 'GENERAL' ? '일반기금' : '사업기금'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                fund.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {fund.isActive ? '활성' : '비활성'}
              </span>
            </div>

            <div className="mt-4">
              <p className={`text-2xl font-bold ${
                fund.balance >= 0 ? 'text-gray-900' : 'text-red-600'
              }`}>
                {formatCurrency(fund.balance)}원
              </p>
              {fund.description && (
                <p className="text-sm text-gray-500 mt-1">{fund.description}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                거래 {fund._count.transactions}건
              </span>
              {fund.financeProject && (
                <span className="text-primary text-xs">
                  {fund.financeProject.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {funds.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">등록된 기금이 없습니다</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-primary hover:underline"
          >
            첫 기금 추가하기
          </button>
        </div>
      )}

      {/* 기금 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">새 기금 추가</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기금명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="예: 청년교류사업 기금"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기금 유형 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="GENERAL">일반기금</option>
                  <option value="PROJECT">사업기금</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="기금에 대한 설명을 입력하세요"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
