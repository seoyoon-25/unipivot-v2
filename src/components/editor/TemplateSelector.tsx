'use client'

import { useState, useEffect } from 'react'
import { FileText, Star, Search, X, Check, Plus } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string | null
  category: string
  content: string
  thumbnail: string | null
  isDefault: boolean
  useCount: number
}

interface TemplateSelectorProps {
  category: string
  onSelect: (content: string) => void
  onSaveAsTemplate?: (name: string, content: string) => Promise<void>
  currentContent?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  PROGRAM: '프로그램',
  BLOG: '블로그',
  NOTICE: '공지사항',
  EMAIL: '이메일',
  COOPERATION: '협조요청',
}

export function TemplateSelector({
  category,
  onSelect,
  onSaveAsTemplate,
  currentContent,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [saving, setSaving] = useState(false)

  // 템플릿 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, category])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ category })
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/templates?${params}`)
      if (!response.ok) throw new Error('Failed to load templates')

      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Load templates error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (template: Template) => {
    // 사용 횟수 증가
    await fetch(`/api/admin/templates/${template.id}?use=true`)
    onSelect(template.content)
    setIsOpen(false)
  }

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim() || !currentContent || !onSaveAsTemplate) return

    setSaving(true)
    try {
      await onSaveAsTemplate(templateName, currentContent)
      setShowSaveModal(false)
      setTemplateName('')
      loadTemplates()
    } catch (error) {
      console.error('Save template error:', error)
    } finally {
      setSaving(false)
    }
  }

  const filteredTemplates = templates.filter((t) =>
    search
      ? t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      : true
  )

  return (
    <div className="relative">
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FileText className="w-4 h-4" />
        템플릿
      </button>

      {/* 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            {/* 헤더 */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">템플릿 선택</h2>
                <p className="text-sm text-gray-500">
                  {CATEGORY_LABELS[category] || category} 템플릿
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 검색 & 새 템플릿 */}
            <div className="p-4 border-b flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="템플릿 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {onSaveAsTemplate && currentContent && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  현재 내용 저장
                </button>
              )}
            </div>

            {/* 템플릿 목록 */}
            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">템플릿이 없습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="text-left p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 group-hover:text-primary">
                            {template.name}
                          </span>
                          {template.isDefault && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                              <Star className="w-3 h-3" />
                              기본
                            </span>
                          )}
                        </div>
                        <Check className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {template.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-400">
                        {template.useCount}회 사용됨
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">템플릿으로 저장</h3>
            <input
              type="text"
              placeholder="템플릿 이름"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setTemplateName('')
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={!templateName.trim() || saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
