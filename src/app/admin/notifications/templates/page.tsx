'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Copy, Save, X } from 'lucide-react'

interface Template {
  id: string
  type: string
  name: string
  subject: string
  content: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const templateTypeLabels: Record<string, string> = {
  ACCEPT: '합격 안내',
  ADDITIONAL: '추가 합격',
  REJECT: '불합격 안내',
  DEPOSIT: '보증금 안내',
  BOOK_SURVEY: '책 수령 조사',
  REMINDER: '마감 임박',
  NEW_PROGRAM: '새 프로그램',
}

const templateVariables = [
  { key: '{이름}', desc: '수신자 이름' },
  { key: '{프로그램명}', desc: '프로그램 제목' },
  { key: '{시작일}', desc: '프로그램 시작일' },
  { key: '{종료일}', desc: '프로그램 종료일' },
  { key: '{장소}', desc: '진행 장소' },
  { key: '{금액}', desc: '보증금/참가비' },
  { key: '{입금기한}', desc: '입금 마감일' },
  { key: '{비용안내}', desc: '비용 관련 안내' },
  { key: '{계좌정보}', desc: '입금 계좌 정보' },
  { key: '{조사링크}', desc: '설문 링크' },
  { key: '{마감일}', desc: '응답/신청 마감일' },
  { key: '{신청링크}', desc: '신청 페이지 링크' },
  { key: '{신청자수}', desc: '현재 신청자 수' },
  { key: '{일수}', desc: '남은 일수 (D-N)' },
]

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    content: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/admin/notification-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
        if (data.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
    setLoading(false)
  }

  function startEdit(template: Template) {
    setEditForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
    })
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setEditForm({ name: '', subject: '', content: '' })
  }

  async function saveTemplate() {
    if (!selectedTemplate) return
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/notification-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (res.ok) {
        const updated = await res.json()
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        )
        setSelectedTemplate(updated)
        setIsEditing(false)
      } else {
        const data = await res.json()
        alert(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    }
    setSaving(false)
  }

  async function deleteTemplate(id: string) {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/notification-templates/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(templates.find((t) => t.id !== id) || null)
        }
      } else {
        const data = await res.json()
        alert(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  function insertVariable(variable: string) {
    setEditForm((prev) => ({
      ...prev,
      content: prev.content + variable,
    }))
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  // Group templates by type
  const groupedTemplates = templates.reduce((acc, template) => {
    const type = template.type
    if (!acc[type]) acc[type] = []
    acc[type].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/notifications"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">알림 템플릿 관리</h1>
            <p className="text-gray-500">프로그램 알림 메시지 템플릿을 관리합니다</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">템플릿 목록</h2>
          </div>
          <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
            {Object.entries(groupedTemplates).map(([type, items]) => (
              <div key={type}>
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">
                  {templateTypeLabels[type] || type}
                </div>
                {items.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsEditing(false)
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                      selectedTemplate?.id === template.id
                        ? 'bg-primary/10'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {template.name}
                      </div>
                      {template.isDefault && (
                        <span className="text-xs text-primary">기본</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedTemplate ? (
            <>
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {isEditing ? '템플릿 수정' : '템플릿 상세'}
                </h2>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        취소
                      </button>
                      <button
                        onClick={saveTemplate}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        저장
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(selectedTemplate)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                        수정
                      </button>
                      {!selectedTemplate.isDefault && (
                        <button
                          onClick={() => deleteTemplate(selectedTemplate.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-6">
                {isEditing ? (
                  <>
                    {/* Edit Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        템플릿 이름
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        제목
                      </label>
                      <input
                        type="text"
                        value={editForm.subject}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        내용
                      </label>
                      <textarea
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        rows={12}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                      />
                    </div>
                    {/* Variables */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사용 가능한 변수
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {templateVariables.map((v) => (
                          <button
                            key={v.key}
                            onClick={() => insertVariable(v.key)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                            title={v.desc}
                          >
                            {v.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* View Mode */}
                    <div>
                      <div className="text-sm text-gray-500 mb-1">유형</div>
                      <div className="font-medium">
                        {templateTypeLabels[selectedTemplate.type] ||
                          selectedTemplate.type}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">템플릿 이름</div>
                      <div className="font-medium">{selectedTemplate.name}</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-gray-500">제목</div>
                        <button
                          onClick={() => copyToClipboard(selectedTemplate.subject)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-medium">{selectedTemplate.subject}</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-gray-500">내용</div>
                        <button
                          onClick={() => copyToClipboard(selectedTemplate.content)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg font-sans">
                        {selectedTemplate.content}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              템플릿을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
