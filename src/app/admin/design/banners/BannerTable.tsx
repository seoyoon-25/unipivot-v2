'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Edit2, Trash2, Image, CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react'
import BannerFormModal from './BannerFormModal'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  link: string | null
  position: string | null
  isActive: boolean
  startDate: Date | null
  endDate: Date | null
  order: number
  createdAt: Date
}

interface Props {
  banners: Banner[]
  total: number
  pages: number
  currentPage: number
  searchParams: { position?: string; status?: string }
}

const positionLabels: Record<string, string> = {
  HERO: '메인 히어로',
  SIDEBAR: '사이드바',
  POPUP: '팝업',
}

export default function BannerTable({ banners, total, pages, currentPage, searchParams }: Props) {
  const router = useRouter()
  const [position, setPosition] = useState(searchParams.position || '')
  const [status, setStatus] = useState(searchParams.status || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (position) params.set('position', position)
    if (status) params.set('status', status)
    router.push(`/admin/design/banners?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (position) params.set('position', position)
    if (status) params.set('status', status)
    params.set('page', page.toString())
    router.push(`/admin/design/banners?${params.toString()}`)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling banner status:', error)
    }
  }

  const handleOrderChange = async (id: string, newOrder: number) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingBanner(null)
    setIsModalOpen(true)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isExpired = (endDate: Date | null) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}개의 배너</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 배너
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 위치</option>
            <option value="HERO">메인 히어로</option>
            <option value="SIDEBAR">사이드바</option>
            <option value="POPUP">팝업</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
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
        {banners.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchParams.position || searchParams.status
              ? '검색 결과가 없습니다.'
              : '등록된 배너가 없습니다.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">순서</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">배너</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">위치</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">기간</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map((banner, index) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOrderChange(banner.id, Math.max(0, banner.order - 1))}
                        disabled={index === 0 && currentPage === 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-sm text-gray-600">{banner.order}</span>
                      <button
                        onClick={() => handleOrderChange(banner.id, banner.order + 1)}
                        disabled={index === banners.length - 1 && currentPage === pages}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-20 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-500 line-clamp-1">{banner.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {banner.position ? positionLabels[banner.position] || banner.position : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-600">
                        {formatDate(banner.startDate)} ~ {formatDate(banner.endDate)}
                      </p>
                      {isExpired(banner.endDate) && (
                        <span className="text-xs text-red-500">만료됨</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(banner.id, banner.isActive)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        banner.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {banner.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          활성
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          비활성
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        disabled={deletingId === banner.id}
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
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBanner(null)
        }}
        banner={editingBanner}
      />
    </div>
  )
}
