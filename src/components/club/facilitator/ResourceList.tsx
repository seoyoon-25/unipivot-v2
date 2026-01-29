'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  FileText,
  Download,
  Trash2,
  Link,
  StickyNote,
  File,
} from 'lucide-react'

interface Resource {
  id: string
  sessionId: string
  userId: string
  title: string
  description: string | null
  type: string // NOTE, FILE, LINK
  url: string | null
  filePath: string | null
  fileSize: number | null
  createdAt: string
  updatedAt: string
  user: {
    name: string | null
  }
}

interface ResourceListProps {
  resources: Resource[]
  isAdmin?: boolean
}

const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  NOTE: {
    label: '노트',
    icon: StickyNote,
    color: 'bg-yellow-50 text-yellow-700',
  },
  FILE: {
    label: '파일',
    icon: File,
    color: 'bg-blue-50 text-blue-700',
  },
  LINK: {
    label: '링크',
    icon: Link,
    color: 'bg-green-50 text-green-700',
  },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResourceList({ resources, isAdmin = false }: ResourceListProps) {
  const [items, setItems] = useState(resources)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('이 자료를 삭제하시겠습니까?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/club/facilitator/resources/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">등록된 자료가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((resource) => {
        const config = typeConfig[resource.type] || typeConfig.NOTE
        const TypeIcon = config.icon

        return (
          <div
            key={resource.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}
                  >
                    <TypeIcon className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />
                    {config.label}
                  </span>
                  {resource.fileSize && (
                    <span className="text-xs text-gray-400">
                      {formatFileSize(resource.fileSize)}
                    </span>
                  )}
                </div>

                <h3 className="font-medium text-gray-900 truncate">
                  {resource.title}
                </h3>

                {resource.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  {resource.user.name && <span>{resource.user.name}</span>}
                  <span>
                    {format(new Date(resource.createdAt), 'yyyy.MM.dd', {
                      locale: ko,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {resource.type === 'FILE' && resource.filePath && (
                  <a
                    href={resource.filePath}
                    download
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                {resource.type === 'LINK' && resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="링크 열기"
                  >
                    <Link className="w-4 h-4" />
                  </a>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(resource.id)}
                    disabled={deleting === resource.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
