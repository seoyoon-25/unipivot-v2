'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown, Upload } from 'lucide-react'
import { RichTextEditor } from '@/components/editor'

interface Section {
  id: string
  order: number
  title: string
  content: string
  image: string | null
  imageAlt: string | null
  buttonText: string
  buttonLink: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CooperationSectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    content: '',
    image: '',
    imageAlt: '',
    buttonText: '요청하기',
    buttonLink: '',
    isActive: true,
  })

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/admin/cooperation-sections')
      if (res.ok) {
        const data = await res.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (section?: Section) => {
    if (section) {
      setEditingSection(section)
      setForm({
        title: section.title,
        content: section.content,
        image: section.image || '',
        imageAlt: section.imageAlt || '',
        buttonText: section.buttonText,
        buttonLink: section.buttonLink,
        isActive: section.isActive,
      })
    } else {
      setEditingSection(null)
      setForm({
        title: '',
        content: '',
        image: '',
        imageAlt: '',
        buttonText: '요청하기',
        buttonLink: '',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSection(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '업로드 실패')
      }

      const data = await res.json()
      setForm({ ...form, image: data.url })
    } catch (error: any) {
      alert(error.message || '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content || !form.buttonLink) {
      alert('필수 항목을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const url = editingSection
        ? `/api/admin/cooperation-sections/${editingSection.id}`
        : '/api/admin/cooperation-sections'
      const method = editingSection ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      await fetchSections()
      closeModal()
    } catch (error: any) {
      alert(error.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/cooperation-sections/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('삭제 실패')
      }

      await fetchSections()
    } catch (error) {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleToggleActive = async (section: Section) => {
    try {
      const res = await fetch(`/api/admin/cooperation-sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...section, isActive: !section.isActive }),
      })

      if (res.ok) {
        await fetchSections()
      }
    } catch (error) {
      alert('상태 변경에 실패했습니다.')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const otherSection = sections[newIndex]
    const currentSection = sections[index]

    try {
      await Promise.all([
        fetch(`/api/admin/cooperation-sections/${currentSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentSection, order: otherSection.order }),
        }),
        fetch(`/api/admin/cooperation-sections/${otherSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...otherSection, order: currentSection.order }),
        }),
      ])
      await fetchSections()
    } catch (error) {
      alert('순서 변경에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">협조요청 섹션 관리</h1>
          <p className="text-gray-500 mt-1">메인 협조요청 페이지에 표시되는 섹션을 관리합니다</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 섹션
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-500 mb-4">등록된 섹션이 없습니다</p>
          <button
            onClick={() => openModal()}
            className="text-primary hover:underline"
          >
            첫 번째 섹션 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`bg-white rounded-2xl p-6 shadow-sm ${
                !section.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleReorder(section.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(section.id, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {section.image && (
                  <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={section.image}
                      alt={section.imageAlt || section.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">#{section.order}</span>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    {!section.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                        비활성
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {section.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-400">
                    버튼: {section.buttonText} → {section.buttonLink}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(section)}
                    className={`p-2 rounded-lg transition-colors ${
                      section.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={section.isActive ? '비활성화' : '활성화'}
                  >
                    {section.isActive ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => openModal(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSection ? '섹션 수정' : '새 섹션 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: 자문요청"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <RichTextEditor
                  content={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                  placeholder="섹션 내용을 입력하세요..."
                  minHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지
                </label>
                <div className="space-y-2">
                  {form.image && (
                    <div className="relative w-48 aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                      <img src={form.image} alt="미리보기" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading ? '업로드 중...' : '이미지 업로드'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 설명 (Alt)
                </label>
                <input
                  type="text"
                  value={form.imageAlt}
                  onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                  placeholder="이미지에 대한 설명"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    버튼 텍스트
                  </label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="요청하기"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    버튼 링크 *
                  </label>
                  <input
                    type="text"
                    value={form.buttonLink}
                    onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                    placeholder="/cooperation/consulting/apply"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  활성화 (체크 해제 시 페이지에 표시되지 않습니다)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? '저장 중...' : editingSection ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
