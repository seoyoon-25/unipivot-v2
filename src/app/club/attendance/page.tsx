import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QrCode, Check, Clock, X } from 'lucide-react'
import { getMyAttendance, getMyAttendanceSummary } from '@/lib/club/attendance-queries'

export const metadata = {
  title: '출석 현황 | 유니클럽',
}

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login?callbackUrl=/club/attendance')
  }

  const [attendances, summary] = await Promise.all([
    getMyAttendance(),
    getMyAttendanceSummary(),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출석 현황</h1>
          <p className="text-sm text-gray-500 mt-1">내 출석 기록을 확인하세요</p>
        </div>
        <Link
          href="/club/attendance/scan"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <QrCode className="w-4 h-4" />
          QR 출석
        </Link>
      </div>

      {/* Summary Cards */}
      {summary.length > 0 && (
        <div className="space-y-3 mb-6">
          {summary.map((prog) => (
            <div
              key={prog.programId}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{prog.programTitle}</h3>
                <span className="text-sm font-semibold text-blue-600">{prog.rate}%</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-3.5 h-3.5" />
                  출석 {prog.present}
                </span>
                <span className="flex items-center gap-1 text-yellow-600">
                  <Clock className="w-3.5 h-3.5" />
                  지각 {prog.late}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <X className="w-3.5 h-3.5" />
                  결석 {prog.absent}
                </span>
                <span className="text-gray-400">/ 전체 {prog.totalSessions}회</span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${prog.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance History */}
      <h2 className="font-semibold text-gray-900 mb-3">출석 기록</h2>
      <div className="space-y-2">
        {attendances.length > 0 ? (
          attendances.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {a.session.programTitle} - {a.session.sessionNo}회차
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(a.session.date).toLocaleDateString('ko-KR')}
                  {a.session.bookTitle && ` · ${a.session.bookTitle}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {a.status === 'PRESENT' && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" /> 출석
                  </span>
                )}
                {a.status === 'LATE' && (
                  <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" /> 지각
                  </span>
                )}
                {a.status === 'ABSENT' && (
                  <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    <X className="w-3 h-3" /> 결석
                  </span>
                )}
                {a.checkedAt && (
                  <span className="text-xs text-gray-400">
                    {new Date(a.checkedAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            아직 출석 기록이 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
