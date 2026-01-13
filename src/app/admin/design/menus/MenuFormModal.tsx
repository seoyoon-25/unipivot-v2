'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'

interface Menu {
  id: string
  parentId: string | null
  title: string
  url: string | null
  target: string | null
  position: number
  isActive: boolean
  location: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  menu: Menu | null
  parentId: string | null
  location: 'HEADER' | 'FOOTER'
  allMenus: Menu[]
}

export default function MenuFormModal({ isOpen, onClose, menu, parentId, location, allMenus }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    target: '_self',
    position: 0,
    isActive: true,
    parentId: null as string | null,
  })

  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title,
        url: menu.url || '',
        target: menu.target || '_self',
        position: menu.position,
        isActive: menu.isActive,
        parentId: menu.parentId,
      })
    } else {
      // Get max position for new menu
      const siblings = allMenus.filter(m => m.parentId === parentId)
      const maxPosition = siblings.length > 0 ? Math.max(...siblings.map(m => m.position)) + 1 : 0

      setFormData({
        title: '',
        url: '',
        target: '_self',
        position: maxPosition,
        isActive: true,
        parentId: parentId,
      })
    }
  }, [menu, parentId, allMenus, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      alert('제목은 필수입니다.')
      return
    }

    setIsSubmitting(true)
    try {
      const url = menu
        ? `/api/admin/menus/${menu.id}`
        : '/api/admin/menus'
      const method = menu ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          url: formData.url || null,
          location: menu ? menu.location : location,
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
      console.error('Error saving menu:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get parent menu options (exclude current menu and its children)
  const getParentOptions = () => {
    if (!menu) {
      return allMenus.filter(m => m.parentId === null)
    }

    // Collect all descendants of current menu
    const getDescendantIds = (id: string): string[] => {
      const children = allMenus.filter(m => m.parentId === id)
      return [id, ...children.flatMap(c => getDescendantIds(c.id))]
    }
    const excludeIds = new Set(getDescendantIds(menu.id))

    return allMenus.filter(m => !excludeIds.has(m.id) && m.parentId === null)
  }

  if (!isOpen) return null

  const parentOptions = getParentOptions()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {menu ? '메뉴 수정' : '새 메뉴'}
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
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="메뉴 제목"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="/path 또는 https://..."
            />
            <p className="mt-1 text-xs text-gray-500">
              비워두면 클릭 불가능한 메뉴가 됩니다
            </p>
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              링크 열기
            </label>
            <select
              value={formData.target}
              onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="_self">현재 창</option>
              <option value="_blank">새 창</option>
            </select>
          </div>

          {/* Parent Menu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상위 메뉴
            </label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value || null }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">최상위 메뉴</option>
              {parentOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬 순서
            </label>
            <input
              type="number"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              min="0"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              활성화
            </label>
          </div>

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
              {menu ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
