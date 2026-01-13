'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface NotificationLog {
  id: string
  type: string
  recipientId: string | null
  recipientEmail: string | null
  recipientPhone: string | null
  subject: string
  content: string
  channel: 'EMAIL' | 'SMS' | 'KAKAO' | 'PUSH'
  status: 'PENDING' | 'SENT' | 'FAILED'
  sentAt: string | null
  errorMessage: string | null
  createdAt: string
  recipient?: {
    name: string | null
    email: string
  } | null
}

interface LogsResponse {
  logs: NotificationLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  stats: {
    total: number
    sent: number
    failed: number
    pending: number
    byChannel: Record<string, number>
  }
}

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<LogsResponse['stats'] | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [page, channelFilter, statusFilter, dateFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(channelFilter !== 'all' && { channel: channelFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFilter !== 'all' && { date: dateFilter }),
        ...(searchTerm && { search: searchTerm }),
      })

      const res = await fetch(`/api/admin/notifications/logs?${params}`)
      if (res.ok) {
        const data: LogsResponse = await res.json()
        setLogs(data.logs)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'KAKAO':
        return <MessageSquare className="w-4 h-4" />
      case 'EMAIL':
        return <Mail className="w-4 h-4" />
      case 'SMS':
      case 'LMS':
        return <Phone className="w-4 h-4" />
      case 'PUSH':
        return <Bell className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getChannelBadge = (channel: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      KAKAO: { label: '알림톡', className: 'bg-yellow-100 text-yellow-700' },
      EMAIL: { label: '이메일', className: 'bg-blue-100 text-blue-700' },
      SMS: { label: 'SMS', className: 'bg-green-100 text-green-700' },
      LMS: { label: 'LMS', className: 'bg-green-100 text-green-700' },
      PUSH: { label: '푸시', className: 'bg-purple-100 text-purple-700' },
    }
    return badges[channel] || { label: channel, className: 'bg-gray-100 text-gray-700' }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
      SENT: { label: '발송완료', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      FAILED: { label: '실패', className: 'bg-red-100 text-red-700', icon: XCircle },
      PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
    }
    return badges[status] || badges.PENDING
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/notifications"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">발송 내역</h1>
            <p className="text-gray-600">알림톡, SMS, 이메일 발송 기록을 확인합니다</p>
          </div>
        </div>
        <button
          onClick={() => fetchLogs()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">전체 발송</p>
            <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">발송 완료</p>
            <p className="text-2xl font-bold text-green-600">{stats.sent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">발송 실패</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">알림톡</p>
            <p className="text-2xl font-bold text-yellow-600">
              {(stats.byChannel.KAKAO || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">SMS/LMS</p>
            <p className="text-2xl font-bold text-green-600">
              {((stats.byChannel.SMS || 0) + (stats.byChannel.LMS || 0)).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="제목, 수신자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </form>

          <div className="flex gap-2 flex-wrap">
            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">전체 채널</option>
              <option value="KAKAO">알림톡</option>
              <option value="SMS">SMS</option>
              <option value="LMS">LMS</option>
              <option value="EMAIL">이메일</option>
              <option value="PUSH">푸시</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">전체 상태</option>
              <option value="SENT">발송완료</option>
              <option value="FAILED">실패</option>
              <option value="PENDING">대기중</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">발송 내역이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">채널</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">상태</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">수신자</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">제목</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">발송일시</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => {
                    const channelBadge = getChannelBadge(log.channel)
                    const statusBadge = getStatusBadge(log.status)
                    const StatusIcon = statusBadge.icon

                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${channelBadge.className}`}
                          >
                            {getChannelIcon(log.channel)}
                            {channelBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusBadge.className}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {log.recipient?.name && (
                              <p className="font-medium text-gray-900">{log.recipient.name}</p>
                            )}
                            <p className="text-gray-500">
                              {log.recipientPhone || log.recipientEmail || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 max-w-xs truncate">
                            {log.subject}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {log.sentAt ? formatDate(log.sentAt) : formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                총 {total.toLocaleString()}건 중 {(page - 1) * 20 + 1}-
                {Math.min(page * 20, total)}건
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">발송 상세</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Status & Channel */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    getChannelBadge(selectedLog.channel).className
                  }`}
                >
                  {getChannelIcon(selectedLog.channel)}
                  {getChannelBadge(selectedLog.channel).label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    getStatusBadge(selectedLog.status).className
                  }`}
                >
                  {getStatusBadge(selectedLog.status).label}
                </span>
              </div>

              {/* Recipient */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">수신자</p>
                <p className="text-gray-900">
                  {selectedLog.recipient?.name || '이름 없음'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedLog.recipientPhone || selectedLog.recipientEmail || '-'}
                </p>
              </div>

              {/* Subject */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">제목</p>
                <p className="text-gray-900">{selectedLog.subject}</p>
              </div>

              {/* Content */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">내용</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                    {selectedLog.content}
                  </pre>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">생성일시</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.createdAt)}</p>
                </div>
                {selectedLog.sentAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">발송일시</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedLog.sentAt)}</p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {selectedLog.errorMessage && (
                <div>
                  <p className="text-sm font-medium text-red-500 mb-1">에러 메시지</p>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-700">{selectedLog.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
