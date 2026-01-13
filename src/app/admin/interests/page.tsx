'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Hash,
  Bell,
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Star,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
} from 'lucide-react'

interface Stats {
  totalKeywords: number
  totalInterests: number
  totalAlerts: number
  monthlyInterests: number
  pendingAlerts: number
}

interface Keyword {
  id: string
  keyword: string
  category: string | null
  totalCount: number
  monthlyCount: number
  likeCount: number
  isFixed: boolean
  isRecommended: boolean
  isHidden: boolean
  _count?: {
    interests: number
    alerts: number
  }
}

interface Interest {
  id: string
  content: string | null
  visibility: string
  createdAt: string
  keyword: { keyword: string }
  user: { name: string; email: string } | null
}

export default function InterestAdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'keywords' | 'alerts'>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [topKeywords, setTopKeywords] = useState<Keyword[]>([])
  const [recentInterests, setRecentInterests] = useState<Interest[]>([])
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard()
    } else if (activeTab === 'keywords') {
      fetchKeywords()
    }
  }, [activeTab])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/interests?type=dashboard')
      const data = await res.json()
      setStats(data.stats)
      setTopKeywords(data.topKeywords)
      setRecentInterests(data.recentInterests)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKeywords = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/interests?type=keywords')
      const data = await res.json()
      setAllKeywords(data.keywords)
    } catch (error) {
      console.error('Failed to fetch keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordAction = async (action: string, keywordId?: string, data?: any) => {
    try {
      const res = await fetch('/api/admin/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, keywordId, data }),
      })

      if (res.ok) {
        if (activeTab === 'keywords') {
          fetchKeywords()
        } else {
          fetchDashboard()
        }
        setShowAddModal(false)
        setEditingKeyword(null)
      }
    } catch (error) {
      console.error('Keyword action failed:', error)
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    if (!confirm('이 키워드를 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.')) return

    try {
      const res = await fetch(`/api/admin/interests?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchKeywords()
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const tabs = [
    { key: 'dashboard', label: '대시보드', icon: BarChart3 },
    { key: 'keywords', label: '키워드 관리', icon: Hash },
    { key: 'alerts', label: '알림 관리', icon: Bell },
  ] as const

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관심사 시스템 관리</h1>
        <p className="text-gray-500">사용자 관심사 데이터를 분석하고 관리합니다</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 대시보드 */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* 통계 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard
                  icon={Hash}
                  label="전체 키워드"
                  value={stats.totalKeywords}
                  color="blue"
                />
                <StatCard
                  icon={MessageSquare}
                  label="전체 관심사"
                  value={stats.totalInterests}
                  color="green"
                />
                <StatCard
                  icon={TrendingUp}
                  label="이번달"
                  value={stats.monthlyInterests}
                  color="yellow"
                />
                <StatCard
                  icon={Bell}
                  label="알림 신청"
                  value={stats.totalAlerts}
                  color="purple"
                />
                <StatCard
                  icon={Users}
                  label="대기 알림"
                  value={stats.pendingAlerts}
                  color="red"
                />
              </div>

              {/* TOP 키워드 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">이번달 TOP 10 키워드</h3>
                <div className="grid gap-2">
                  {topKeywords.map((kw, index) => (
                    <div
                      key={kw.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        index < 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{kw.keyword}</span>
                          {kw.isFixed && <Sparkles className="w-3 h-3 text-yellow-500" />}
                          {kw.isRecommended && <Star className="w-3 h-3 text-blue-500" />}
                        </div>
                        <span className="text-xs text-gray-500">{kw.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{kw.monthlyCount}</div>
                        <div className="text-xs text-gray-400">전체 {kw.totalCount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 관심사 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">최근 등록된 관심사</h3>
                <div className="space-y-2">
                  {recentInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        #{interest.keyword.keyword}
                      </span>
                      <span className="flex-1 text-gray-600 truncate">
                        {interest.content || '(추가 내용 없음)'}
                      </span>
                      <span className="text-gray-400">
                        {interest.user?.name || '익명'}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(interest.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 키워드 관리 */}
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  키워드 추가
                </button>
                <button
                  onClick={() => handleKeywordAction('resetMonthly')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  월간 통계 초기화
                </button>
              </div>

              {/* 키워드 목록 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">키워드</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">카테고리</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">월간</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">전체</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">알림</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">상태</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allKeywords.map((kw) => (
                      <tr key={kw.id} className={kw.isHidden ? 'bg-gray-50 opacity-50' : ''}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{kw.keyword}</span>
                            {kw.isFixed && <Sparkles className="w-4 h-4 text-yellow-500" />}
                            {kw.isRecommended && <Star className="w-4 h-4 text-blue-500" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{kw.category || '-'}</td>
                        <td className="px-4 py-3 text-center">{kw.monthlyCount}</td>
                        <td className="px-4 py-3 text-center">{kw.totalCount}</td>
                        <td className="px-4 py-3 text-center">{kw._count?.alerts || 0}</td>
                        <td className="px-4 py-3 text-center">
                          {kw.isHidden ? (
                            <span className="text-xs text-gray-400">숨김</span>
                          ) : (
                            <span className="text-xs text-green-600">공개</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingKeyword(kw)}
                              className="p-2 text-gray-400 hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleKeywordAction('hide', kw.id)}
                              className="p-2 text-gray-400 hover:text-yellow-500"
                            >
                              {kw.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            {!kw.isFixed && (
                              <button
                                onClick={() => handleDeleteKeyword(kw.id)}
                                className="p-2 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 알림 관리 */}
          {activeTab === 'alerts' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500">알림 관리 기능은 곧 추가됩니다.</p>
            </div>
          )}
        </>
      )}

      {/* 키워드 추가/수정 모달 */}
      {(showAddModal || editingKeyword) && (
        <KeywordModal
          keyword={editingKeyword}
          onClose={() => {
            setShowAddModal(false)
            setEditingKeyword(null)
          }}
          onSave={(data) => {
            if (editingKeyword) {
              handleKeywordAction('update', editingKeyword.id, data)
            } else {
              handleKeywordAction('create', undefined, data)
            }
          }}
        />
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: number
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function KeywordModal({
  keyword,
  onClose,
  onSave,
}: {
  keyword: Keyword | null
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [form, setForm] = useState({
    keyword: keyword?.keyword || '',
    category: keyword?.category || '',
    isFixed: keyword?.isFixed || false,
    isRecommended: keyword?.isRecommended || false,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {keyword ? '키워드 수정' : '키워드 추가'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">키워드</label>
            <input
              type="text"
              value={form.keyword}
              onChange={(e) => setForm({ ...form, keyword: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              disabled={!!keyword?.isFixed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFixed}
                onChange={(e) => setForm({ ...form, isFixed: e.target.checked })}
                disabled={keyword?.isFixed}
              />
              <span className="text-sm">고정 키워드</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isRecommended}
                onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })}
              />
              <span className="text-sm">추천 키워드</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
