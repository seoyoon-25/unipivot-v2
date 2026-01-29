'use client'

import { useState } from 'react'
import { Timer, ChevronRight } from 'lucide-react'
import SpeakingTimer from '@/components/club/facilitator/SpeakingTimer'

interface ProgramData {
  programId: string
  programTitle: string
  sessions: {
    id: string
    sessionNo: number
    title: string | null
    date: string
  }[]
  participants: {
    userId: string
    name: string | null
  }[]
}

interface TimerPageClientProps {
  programs: ProgramData[]
}

export default function TimerPageClient({ programs }: TimerPageClientProps) {
  const [selectedSession, setSelectedSession] = useState<{
    sessionId: string
    programTitle: string
    sessionNo: number
    participants: { userId: string; name: string | null }[]
  } | null>(null)

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <Timer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">관리하는 프로그램이 없습니다</p>
      </div>
    )
  }

  if (selectedSession) {
    return (
      <div>
        <button
          onClick={() => setSelectedSession(null)}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          ← 세션 다시 선택
        </button>
        <div className="text-sm text-gray-500 mb-4">
          {selectedSession.programTitle} · {selectedSession.sessionNo}회차
        </div>
        <SpeakingTimer
          sessionId={selectedSession.sessionId}
          participants={selectedSession.participants}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {programs.map((prog) => (
        <div key={prog.programId}>
          <h3 className="text-sm font-medium text-gray-700 mb-2">{prog.programTitle}</h3>
          <div className="space-y-2">
            {prog.sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() =>
                  setSelectedSession({
                    sessionId: sess.id,
                    programTitle: prog.programTitle,
                    sessionNo: sess.sessionNo,
                    participants: prog.participants,
                  })
                }
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-green-300 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {sess.sessionNo}회차{sess.title ? ` - ${sess.title}` : ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(sess.date).toLocaleDateString('ko-KR')} · {prog.participants.length}명
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
