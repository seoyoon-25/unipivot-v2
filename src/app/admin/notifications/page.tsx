'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Send, Users, Search, Check, FileText, History } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
}

export default function AdminNotificationsPage() {
  const [type, setType] = useState('SYSTEM')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [link, setLink] = useState('')
  const [sendToAll, setSendToAll] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sendToAll) {
      fetchUsers()
    }
  }, [sendToAll, searchQuery])

  async function fetchUsers() {
    try {
      const res = await fetch(`/api/admin/users?search=${searchQuery}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.members || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          content: content || null,
          link: link || null,
          sendToAll,
          userIds: sendToAll ? undefined : selectedUsers
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '알림 발송에 실패했습니다.')
      }

      const data = await res.json()
      setSuccess(true)
      setTitle('')
      setContent('')
      setLink('')
      setSelectedUsers([])

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 발송에 실패했습니다.')
    }
    setLoading(false)
  }

  function toggleUser(userId: string) {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">알림 발송</h1>
          <p className="text-gray-600">회원들에게 알림을 발송합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/notifications/logs"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <History className="w-5 h-5" />
            발송 내역
          </Link>
          <Link
            href="/admin/notifications/templates"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-5 h-5" />
            템플릿 관리
          </Link>
        </div>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
              <Check className="w-5 h-5" />
              알림이 성공적으로 발송되었습니다!
            </div>
          )}

          {/* Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">알림 유형</label>
            <div className="flex gap-2">
              {[
                { value: 'SYSTEM', label: '시스템', color: 'blue' },
                { value: 'PROGRAM', label: '프로그램', color: 'green' },
                { value: 'PAYMENT', label: '결제', color: 'yellow' },
                { value: 'OTHER', label: '기타', color: 'gray' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === opt.value
                      ? `bg-${opt.color}-100 text-${opt.color}-700 border-2 border-${opt.color}-300`
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="알림 제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="알림 내용을 입력하세요 (선택)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          {/* Link */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">링크</label>
            <input
              type="text"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="예: /programs/123 (선택)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-sm text-gray-500">알림 클릭 시 이동할 페이지 경로</p>
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">수신자</label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={sendToAll}
                  onChange={() => setSendToAll(true)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">전체 회원</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!sendToAll}
                  onChange={() => setSendToAll(false)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">선택 회원</span>
              </label>
            </div>

            {!sendToAll && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="이름 또는 이메일로 검색"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {selectedUsers.length > 0 && (
                  <div className="mb-4 p-3 bg-primary-light rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      {selectedUsers.length}명 선택됨
                    </p>
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {users.map(user => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'bg-primary-light'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name || '이름 없음'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !title || (!sendToAll && selectedUsers.length === 0)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                알림 발송
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
