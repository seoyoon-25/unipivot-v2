'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Highlighter,
  Camera,
  Plus,
  X,
  Trash2,
  Check,
  Image as ImageIcon
} from 'lucide-react'
import {
  saveHighlight,
  getHighlights,
  deleteHighlight
} from '@/lib/actions/reading-helper'

interface Highlight {
  id: string
  text: string
  page: number
  note: string | null
  photoUrl: string | null
  isUsedInReport: boolean
  createdAt: Date
}

interface Props {
  sessionId: string
  onHighlightSelect?: (highlight: Highlight) => void
}

export default function HighlightCapture({ sessionId, onHighlightSelect }: Props) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    page: 1,
    note: '',
    photoUrl: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadHighlights()
  }, [sessionId])

  const loadHighlights = async () => {
    setLoading(true)
    try {
      const data = await getHighlights(sessionId)
      setHighlights(data)
    } catch (error) {
      console.error('하이라이트 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.text.trim()) {
      alert('하이라이트 내용을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      await saveHighlight(sessionId, {
        text: formData.text,
        page: formData.page,
        note: formData.note || undefined,
        photoUrl: formData.photoUrl || undefined
      })

      setFormData({ text: '', page: 1, note: '', photoUrl: '' })
      setShowForm(false)
      await loadHighlights()
    } catch (error) {
      console.error('하이라이트 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (highlightId: string) => {
    if (!confirm('이 하이라이트를 삭제하시겠습니까?')) return

    try {
      await deleteHighlight(highlightId)
      await loadHighlights()
    } catch (error) {
      console.error('하이라이트 삭제 오류:', error)
    }
  }

  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 확인 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    // 이미지 형식 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('지원하지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)')
      return
    }

    setUploading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('generateThumbnail', 'false')

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataObj,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '업로드 실패')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, photoUrl: data.url }))
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Highlighter className="w-5 h-5" />
            하이라이트
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-white/80 mt-2">
          책에서 인상 깊은 구절을 저장해보세요
        </p>
      </div>

      {/* 폼 */}
      {showForm && (
        <div className="p-6 bg-yellow-50 border-b">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800">새 하이라이트</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 텍스트 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                하이라이트 내용 *
              </label>
              <textarea
                value={formData.text}
                onChange={e =>
                  setFormData(prev => ({ ...prev, text: e.target.value }))
                }
                placeholder="인상 깊은 구절을 입력하세요..."
                className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
              />
            </div>

            {/* 페이지 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                페이지
              </label>
              <input
                type="number"
                value={formData.page}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    page: parseInt(e.target.value) || 1
                  }))
                }
                min={1}
                className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 (선택)
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={e =>
                  setFormData(prev => ({ ...prev, note: e.target.value }))
                }
                placeholder="이 구절에 대한 생각..."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* 사진 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                책 사진 (선택)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {formData.photoUrl ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={formData.photoUrl}
                    alt="업로드된 사진"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setFormData(prev => ({ ...prev, photoUrl: '' }))
                    }
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : uploading ? (
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg text-yellow-600 border-yellow-300 bg-yellow-50">
                  <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  <span>업로드 중...</span>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg text-gray-500 hover:border-yellow-500 hover:text-yellow-600 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span>사진 추가</span>
                </button>
              )}
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={saving || !formData.text.trim()}
              className="w-full py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                '저장 중...'
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  저장하기
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 하이라이트 목록 */}
      <div className="p-6">
        {highlights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Highlighter className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>아직 저장된 하이라이트가 없습니다</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              첫 하이라이트 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {highlights.map(highlight => (
              <div
                key={highlight.id}
                className={`relative p-4 rounded-xl border-l-4 ${
                  highlight.isUsedInReport
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                {/* 페이지 뱃지 */}
                <span className="absolute -top-2 right-4 px-2 py-0.5 bg-white border rounded-full text-xs text-gray-600 shadow-sm">
                  p.{highlight.page}
                </span>

                {/* 텍스트 */}
                <p
                  className={`text-gray-800 ${
                    highlight.isUsedInReport ? 'line-through opacity-50' : ''
                  }`}
                >
                  "{highlight.text}"
                </p>

                {/* 메모 */}
                {highlight.note && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    💭 {highlight.note}
                  </p>
                )}

                {/* 사진 */}
                {highlight.photoUrl && (
                  <div className="mt-3">
                    <img
                      src={highlight.photoUrl}
                      alt="하이라이트 사진"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* 액션 */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">
                    {new Date(highlight.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  <div className="flex items-center gap-2">
                    {onHighlightSelect && !highlight.isUsedInReport && (
                      <button
                        onClick={() => onHighlightSelect(highlight)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        독후감에 사용
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(highlight.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 사용됨 표시 */}
                {highlight.isUsedInReport && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                    독후감에 사용됨
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
