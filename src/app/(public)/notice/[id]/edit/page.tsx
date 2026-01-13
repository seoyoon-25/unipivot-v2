'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Pin, Eye } from 'lucide-react'
import { RichTextEditor } from '@/components/editor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { DraftRestoreAlert, AutoSaveIndicator } from '@/components/common/DraftRestoreAlert'

export default function EditNoticePage() {
  const router = useRouter()
  const params = useParams()
  const noticeId = params.id as string
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    isPinned: false,
    isPublic: true,
  })

  const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
    key: `notice-draft-edit-${noticeId}`,
    data: form,
    enabled: dataLoaded,
  })

  const handleRestore = () => {
    const restored = restoreDraft()
    if (restored) {
      setForm(restored)
      alert('임시저장된 내용을 복원했습니다.')
    }
  }

  // 공지사항 데이터 로드
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/admin/notices/${noticeId}`)
        if (!res.ok) {
          throw new Error('공지사항을 찾을 수 없습니다.')
        }

        const notice = await res.json()
        setForm({
          title: notice.title || '',
          content: notice.content || '',
          isPinned: notice.isPinned || false,
          isPublic: notice.isPublic !== undefined ? notice.isPublic : true,
        })
        setDataLoaded(true)
      } catch (error: any) {
        alert(error.message || '공지사항을 불러올 수 없습니다.')
        router.push('/notice')
      } finally {
        setLoading(false)
      }
    }

    if (status !== 'loading' && session) {
      if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN') {
        alert('관리자만 공지사항을 수정할 수 있습니다.')
        router.push('/notice')
      } else {
        fetchNotice()
      }
    } else if (status !== 'loading' && !session) {
      router.push('/login')
    }
  }, [noticeId, session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/notices/${noticeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '공지사항 수정 실패')
      }

      clearDraft()
      alert('공지사항이 수정되었습니다.')
      router.push(`/notice/${noticeId}`)
    } catch (error: any) {
      alert(error.message || '공지사항 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 로딩 중
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // 권한 없음
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/notice/${noticeId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">공지사항 수정</h1>
              <p className="text-sm text-gray-500 mt-1">관리자 전용</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} />
        </div>

        {hasDraft && (
          <DraftRestoreAlert onRestore={handleRestore} onDiscard={clearDraft} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">공지사항 정보</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="공지사항 제목을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용 *
                  </label>
                  <RichTextEditor
                    content={form.content}
                    onChange={(html) => setForm({ ...form, content: html })}
                    placeholder="공지사항 내용을 입력하세요..."
                    minHeight="300px"
                    autoSaveKey={`notice-edit-${noticeId}`}
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
                    <Pin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">상단 고정</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublic}
                      onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">공개</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-4">
              <Link
                href={`/notice/${noticeId}`}
                className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
