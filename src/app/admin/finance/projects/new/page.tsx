'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'

interface BudgetItem {
  id: string
  category: string
  subcategory: string
  item: string
  budget: number
}

export default function NewProjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    funder: '',
    contractNumber: '',
    totalBudget: 0,
    startDate: '',
    endDate: '',
    description: ''
  })
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: crypto.randomUUID(), category: '인건비', subcategory: '', item: '', budget: 0 }
  ])

  const categoryOptions = ['인건비', '사업비', '운영비', '간접비', '기타']

  const addBudgetItem = () => {
    setBudgetItems([
      ...budgetItems,
      { id: crypto.randomUUID(), category: '사업비', subcategory: '', item: '', budget: 0 }
    ])
  }

  const removeBudgetItem = (id: string) => {
    if (budgetItems.length > 1) {
      setBudgetItems(budgetItems.filter(item => item.id !== id))
    }
  }

  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setBudgetItems(budgetItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const calculateTotal = () => {
    return budgetItems.reduce((sum, item) => sum + item.budget, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.funder || !form.startDate || !form.endDate) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/finance/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          totalBudget: calculateTotal(),
          budgetItems: budgetItems.filter(item => item.item && item.budget > 0)
        })
      })

      if (!res.ok) throw new Error('Failed to create project')

      alert('프로젝트가 생성되었습니다.')
      router.push('/admin/finance/projects')
    } catch (error) {
      alert('프로젝트 생성 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/finance/projects"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">새 프로젝트</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">기본 정보</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">사업명 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 2025 청년 취업역량강화 사업"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지원기관 *</label>
              <input
                type="text"
                value={form.funder}
                onChange={(e) => setForm({ ...form, funder: e.target.value })}
                placeholder="예: 여성가족부"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">계약번호</label>
              <input
                type="text"
                value={form.contractNumber}
                onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                placeholder="예: 2025-001"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작일 *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료일 *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">사업 설명</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="사업에 대한 간단한 설명"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* 예산 항목 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">예산 항목</h2>
            <button
              type="button"
              onClick={addBudgetItem}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              항목 추가
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 w-8"></th>
                  <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">분류</th>
                  <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">세부분류</th>
                  <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">항목명</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-500">예산액</th>
                  <th className="px-2 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {budgetItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-2 py-2">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={item.category}
                        onChange={(e) => updateBudgetItem(item.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.subcategory}
                        onChange={(e) => updateBudgetItem(item.id, 'subcategory', e.target.value)}
                        placeholder="세부분류"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => updateBudgetItem(item.id, 'item', e.target.value)}
                        placeholder="예: 강사비"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.budget || ''}
                        onChange={(e) => updateBudgetItem(item.id, 'budget', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeBudgetItem(item.id)}
                        disabled={budgetItems.length === 1}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={4} className="px-2 py-3 text-right font-medium">총 예산</td>
                  <td className="px-2 py-3 text-right font-bold text-primary">
                    {calculateTotal().toLocaleString()}원
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/finance/projects"
            className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
