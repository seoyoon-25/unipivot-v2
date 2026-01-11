'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pin, Eye, Trash2, Edit, X, Save } from 'lucide-react'
import { createNotice, updateNotice, deleteNotice } from '@/lib/actions/admin'

interface Notice {
  id: string
  title: string
  content: string
  isPinned: boolean
  isPublic: boolean
  views: number
  createdAt: Date
}

interface Props {
  notices: Notice[]
  total: number
  pages: number
  currentPage: number
  searchParams: { search?: string }
}

export default function NoticesTable({ notices, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || '')
  const [showModal, setShowModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    isPinned: false,
    isPublic: true
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    router.push(`/admin/contents/notices?${params.toString()}`)
  }

  const openNewModal = () => {
    setEditingNotice(null)
    setForm({ title: '', content: '', isPinned: false, isPublic: true })
    setShowModal(true)
  }

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice)
    setForm({
      title: notice.title,
      content: notice.content,
      isPinned: notice.isPinned,
      isPublic: notice.isPublic
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, form)
      } else {
        await createNotice(form)
      }
      setShowModal(false)
      router.refresh()
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`정말 "${title}" 공지사항을 삭제하시겠습니까?`)) return
    try {
      await deleteNotice(id)
      router.refresh()
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const togglePin = async (notice: Notice) => {
    try {
      await updateNotice(notice.id, { isPinned: !notice.isPinned })
      router.refresh()
    } catch (error) {
      alert('변경 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 공지사항
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="제목으로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
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
        {notices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.search ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 w-16">고정</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">제목</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 w-24">공개</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 w-24">조회수</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 w-32">작성일</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePin(notice)}
                      className={`p-1 rounded ${notice.isPinned ? 'text-primary' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      <Pin className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{notice.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {notice.content.substring(0, 50)}...
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      notice.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {notice.isPublic ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {notice.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id, notice.title)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
            <p className="text-sm text-gray-500">총 {total}개</p>
            <div className="flex gap-2">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (search) params.set('search', search)
                    params.set('page', (i + 1).toString())
                    router.push(`/admin/contents/notices?${params.toString()}`)
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingNotice ? '공지사항 수정' : '새 공지사항'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="공지사항 제목"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용 *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={10}
                  placeholder="공지사항 내용"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">상단 고정</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">공개</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
