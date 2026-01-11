'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  GripVertical,
} from 'lucide-react'

interface Page {
  id: string
  parentId: string | null
  slug: string
  title: string
  isFolder: boolean
  order: number
  isPublished: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  children?: Page[]
}

interface Props {
  pages: Page[]
}

interface SortableItemProps {
  page: Page
  depth: number
  expanded: Set<string>
  toggleExpand: (id: string) => void
  onDelete: (id: string) => void
  onTogglePublish: (page: Page) => void
}

function SortableItem({ page, depth, expanded, toggleExpand, onDelete, onTogglePublish }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasChildren = page.children && page.children.length > 0
  const isExpanded = expanded.has(page.id)

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-2 py-3 px-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          isDragging ? 'shadow-lg rounded-lg' : ''
        }`}
        style={{ paddingLeft: `${depth * 24 + 16}px` }}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand/Collapse */}
        {hasChildren || page.isFolder ? (
          <button
            onClick={() => toggleExpand(page.id)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}

        {/* Icon */}
        {page.isFolder ? (
          isExpanded ? (
            <FolderOpen className="w-5 h-5 text-yellow-500" />
          ) : (
            <Folder className="w-5 h-5 text-yellow-500" />
          )
        ) : (
          <File className="w-5 h-5 text-gray-400" />
        )}

        {/* Title */}
        <Link
          href={page.isFolder ? '#' : `/admin/design/pages/${page.id}`}
          className={`flex-1 font-medium ${
            page.isFolder ? 'text-gray-700' : 'text-gray-900 hover:text-primary'
          }`}
          onClick={(e) => {
            if (page.isFolder) {
              e.preventDefault()
              toggleExpand(page.id)
            }
          }}
        >
          {page.title}
        </Link>

        {/* URL */}
        {!page.isFolder && (
          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded hidden sm:block">
            /p/{page.slug}
          </code>
        )}

        {/* Status */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
            page.isPublished
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {page.isPublished ? (
            <>
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">게시됨</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              <span className="hidden sm:inline">비공개</span>
            </>
          )}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!page.isFolder && (
            <Link
              href={`/admin/design/pages/${page.id}`}
              className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
              title="편집"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          )}
          {page.isPublished && !page.isFolder && (
            <a
              href={`/p/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="미리보기"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onTogglePublish(page)}
            className={`p-2 rounded-lg transition-colors ${
              page.isPublished
                ? 'text-green-500 hover:text-gray-400 hover:bg-gray-100'
                : 'text-gray-400 hover:text-green-500 hover:bg-gray-100'
            }`}
            title={page.isPublished ? '비공개로 전환' : '게시하기'}
          >
            {page.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(page.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {page.children!.map((child) => (
            <SortableItem
              key={child.id}
              page={child}
              depth={depth + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onDelete={onDelete}
              onTogglePublish={onTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PageTree({ pages: initialPages }: Props) {
  const router = useRouter()
  const [pages, setPages] = useState(initialPages)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showNewPageModal, setShowNewPageModal] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageSlug, setNewPageSlug] = useState('')
  const [newPageParentId, setNewPageParentId] = useState<string | null>(null)
  const [newPageIsFolder, setNewPageIsFolder] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpanded(newExpanded)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Find items in the flat list
      const flatPages = flattenPages(pages)
      const oldIndex = flatPages.findIndex((p) => p.id === active.id)
      const newIndex = flatPages.findIndex((p) => p.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFlatPages = arrayMove(flatPages, oldIndex, newIndex)

        // Update order values
        const updates = newFlatPages.map((page, index) => ({
          id: page.id,
          parentId: page.parentId,
          order: index,
        }))

        // Save to server
        try {
          await fetch('/api/pages/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: updates }),
          })
          router.refresh()
        } catch (error) {
          console.error('Failed to reorder:', error)
        }
      }
    }
  }

  const flattenPages = (pages: Page[]): Page[] => {
    const result: Page[] = []
    const traverse = (items: Page[]) => {
      for (const item of items) {
        result.push(item)
        if (item.children && expanded.has(item.id)) {
          traverse(item.children)
        }
      }
    }
    traverse(pages)
    return result
  }

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPageTitle || !newPageSlug) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPageTitle,
          slug: newPageSlug,
          parentId: newPageParentId,
          isFolder: newPageIsFolder,
        }),
      })

      if (res.ok) {
        const page = await res.json()
        setShowNewPageModal(false)
        setNewPageTitle('')
        setNewPageSlug('')
        setNewPageParentId(null)
        setNewPageIsFolder(false)
        if (!newPageIsFolder) {
          router.push(`/admin/design/pages/${page.id}`)
        } else {
          router.refresh()
        }
      } else {
        const data = await res.json()
        alert(data.error || '페이지 생성에 실패했습니다.')
      }
    } catch (error) {
      alert('페이지 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 하위 페이지도 모두 삭제됩니다.')) return

    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleTogglePublish = async (page: Page) => {
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      alert('상태 변경에 실패했습니다.')
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Get all folders for parent selection
  const getAllFolders = (pages: Page[]): Page[] => {
    const folders: Page[] = []
    const traverse = (items: Page[]) => {
      for (const item of items) {
        if (item.isFolder) {
          folders.push(item)
        }
        if (item.children) {
          traverse(item.children)
        }
      }
    }
    traverse(pages)
    return folders
  }

  const allFolders = getAllFolders(pages)
  const flatPages = flattenPages(pages)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">페이지 관리</h1>
          <p className="text-gray-600 mt-1">페이지와 폴더를 드래그하여 순서를 변경하세요</p>
        </div>
        <button
          onClick={() => setShowNewPageModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 페이지
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">아직 생성된 페이지가 없습니다.</p>
            <button
              onClick={() => setShowNewPageModal(true)}
              className="text-primary hover:underline"
            >
              첫 페이지 만들기
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={flatPages.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {pages.map((page) => (
                <SortableItem
                  key={page.id}
                  page={page}
                  depth={0}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">새 페이지 만들기</h2>
            <form onSubmit={handleCreatePage}>
              <div className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={!newPageIsFolder}
                        onChange={() => setNewPageIsFolder(false)}
                        className="w-4 h-4 text-primary"
                      />
                      <File className="w-4 h-4 text-gray-400" />
                      <span>페이지</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={newPageIsFolder}
                        onChange={() => setNewPageIsFolder(true)}
                        className="w-4 h-4 text-primary"
                      />
                      <Folder className="w-4 h-4 text-yellow-500" />
                      <span>폴더</span>
                    </label>
                  </div>
                </div>

                {/* Parent Folder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상위 폴더
                  </label>
                  <select
                    value={newPageParentId || ''}
                    onChange={(e) => setNewPageParentId(e.target.value || null)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">최상위</option>
                    {allFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newPageIsFolder ? '폴더명' : '페이지 제목'}
                  </label>
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => {
                      setNewPageTitle(e.target.value)
                      if (!newPageSlug || newPageSlug === generateSlug(newPageTitle)) {
                        setNewPageSlug(generateSlug(e.target.value))
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder={newPageIsFolder ? '예: 프로그램' : '예: 서비스 소개'}
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL 슬러그
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">/p/</span>
                    <input
                      type="text"
                      value={newPageSlug}
                      onChange={(e) =>
                        setNewPageSlug(
                          e.target.value.replace(/[^a-z0-9가-힣-]/gi, '-').toLowerCase()
                        )
                      }
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="service-intro"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPageModal(false)
                    setNewPageTitle('')
                    setNewPageSlug('')
                    setNewPageParentId(null)
                    setNewPageIsFolder(false)
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isCreating ? '생성 중...' : '생성하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
