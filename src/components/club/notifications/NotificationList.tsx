'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  content: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        unreadOnly: filter === 'unread' ? 'true' : 'false',
      })
      const res = await fetch(`/api/notifications?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setTotalPages(data.pages || 1)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
      })
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      )
    } catch {
      // ignore
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      // ignore
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }
    } catch {
      // ignore
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setFilter('all'); setPage(1) }}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => { setFilter('unread'); setPage(1) }}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === 'unread'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            안읽음
          </button>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <CheckCheck className="w-4 h-4" />
          모두 읽음
        </button>
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          {filter === 'unread' ? '읽지 않은 알림이 없습니다.' : '알림이 없습니다.'}
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-lg p-4 border ${
                !n.isRead ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                    <p className={`text-sm ${!n.isRead ? 'font-semibold' : ''} text-gray-900`}>
                      {n.title}
                    </p>
                  </div>
                  {n.content && (
                    <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{formatDate(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead([n.id])}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                      title="읽음 처리"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {n.link && (
                    <Link
                      href={n.link}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                      onClick={() => { if (!n.isRead) markAsRead([n.id]) }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
