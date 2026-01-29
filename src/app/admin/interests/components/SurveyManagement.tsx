'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Edit,
  Star,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
  Users,
  TrendingUp,
} from 'lucide-react'

// 설문 인터페이스
interface Survey {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  startDate: string | null
  endDate: string | null
  isAnonymous: boolean
  isPinned: boolean
  responseCount: number
  options: Array<{
    id: string
    text: string
    responseCount: number
  }>
  createdAt: string
}

// 설문 관리 탭 컴포넌트
export function SurveyManagement() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchSurveys()
  }, [statusFilter])

  const fetchSurveys = async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/issue-surveys/admin${params}`)
      const data = await res.json()
      setSurveys(data.surveys || [])
    } catch (error) {
      console.error('Failed to fetch surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 설문을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/issue-surveys/admin?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchSurveys()
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const survey = surveys.find(s => s.id === id)
      if (!survey) return

      const res = await fetch('/api/issue-surveys/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: survey.title,
          description: survey.description,
          type: survey.type,
          status: newStatus,
          isAnonymous: survey.isAnonymous,
          isPinned: survey.isPinned,
          options: survey.options.map(o => ({ text: o.text }))
        })
      })

      if (res.ok) {
        fetchSurveys()
      }
    } catch (error) {
      console.error('Status change failed:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      ACTIVE: 'bg-green-100 text-green-700',
      CLOSED: 'bg-red-100 text-red-600'
    }
    const labels: Record<string, string> = {
      DRAFT: '초안',
      ACTIVE: '진행중',
      CLOSED: '종료'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
        {labels[status] || status}
      </span>
    )
  }

  // 통계 계산
  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === 'ACTIVE').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.responseCount, 0),
    avgResponses: surveys.length > 0
      ? Math.round(surveys.reduce((sum, s) => sum + s.responseCount, 0) / surveys.length)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="전체 설문" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle2} label="진행 중" value={stats.active} color="green" />
        <StatCard icon={Users} label="총 응답" value={stats.totalResponses} color="purple" />
        <StatCard icon={TrendingUp} label="평균 응답" value={stats.avgResponses} color="orange" />
      </div>

      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {[
            { key: 'all', label: '전체' },
            { key: 'DRAFT', label: '초안' },
            { key: 'ACTIVE', label: '진행중' },
            { key: 'CLOSED', label: '종료' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === item.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingSurvey(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          설문 추가
        </button>
      </div>

      {/* 설문 목록 */}
      {surveys.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>등록된 설문이 없습니다.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-primary hover:underline"
          >
            첫 설문 만들기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">제목</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">유형</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">상태</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">응답</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">생성일</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {surveys.map((survey) => (
                <tr key={survey.id}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {survey.title}
                        {survey.isPinned && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      {survey.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {survey.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {survey.type === 'SINGLE_CHOICE' && '단일선택'}
                    {survey.type === 'MULTIPLE_CHOICE' && '복수선택'}
                    {survey.type === 'TEXT' && '텍스트'}
                    {survey.type === 'SCALE' && '척도'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(survey.status)}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {survey.responseCount}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {new Date(survey.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {survey.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(survey.id, 'ACTIVE')}
                          className="p-2 text-gray-400 hover:text-green-500"
                          title="활성화"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {survey.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleStatusChange(survey.id, 'CLOSED')}
                          className="p-2 text-gray-400 hover:text-red-500"
                          title="종료"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingSurvey(survey)
                          setShowModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-primary"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 설문 추가/수정 모달 */}
      {showModal && (
        <SurveyModal
          survey={editingSurvey}
          onClose={() => {
            setShowModal(false)
            setEditingSurvey(null)
          }}
          onSave={() => {
            setShowModal(false)
            setEditingSurvey(null)
            fetchSurveys()
          }}
        />
      )}
    </div>
  )
}

// 통계 카드 컴포넌트
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
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

// 설문 모달 컴포넌트
function SurveyModal({
  survey,
  onClose,
  onSave
}: {
  survey: Survey | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    title: survey?.title || '',
    description: survey?.description || '',
    type: survey?.type || 'SINGLE_CHOICE',
    status: survey?.status || 'DRAFT',
    isAnonymous: survey?.isAnonymous ?? true,
    isPinned: survey?.isPinned ?? false,
    options: survey?.options.map(o => o.text) || ['', '']
  })
  const [saving, setSaving] = useState(false)

  const handleAddOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const handleRemoveOption = (index: number) => {
    if (form.options.length <= 2) return
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((o, i) => i === index ? value : o)
    }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('제목을 입력해주세요')
      return
    }

    if ((form.type === 'SINGLE_CHOICE' || form.type === 'MULTIPLE_CHOICE') &&
        form.options.filter(o => o.trim()).length < 2) {
      alert('최소 2개의 선택지가 필요합니다')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/issue-surveys/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: survey?.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          type: form.type,
          status: form.status,
          isAnonymous: form.isAnonymous,
          isPinned: form.isPinned,
          options: form.options
            .filter(o => o.trim())
            .map(text => ({ text: text.trim() }))
        })
      })

      if (res.ok) {
        onSave()
      } else {
        const data = await res.json()
        alert(data.error || '저장에 실패했습니다')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {survey ? '설문 수정' : '설문 추가'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="예: 가장 관심있는 프로그램 주제는?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={2}
              placeholder="설문에 대한 간단한 설명"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="SINGLE_CHOICE">단일 선택</option>
                <option value="MULTIPLE_CHOICE">복수 선택</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="DRAFT">초안</option>
                <option value="ACTIVE">진행중</option>
                <option value="CLOSED">종료</option>
              </select>
            </div>
          </div>

          {(form.type === 'SINGLE_CHOICE' || form.type === 'MULTIPLE_CHOICE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                선택지 (최소 2개)
              </label>
              <div className="space-y-2">
                {form.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                      placeholder={`선택지 ${index + 1}`}
                    />
                    {form.options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddOption}
                  className="w-full py-2 text-sm text-primary border border-dashed border-primary rounded-lg hover:bg-primary/5"
                >
                  + 선택지 추가
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              />
              <span className="text-sm">익명 설문</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              />
              <span className="text-sm">상단 고정</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            disabled={saving}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
