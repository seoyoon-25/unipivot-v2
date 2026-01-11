'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Save, X, Book, Calendar, Globe, Lock } from 'lucide-react'
import { updateBookReport, deleteBookReport } from '@/lib/actions/public'

interface Report {
  id: string
  title: string
  content: string
  isPublic: boolean
  createdAt: Date
  book: {
    id: string
    title: string
    author: string | null
  }
}

interface Props {
  report: Report
}

export default function ReportDetail({ report }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [form, setForm] = useState({
    title: report.title,
    content: report.content,
    isPublic: report.isPublic
  })

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!form.content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await updateBookReport(report.id, {
        title: form.title,
        content: form.content,
        isPublic: form.isPublic
      })
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteBookReport(report.id)
      router.push('/my/reports')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({
      title: report.title,
      content: report.content,
      isPublic: report.isPublic
    })
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/my/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {isEditing ? (
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="text-lg font-bold text-gray-900 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          ) : (
            <h2 className="text-lg font-bold text-gray-900">{report.title}</h2>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
          <Book className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{report.book.title}</p>
          {report.book.author && (
            <p className="text-sm text-gray-500">{report.book.author}</p>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(report.createdAt).toLocaleDateString('ko-KR')}
        </span>
        {isEditing ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span>공개</span>
          </label>
        ) : report.isPublic ? (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-600 rounded">
            <Globe className="w-3 h-3" />
            공개
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            <Lock className="w-3 h-3" />
            비공개
          </span>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={15}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-6"
        />
      ) : (
        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700">{report.content}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">기록 삭제</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 독서 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
