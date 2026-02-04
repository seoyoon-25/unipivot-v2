'use client'

import { useState } from 'react'
import { MessageSquare, ChevronRight, BookOpen } from 'lucide-react'
import QuestionGenerator from '@/components/club/facilitator/QuestionGenerator'

interface SessionData {
  id: string
  sessionNo: number
  title: string | null
  date: string
  bookTitle: string | null
  reportCount: number
  questionCount: number
}

interface ProgramData {
  programId: string
  programTitle: string
  sessions: SessionData[]
}

interface QuestionsPageClientProps {
  programs: ProgramData[]
}

export default function QuestionsPageClient({ programs }: QuestionsPageClientProps) {
  const [selectedSession, setSelectedSession] = useState<{
    sessionId: string
    programTitle: string
    sessionNo: number
    bookTitle: string | null
    reportCount: number
  } | null>(null)

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
        <p className="text-zinc-500">관리하는 프로그램이 없습니다</p>
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
        <div className="text-sm text-zinc-500 mb-4 flex items-center gap-2">
          <span>{selectedSession.programTitle} · {selectedSession.sessionNo}회차</span>
          {selectedSession.bookTitle && (
            <span className="flex items-center gap-1 text-zinc-400">
              <BookOpen className="w-3.5 h-3.5" />
              {selectedSession.bookTitle}
            </span>
          )}
        </div>
        <QuestionGenerator
          sessionId={selectedSession.sessionId}
          reportCount={selectedSession.reportCount}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {programs.map((prog) => (
        <div key={prog.programId}>
          <h3 className="text-sm font-medium text-zinc-700 mb-2">{prog.programTitle}</h3>
          <div className="space-y-2">
            {prog.sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() =>
                  setSelectedSession({
                    sessionId: sess.id,
                    programTitle: prog.programTitle,
                    sessionNo: sess.sessionNo,
                    bookTitle: sess.bookTitle,
                    reportCount: sess.reportCount,
                  })
                }
                className="w-full bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 text-left hover:border-purple-300 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-zinc-900">
                    {sess.sessionNo}회차{sess.title ? ` - ${sess.title}` : ''}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                    <span>{new Date(sess.date).toLocaleDateString('ko-KR')}</span>
                    {sess.bookTitle && <span>· {sess.bookTitle}</span>}
                    <span>· 독후감 {sess.reportCount}개</span>
                    {sess.questionCount > 0 && (
                      <span className="text-purple-600">· 질문 {sess.questionCount}개</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
