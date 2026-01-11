'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface Page {
  id: string
  slug: string
  title: string
  isPublished: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Props {
  pages: Page[]
}

export default function PagesTable({ pages }: Props) {
  const router = useRouter()
  const [showNewPageModal, setShowNewPageModal] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageSlug, setNewPageSlug] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPageTitle || !newPageSlug) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPageTitle, slug: newPageSlug }),
      })

      if (res.ok) {
        const page = await res.json()
        setShowNewPageModal(false)
        setNewPageTitle('')
        setNewPageSlug('')
        router.push(`/admin/design/pages/${page.id}`)
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
    if (!confirm('정말 삭제하시겠습니까?')) return

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">페이지 관리</h1>
          <p className="text-gray-600 mt-1">비주얼 에디터로 페이지를 만들고 관리하세요</p>
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
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">제목</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">URL</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">수정일</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/design/pages/${page.id}`}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      /p/{page.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
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
                          게시됨
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          비공개
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(page.updatedAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/design/pages/${page.id}`}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="편집"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {page.isPublished && (
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
                        onClick={() => handleTogglePublish(page)}
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
                        onClick={() => handleDelete(page.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
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
      </div>

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">새 페이지 만들기</h2>
            <form onSubmit={handleCreatePage}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    페이지 제목
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
                    placeholder="예: 서비스 소개"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL 슬러그
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">/p/</span>
                    <input
                      type="text"
                      value={newPageSlug}
                      onChange={(e) => setNewPageSlug(e.target.value.replace(/[^a-z0-9가-힣-]/gi, '-').toLowerCase())}
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
