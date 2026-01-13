'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, ExternalLink, Menu as MenuIcon, GripVertical, CheckCircle, XCircle } from 'lucide-react'
import MenuFormModal from './MenuFormModal'

interface MenuItem {
  id: string
  parentId: string | null
  title: string
  url: string | null
  target: string | null
  position: number
  isActive: boolean
  location: string | null
  children: MenuItem[]
}

interface Props {
  headerMenus: MenuItem[]
  footerMenus: MenuItem[]
  allMenus: any[]
}

export default function MenuManager({ headerMenus, footerMenus, allMenus }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'HEADER' | 'FOOTER'>('HEADER')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<any | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const menus = activeTab === 'HEADER' ? headerMenus : footerMenus

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const handleCreate = (parentId: string | null = null) => {
    setEditingMenu(null)
    setParentId(parentId)
    setIsModalOpen(true)
  }

  const handleEdit = (menu: any) => {
    setEditingMenu(menu)
    setParentId(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까? 하위 메뉴도 함께 삭제됩니다.')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/menus/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting menu:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling menu status:', error)
    }
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${
            depth > 0 ? 'bg-gray-50/50' : ''
          }`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />

          {hasChildren ? (
            <button
              onClick={() => toggleExpand(item.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex-1 flex items-center gap-3">
            <span className={`font-medium ${item.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
              {item.title}
            </span>
            {item.url && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                {item.url}
                {item.target === '_blank' && <ExternalLink className="w-3 h-3" />}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleActive(item.id, item.isActive)}
              className={`p-1.5 rounded transition-colors ${
                item.isActive
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={item.isActive ? '활성' : '비활성'}
            >
              {item.isActive ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => handleCreate(item.id)}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
              title="하위 메뉴 추가"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(item)}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
              title="수정"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {item.children.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <MenuIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
            <p className="text-gray-500">사이트 네비게이션 메뉴 관리</p>
          </div>
        </div>
        <button
          onClick={() => handleCreate(null)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 메뉴
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('HEADER')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'HEADER'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              헤더 메뉴
            </button>
            <button
              onClick={() => setActiveTab('FOOTER')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'FOOTER'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              푸터 메뉴
            </button>
          </div>
        </div>

        {/* Menu List */}
        <div className="min-h-[300px]">
          {menus.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MenuIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>등록된 메뉴가 없습니다.</p>
              <button
                onClick={() => handleCreate(null)}
                className="mt-4 text-primary hover:underline"
              >
                메뉴 추가하기
              </button>
            </div>
          ) : (
            <div>
              {menus.map((item) => renderMenuItem(item))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMenu(null)
          setParentId(null)
        }}
        menu={editingMenu}
        parentId={parentId}
        location={activeTab}
        allMenus={allMenus.filter(m => m.location === activeTab)}
      />
    </div>
  )
}
