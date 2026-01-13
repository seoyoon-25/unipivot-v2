'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'

interface Document {
  id: string
  title: string
  type: string | null
  filePath: string | null
  fileSize: number | null
  projectId: string | null
}

interface Project {
  id: string
  title: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  projects: Project[]
}

export default function DocumentFormModal({ isOpen, onClose, document, projects }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    filePath: '',
    fileSize: '',
    projectId: '',
  })

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        type: document.type || '',
        filePath: document.filePath || '',
        fileSize: document.fileSize?.toString() || '',
        projectId: document.projectId || '',
      })
    } else {
      setFormData({
        title: '',
        type: '',
        filePath: '',
        fileSize: '',
        projectId: '',
      })
    }
  }, [document, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      alert('문서명은 필수입니다.')
      return
    }

    setIsSubmitting(true)
    try {
      const url = document
        ? `/api/admin/documents/${document.id}`
        : '/api/admin/documents'
      const method = document ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: formData.type || null,
          filePath: formData.filePath || null,
          fileSize: formData.fileSize ? parseInt(formData.fileSize) : null,
          projectId: formData.projectId || null,
        }),
      })

      if (res.ok) {
        router.refresh()
        onClose()
      } else {
        const data = await res.json()
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {document ? '문서 수정' : '새 문서'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문서명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="문서명"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              유형
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">선택</option>
              <option value="PROPOSAL">제안서</option>
              <option value="REPORT">보고서</option>
              <option value="CONTRACT">계약서</option>
              <option value="MEETING">회의록</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          {/* File Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파일 URL
            </label>
            <input
              type="url"
              value={formData.filePath}
              onChange={(e) => setFormData(prev => ({ ...prev, filePath: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-gray-500">
              클라우드 저장소 URL 또는 파일 다운로드 링크
            </p>
          </div>

          {/* File Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파일 크기 (bytes)
            </label>
            <input
              type="number"
              value={formData.fileSize}
              onChange={(e) => setFormData(prev => ({ ...prev, fileSize: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Project */}
          {projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연결 프로젝트
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">선택 안함</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {document ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
