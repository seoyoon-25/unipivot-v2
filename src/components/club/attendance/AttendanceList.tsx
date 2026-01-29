'use client'

import { useState } from 'react'
import { Check, Clock, X, UserCheck } from 'lucide-react'
import { manualCheckIn } from '@/app/club/attendance/actions'

interface AttendanceItem {
  id: string
  status: string
  checkedAt?: Date | string | null
  checkMethod?: string | null
  note?: string | null
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

interface AttendanceListProps {
  sessionId: string
  attendances: AttendanceItem[]
  isEditable?: boolean
}

export default function AttendanceList({ sessionId, attendances, isEditable = false }: AttendanceListProps) {
  const [items, setItems] = useState(attendances)
  const [saving, setSaving] = useState<string | null>(null)

  const handleStatusChange = async (userId: string, status: 'PRESENT' | 'LATE' | 'ABSENT') => {
    setSaving(userId)
    try {
      await manualCheckIn(sessionId, userId, status)
      setItems((prev) =>
        prev.map((item) =>
          item.user.id === userId
            ? { ...item, status, checkedAt: status !== 'ABSENT' ? new Date().toISOString() : null, checkMethod: 'MANUAL' }
            : item
        )
      )
    } catch {
      // ignore
    } finally {
      setSaving(null)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Check className="w-4 h-4 text-green-600" />
      case 'LATE':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'ABSENT':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <X className="w-4 h-4 text-gray-400" />
    }
  }

  const statusText = (status: string) => {
    switch (status) {
      case 'PRESENT': return '출석'
      case 'LATE': return '지각'
      case 'ABSENT': return '결석'
      default: return '미확인'
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-50 text-green-700'
      case 'LATE': return 'bg-yellow-50 text-yellow-700'
      case 'ABSENT': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-50 text-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-900">출석 현황</span>
        <span className="text-xs text-gray-400">({items.length}명)</span>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <div key={item.id} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {statusIcon(item.status)}
                <span className="text-sm font-medium text-gray-900">{item.user.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(item.status)}`}>
                {statusText(item.status)}
              </span>
              {item.checkedAt && (
                <span className="text-xs text-gray-400">
                  {new Date(item.checkedAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              {item.checkMethod && (
                <span className="text-xs text-gray-300">
                  ({item.checkMethod === 'QR' ? 'QR' : '수동'})
                </span>
              )}
            </div>
            {isEditable && (
              <div className="flex items-center gap-1">
                {(['PRESENT', 'LATE', 'ABSENT'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(item.user.id, s)}
                    disabled={saving === item.user.id || item.status === s}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      item.status === s
                        ? `${statusColor(s)} font-medium`
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {statusText(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            출석 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
