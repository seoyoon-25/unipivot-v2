'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Calendar, Wallet, TrendingUp, Building2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  funder: string
  contractNumber: string | null
  totalBudget: number
  startDate: string
  endDate: string
  status: string
  executed: number
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/finance/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchSearch = !search ||
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.funder.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || project.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0)
  const totalExecuted = projects.reduce((sum, p) => sum + p.executed, 0)
  const activeCount = projects.filter(p => p.status === 'ACTIVE').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
        <Link
          href="/admin/finance/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 프로젝트
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 프로젝트</p>
              <p className="text-xl font-bold">{projects.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">진행중</p>
              <p className="text-xl font-bold">{activeCount}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 예산</p>
              <p className="text-xl font-bold">{(totalBudget / 10000).toLocaleString()}만원</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">집행률</p>
              <p className="text-xl font-bold">
                {totalBudget > 0 ? Math.round((totalExecuted / totalBudget) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="프로젝트명, 지원기관 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="PLANNING">계획</option>
            <option value="ACTIVE">진행중</option>
            <option value="SETTLEMENT">정산중</option>
            <option value="CLOSED">종료</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
          <p className="text-gray-500">
            {search || statusFilter ? '검색 결과가 없습니다.' : '등록된 프로젝트가 없습니다.'}
          </p>
          <Link
            href="/admin/finance/projects/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트 등록
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const executionRate = project.totalBudget > 0
              ? Math.round((project.executed / project.totalBudget) * 100)
              : 0
            return (
              <Link
                key={project.id}
                href={`/admin/finance/projects/${project.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.funder}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">총 예산</span>
                    <span className="font-medium">{project.totalBudget.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">집행액</span>
                    <span className="font-medium">{project.executed.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">기간</span>
                    <span className="text-gray-600">
                      {new Date(project.startDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~{' '}
                      {new Date(project.endDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">집행률</span>
                    <span className={`font-medium ${executionRate > 80 ? 'text-green-600' : 'text-primary'}`}>
                      {executionRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${executionRate > 80 ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, executionRate)}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
