'use client'

import { useState } from 'react'
import {
  Loader2,
  Send,
  Bell,
  Users,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  RefreshCw,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  sendRSVPRequests,
  sendRSVPReminder,
} from '@/lib/actions/rsvp'
import type { RSVPStatus } from '@/types/facilitator'
import { RSVP_STATUS_INFO } from '@/types/facilitator'

interface RSVPUser {
  id: string
  status: RSVPStatus
  note: string | null
  respondedAt: Date | null
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface RSVPStats {
  total: number
  attending: number
  notAttending: number
  maybe: number
  pending: number
  responseRate: number
}

interface RSVPDashboardProps {
  sessionId: string
  programId: string
  currentUserId: string
  rsvps: RSVPUser[]
  stats: RSVPStats
  rsvpEnabled: boolean
  className?: string
}

export function RSVPDashboard({
  sessionId,
  programId,
  currentUserId,
  rsvps,
  stats,
  rsvpEnabled,
  className,
}: RSVPDashboardProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState<RSVPStatus | 'ALL'>('ALL')

  const handleSendRequests = async () => {
    setLoading('send')
    setError(null)
    setSuccess(null)

    try {
      const result = await sendRSVPRequests(sessionId, currentUserId)
      setSuccess(`${result.created}명에게 RSVP 요청을 발송했습니다.`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '발송 중 오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  const handleSendReminder = async () => {
    setLoading('reminder')
    setError(null)
    setSuccess(null)

    try {
      const result = await sendRSVPReminder(sessionId, currentUserId)
      setSuccess(`${result.sent}명에게 리마인더를 발송했습니다.`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '리마인더 발송 중 오류가 발생했습니다.')
    } finally {
      setLoading(null)
    }
  }

  const filteredRsvps = filter === 'ALL'
    ? rsvps
    : rsvps.filter(r => r.status === filter)

  const getStatusIcon = (status: RSVPStatus) => {
    switch (status) {
      case 'ATTENDING':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'NOT_ATTENDING':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'MAYBE':
        return <HelpCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (!rsvpEnabled) {
    return (
      <div className={cn('bg-white rounded-lg border p-6', className)}>
        <div className="text-center py-8 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>이 프로그램은 RSVP가 비활성화되어 있습니다.</p>
          <p className="text-sm mt-1">프로그램 설정에서 RSVP를 활성화하세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border p-6 space-y-6', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          참석 확인 (RSVP)
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminder}
            disabled={loading !== null || stats.pending === 0}
            className="gap-2"
          >
            {loading === 'reminder' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            리마인더
          </Button>
          <Button
            size="sm"
            onClick={handleSendRequests}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'send' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            RSVP 발송
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-5 gap-3">
        <button
          onClick={() => setFilter('ALL')}
          className={cn(
            'p-3 rounded-lg border text-center transition-colors',
            filter === 'ALL' ? 'bg-gray-100 border-gray-300' : 'hover:bg-gray-50'
          )}
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">전체</div>
        </button>
        <button
          onClick={() => setFilter('ATTENDING')}
          className={cn(
            'p-3 rounded-lg border text-center transition-colors',
            filter === 'ATTENDING' ? 'bg-green-50 border-green-300' : 'hover:bg-green-50/50'
          )}
        >
          <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
          <div className="text-xs text-green-600">참석</div>
        </button>
        <button
          onClick={() => setFilter('NOT_ATTENDING')}
          className={cn(
            'p-3 rounded-lg border text-center transition-colors',
            filter === 'NOT_ATTENDING' ? 'bg-red-50 border-red-300' : 'hover:bg-red-50/50'
          )}
        >
          <div className="text-2xl font-bold text-red-600">{stats.notAttending}</div>
          <div className="text-xs text-red-600">불참</div>
        </button>
        <button
          onClick={() => setFilter('MAYBE')}
          className={cn(
            'p-3 rounded-lg border text-center transition-colors',
            filter === 'MAYBE' ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-yellow-50/50'
          )}
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.maybe}</div>
          <div className="text-xs text-yellow-600">미정</div>
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={cn(
            'p-3 rounded-lg border text-center transition-colors',
            filter === 'PENDING' ? 'bg-gray-100 border-gray-300' : 'hover:bg-gray-50'
          )}
        >
          <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
          <div className="text-xs text-gray-500">미응답</div>
        </button>
      </div>

      {/* 응답률 프로그레스 바 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">응답률</span>
          <span className="font-medium">{stats.responseRate}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${stats.responseRate}%` }}
          />
        </div>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* 참가자 목록 */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredRsvps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === 'ALL' ? (
              <p>아직 RSVP 요청이 발송되지 않았습니다.</p>
            ) : (
              <p>{RSVP_STATUS_INFO[filter as RSVPStatus].name} 상태인 참가자가 없습니다.</p>
            )}
          </div>
        ) : (
          filteredRsvps.map((rsvp) => {
            const statusInfo = RSVP_STATUS_INFO[rsvp.status]

            return (
              <div
                key={rsvp.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
              >
                {/* 프로필 */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {rsvp.user.image ? (
                    <img
                      src={rsvp.user.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {rsvp.user.name?.slice(0, 1) || '?'}
                    </span>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {rsvp.user.name || '알 수 없음'}
                    </span>
                    {getStatusIcon(rsvp.status)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {rsvp.user.email}
                  </div>
                </div>

                {/* 상태 배지 */}
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-medium flex-shrink-0',
                  statusInfo.color
                )}>
                  {statusInfo.emoji} {statusInfo.name}
                </div>

                {/* 응답 시간 */}
                {rsvp.respondedAt && (
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(rsvp.respondedAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 메모 표시 (응답에 메모가 있는 경우) */}
      {filteredRsvps.some(r => r.note) && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">메모</h4>
          <div className="space-y-2">
            {filteredRsvps
              .filter(r => r.note)
              .map((rsvp) => (
                <div key={`note-${rsvp.id}`} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {rsvp.user.name}
                    </span>
                    {getStatusIcon(rsvp.status)}
                  </div>
                  <p className="text-sm text-gray-600">{rsvp.note}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
