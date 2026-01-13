'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, FileText, Download, File, FileSpreadsheet, FileImage } from 'lucide-react'
import DocumentFormModal from './DocumentFormModal'

interface Document {
  id: string
  title: string
  type: string | null
  filePath: string | null
  fileSize: number | null
  projectId: string | null
  project: { id: string; title: string } | null
  createdAt: Date
}

interface Project {
  id: string
  title: string
}

interface Props {
  documents: Document[]
  projects: Project[]
  total: number
  pages: number
  currentPage: number
  searchParams: { type?: string; projectId?: string; search?: string }
}

const typeLabels: Record<string, string> = {
  PROPOSAL: '제안서',
  REPORT: '보고서',
  CONTRACT: '계약서',
  MEETING: '회의록',
  OTHER: '기타',
}

const typeStyles: Record<string, string> = {
  PROPOSAL: 'bg-blue-100 text-blue-700',
  REPORT: 'bg-green-100 text-green-700',
  CONTRACT: 'bg-purple-100 text-purple-700',
  MEETING: 'bg-yellow-100 text-yellow-700',
  OTHER: 'bg-gray-100 text-gray-600',
}

function getFileIcon(filePath: string | null) {
  if (!filePath) return <FileText className="w-5 h-5 text-gray-400" />

  const ext = filePath.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FileImage className="w-5 h-5 text-purple-500" />
    default:
      return <File className="w-5 h-5 text-blue-500" />
  }
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsTable({ documents, projects, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [type, setType] = useState(searchParams.type || '')
  const [projectId, setProjectId] = useState(searchParams.projectId || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (projectId) params.set('projectId', projectId)
    router.push(`/admin/business/documents?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (projectId) params.set('projectId', projectId)
    params.set('page', page.toString())
    router.push(`/admin/business/documents?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingDocument(null)
    setIsModalOpen(true)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">문서 관리</h1>
            <p className="text-gray-500">총 {total}개의 문서</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 문서
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="문서명으로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 유형</option>
            <option value="PROPOSAL">제안서</option>
            <option value="REPORT">보고서</option>
            <option value="CONTRACT">계약서</option>
            <option value="MEETING">회의록</option>
            <option value="OTHER">기타</option>
          </select>
          {projects.length > 0 && (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-w-[200px]"
            >
              <option value="">전체 프로젝트</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title.length > 15 ? project.title.slice(0, 15) + '...' : project.title}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search || searchParams.type || searchParams.projectId
              ? '검색 결과가 없습니다.'
              : '등록된 문서가 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">문서</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">유형</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">프로젝트</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">크기</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">등록일</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.filePath)}
                      <span className="font-medium text-gray-900">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {doc.type ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeStyles[doc.type] || typeStyles.OTHER}`}>
                        {typeLabels[doc.type] || doc.type}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doc.project?.title || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {doc.filePath && (
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(doc)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 {total}건 중 {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pageNum = i + 1
                if (pages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i
                  if (pageNum > pages) pageNum = pages - 4 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pages}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <DocumentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDocument(null)
        }}
        document={editingDocument}
        projects={projects}
      />
    </div>
  )
}
