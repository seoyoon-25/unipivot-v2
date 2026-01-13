'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Image as ImageIcon,
  File,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Filter,
  X,
} from 'lucide-react'
import { DropzoneUpload } from '@/components/common'

interface MediaFile {
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  type: 'image' | 'file'
  createdAt: string
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'file'>('all')
  const [search, setSearch] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 파일 목록 로드
  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: filterType,
        page: String(page),
        limit: '50',
        search,
      })

      const response = await fetch(`/api/admin/media?${params}`)
      if (!response.ok) throw new Error('Failed to load media')

      const data = await response.json()
      setFiles(data.files)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Load media error:', error)
    } finally {
      setLoading(false)
    }
  }, [filterType, page, search])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // URL 복사
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // 파일 삭제
  const handleDelete = async (urls: string[]) => {
    if (!confirm(`${urls.length}개 파일을 삭제하시겠습니까?`)) return

    setDeleting(true)
    try {
      for (const url of urls) {
        await fetch('/api/admin/media', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
      }
      setSelectedFiles(new Set())
      loadFiles()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
    }
  }

  // 파일 선택 토글
  const toggleSelect = (url: string) => {
    const newSet = new Set(selectedFiles)
    if (newSet.has(url)) {
      newSet.delete(url)
    } else {
      newSet.add(url)
    }
    setSelectedFiles(newSet)
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map((f) => f.url)))
    }
  }

  // 파일 크기 포맷
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">미디어 라이브러리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {total}개 파일
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Upload className="w-4 h-4" />
          업로드
        </button>
      </div>

      {/* 업로드 모달 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">파일 업로드</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DropzoneUpload
              type="both"
              multiple
              maxFiles={20}
              onFilesChange={(uploaded) => {
                if (uploaded.length > 0) {
                  loadFiles()
                  setShowUpload(false)
                }
              }}
            />
          </div>
        </div>
      )}

      {/* 필터 & 검색 */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="파일명 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* 타입 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'all' | 'image' | 'file')
                setPage(1)
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">전체</option>
              <option value="image">이미지</option>
              <option value="file">문서</option>
            </select>
          </div>

          {/* 뷰 모드 */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 새로고침 */}
          <button
            onClick={loadFiles}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 선택된 파일 액션 */}
        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {selectedFiles.size}개 선택됨
            </span>
            <button
              onClick={() => handleDelete(Array.from(selectedFiles))}
              disabled={deleting}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>

      {/* 파일 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">파일이 없습니다</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div
              key={file.url}
              className={`group relative bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
                selectedFiles.has(file.url) ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* 선택 체크박스 */}
              <button
                onClick={() => toggleSelect(file.url)}
                className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedFiles.has(file.url)
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'
                }`}
              >
                {selectedFiles.has(file.url) && <Check className="w-4 h-4" />}
              </button>

              {/* 미리보기 */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {file.type === 'image' ? (
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = file.url
                    }}
                  />
                ) : (
                  <File className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* 파일 정보 */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatSize(file.size)}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopyUrl(file.url)}
                  className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"
                  title="URL 복사"
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <a
                  href={file.url}
                  download
                  className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"
                  title="다운로드"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </a>
                <button
                  onClick={() => handleDelete([file.url])}
                  className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === files.length && files.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">파일</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 w-24">크기</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 w-32">날짜</th>
                <th className="w-32 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {files.map((file) => (
                <tr key={file.url} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.url)}
                      onChange={() => toggleSelect(file.url)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {file.type === 'image' ? (
                          <img
                            src={file.thumbnailUrl || file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <File className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatSize(file.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(file.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopyUrl(file.url)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title="URL 복사"
                      >
                        {copiedUrl === file.url ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <a
                        href={file.url}
                        download
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title="다운로드"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                      <button
                        onClick={() => handleDelete([file.url])}
                        className="p-1.5 hover:bg-red-50 rounded-lg"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            이전
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
