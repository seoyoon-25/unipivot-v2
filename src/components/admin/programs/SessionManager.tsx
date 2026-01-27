'use client'

import { Plus, Trash2, BookOpen, Copy, Upload } from 'lucide-react'

export interface ProgramSession {
  id?: string
  sessionNo: number
  date: string
  startTime: string
  endTime: string
  title: string
  bookTitle: string
  bookAuthor: string
  bookImage: string
  bookRange: string
}

interface SessionManagerProps {
  sessions: ProgramSession[]
  onChange: (sessions: ProgramSession[]) => void
}

export function SessionManager({ sessions, onChange }: SessionManagerProps) {
  const addSession = () => {
    const nextNo = sessions.length + 1
    onChange([
      ...sessions,
      {
        sessionNo: nextNo,
        date: '',
        startTime: '',
        endTime: '',
        title: `${nextNo}회차`,
        bookTitle: '',
        bookAuthor: '',
        bookImage: '',
        bookRange: '',
      },
    ])
  }

  const duplicateSession = (index: number) => {
    const source = sessions[index]
    const nextNo = sessions.length + 1
    onChange([
      ...sessions,
      {
        sessionNo: nextNo,
        date: '',
        startTime: source.startTime,
        endTime: source.endTime,
        title: `${nextNo}회차`,
        bookTitle: source.bookTitle,
        bookAuthor: source.bookAuthor,
        bookImage: source.bookImage,
        bookRange: source.bookRange,
      },
    ])
  }

  const removeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      sessionNo: i + 1,
      title: s.title === `${s.sessionNo}회차` ? `${i + 1}회차` : s.title,
    }))
    onChange(updated)
  }

  const updateSession = (index: number, field: keyof ProgramSession, value: string | number) => {
    const updated = [...sessions]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleSessionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const input = e.target

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '업로드 실패')
      }

      const data = await res.json()
      updateSession(index, 'bookImage', data.url)
    } catch (error: any) {
      alert(error.message || '이미지 업로드에 실패했습니다.')
    } finally {
      input.value = ''
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">회차 정보</h2>
        </div>
        <button
          type="button"
          onClick={addSession}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          회차 추가
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>회차 정보가 없습니다.</p>
          <p className="text-sm">위의 "회차 추가" 버튼을 클릭하여 추가하세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-semibold rounded-full text-sm">
                    {s.sessionNo}
                  </span>
                  <span className="font-medium text-gray-900">{s.sessionNo}회차</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => duplicateSession(index)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="이 회차 복제"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSession(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    날짜 *
                  </label>
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) => updateSession(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시작 시간
                    </label>
                    <input
                      type="time"
                      value={s.startTime}
                      onChange={(e) => updateSession(index, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      종료 시간
                    </label>
                    <input
                      type="time"
                      value={s.endTime}
                      onChange={(e) => updateSession(index, 'endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회차 제목
                  </label>
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => updateSession(index, 'title', e.target.value)}
                    placeholder="예: 오리엔테이션, 3장 토론 등"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    도서명
                  </label>
                  <input
                    type="text"
                    value={s.bookTitle}
                    onChange={(e) => updateSession(index, 'bookTitle', e.target.value)}
                    placeholder="예: 역사란 무엇인가"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    저자
                  </label>
                  <input
                    type="text"
                    value={s.bookAuthor}
                    onChange={(e) => updateSession(index, 'bookAuthor', e.target.value)}
                    placeholder="예: E.H. 카"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    읽기 범위
                  </label>
                  <input
                    type="text"
                    value={s.bookRange}
                    onChange={(e) => updateSession(index, 'bookRange', e.target.value)}
                    placeholder="예: 1장~3장 (p.1~89)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    도서 표지 이미지
                  </label>
                  <div className="flex items-center gap-3">
                    {s.bookImage ? (
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
                        <img src={s.bookImage} alt="도서 표지" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => updateSession(index, 'bookImage', '')}
                          className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : null}
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">이미지 업로드</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSessionImageUpload(e, index)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
