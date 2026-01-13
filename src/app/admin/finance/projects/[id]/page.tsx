'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, FileText, Download, Plus } from 'lucide-react'

interface BudgetItem {
  id: string
  category: string
  subcategory: string | null
  item: string
  budget: number
  executed: number
}

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  financeAccount: { name: string }
}

interface Project {
  id: string
  name: string
  funder: string
  contractNumber: string | null
  totalBudget: number
  startDate: string
  endDate: string
  status: string
  description: string | null
  budgetItems: BudgetItem[]
  transactions: Transaction[]
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PLANNING: '계획',
    ACTIVE: '진행중',
    SETTLEMENT: '정산중',
    CLOSED: '종료'
  }
  return labels[status] || status
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-600'
    case 'SETTLEMENT': return 'bg-yellow-100 text-yellow-600'
    case 'CLOSED': return 'bg-gray-100 text-gray-600'
    default: return 'bg-blue-100 text-blue-600'
  }
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'budget' | 'execution' | 'documents'>('budget')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/finance/projects/${id}`)
      if (!res.ok) throw new Error('Project not found')
      const data = await res.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/finance/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.push('/admin/finance/projects')
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/finance/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update')
      fetchProject()
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">프로젝트를 찾을 수 없습니다.</p>
        <Link href="/admin/finance/projects" className="text-primary hover:underline mt-4 inline-block">
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const totalExecuted = project.budgetItems.reduce((sum, item) => sum + item.executed, 0)
  const executionRate = project.totalBudget > 0 ? Math.round((totalExecuted / project.totalBudget) * 100) : 0

  // Group budget items by category
  const groupedBudgetItems = project.budgetItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, BudgetItem[]>)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/finance/projects"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <p className="text-gray-500 mt-1">{project.funder}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="PLANNING">계획</option>
            <option value="ACTIVE">진행중</option>
            <option value="SETTLEMENT">정산중</option>
            <option value="CLOSED">종료</option>
          </select>
          <Link
            href={`/admin/finance/projects/${id}/edit`}
            className="p-2 text-gray-400 hover:text-primary transition-colors"
          >
            <Edit className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">총 예산</p>
          <p className="text-xl font-bold">{project.totalBudget.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">집행액</p>
          <p className="text-xl font-bold text-primary">{totalExecuted.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">잔액</p>
          <p className="text-xl font-bold">{(project.totalBudget - totalExecuted).toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">집행률</p>
          <p className="text-xl font-bold">{executionRate}%</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${executionRate > 80 ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, executionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500">계약번호</p>
            <p className="font-medium">{project.contractNumber || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">사업기간</p>
            <p className="font-medium">
              {new Date(project.startDate).toLocaleDateString('ko-KR')} ~{' '}
              {new Date(project.endDate).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">사업설명</p>
            <p className="font-medium">{project.description || '-'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {(['budget', 'execution', 'documents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'budget' && '예산'}
                {tab === 'execution' && '집행내역'}
                {tab === 'documents' && '서류함'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">예산 항목</h3>
                <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                  <Download className="w-4 h-4" />
                  엑셀 다운로드
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">분류</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">세부분류</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">항목</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">예산</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">집행</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">잔액</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">집행률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(groupedBudgetItems).map(([category, items]) => (
                      <>
                        {items.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            {idx === 0 && (
                              <td rowSpan={items.length} className="px-4 py-3 font-medium bg-gray-50">
                                {category}
                              </td>
                            )}
                            <td className="px-4 py-3">{item.subcategory || '-'}</td>
                            <td className="px-4 py-3">{item.item}</td>
                            <td className="px-4 py-3 text-right">{item.budget.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-primary">{item.executed.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{(item.budget - item.executed).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                              {item.budget > 0 ? Math.round((item.executed / item.budget) * 100) : 0}%
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 font-bold">
                      <td colSpan={3} className="px-4 py-3">합계</td>
                      <td className="px-4 py-3 text-right">{project.totalBudget.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-primary">{totalExecuted.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{(project.totalBudget - totalExecuted).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{executionRate}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Execution Tab */}
          {activeTab === 'execution' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">집행 내역</h3>
                <Link
                  href={`/admin/finance/transactions/new?projectId=${id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4" />
                  지출 등록
                </Link>
              </div>
              {project.transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  등록된 집행 내역이 없습니다.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">일자</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">적요</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">계정</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {project.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString('ko-KR')}</td>
                        <td className="px-4 py-3">{tx.description}</td>
                        <td className="px-4 py-3">{tx.financeAccount.name}</td>
                        <td className="px-4 py-3 text-right">{tx.amount.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">서류함</h3>
                <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary-dark">
                  <Plus className="w-4 h-4" />
                  파일 업로드
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>등록된 문서가 없습니다.</p>
                <p className="text-sm mt-1">계약서, 보고서, 정산서 등을 업로드하세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
