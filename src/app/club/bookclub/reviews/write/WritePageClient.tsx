'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ChevronRight } from 'lucide-react'

interface Program {
  id: string
  title: string
  type: string
  status: string
  sessions: {
    id: string
    sessionNo: number
    title: string | null
    date: Date
    bookTitle: string | null
    bookAuthor: string | null
  }[]
}

interface WritePageClientProps {
  programs: Program[]
}

export default function WritePageClient({ programs }: WritePageClientProps) {
  const router = useRouter()
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">참여 중인 프로그램이 없습니다</p>
      </div>
    )
  }

  if (!selectedProgram) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">프로그램을 선택하세요</p>
        {programs.map((program) => (
          <button
            key={program.id}
            onClick={() => setSelectedProgram(program)}
            className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">{program.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {program.sessions.length}개 회차 · {program.status === 'ONGOING' ? '진행 중' : '완료'}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setSelectedProgram(null)}
        className="text-sm text-blue-600 hover:text-blue-700 mb-2"
      >
        ← 프로그램 다시 선택
      </button>
      <p className="text-sm text-gray-600 mb-4">
        <span className="font-medium">{selectedProgram.title}</span>의 회차를 선택하세요
      </p>
      {selectedProgram.sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">등록된 회차가 없습니다</div>
      ) : (
        selectedProgram.sessions.map((s) => (
          <button
            key={s.id}
            onClick={() =>
              router.push(
                `/club/bookclub/reviews/write?programId=${selectedProgram.id}&sessionId=${s.id}`
              )
            }
            className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">
                {s.sessionNo}회차{s.title ? ` - ${s.title}` : ''}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {s.bookTitle || '책 미정'}{' '}
                {s.date && `· ${new Date(s.date).toLocaleDateString('ko-KR')}`}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))
      )}
    </div>
  )
}
