'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QrCode, ChevronRight, Users } from 'lucide-react'

interface ProgramData {
  id: string
  title: string
  status: string
  totalParticipants: number
  sessions: {
    id: string
    sessionNo: number
    title: string | null
    date: string
    bookTitle: string | null
    attendanceCount: number
  }[]
}

interface FacilitatorAttendanceClientProps {
  programs: ProgramData[]
}

export default function FacilitatorAttendanceClient({ programs }: FacilitatorAttendanceClientProps) {
  const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(
    programs.length === 1 ? programs[0] : null
  )

  if (programs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        관리하는 프로그램이 없습니다
      </div>
    )
  }

  if (!selectedProgram) {
    return (
      <div className="space-y-3">
        {programs.map((prog) => (
          <button
            key={prog.id}
            onClick={() => setSelectedProgram(prog)}
            className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">{prog.title}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {prog.totalParticipants}명
                </span>
                <span>{prog.sessions.length}개 세션</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div>
      {programs.length > 1 && (
        <button
          onClick={() => setSelectedProgram(null)}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          ← 프로그램 다시 선택
        </button>
      )}

      <div className="space-y-3">
        {selectedProgram.sessions.map((sess) => (
          <div
            key={sess.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">
                {sess.sessionNo}회차{sess.title ? ` - ${sess.title}` : ''}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(sess.date).toLocaleDateString('ko-KR')}
                {sess.bookTitle && ` · ${sess.bookTitle}`}
                <span className="ml-2">출석: {sess.attendanceCount}/{selectedProgram.totalParticipants}</span>
              </div>
            </div>
            <Link
              href={`/club/facilitator/attendance/qr?sessionId=${sess.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <QrCode className="w-4 h-4" />
              QR
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
