'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import WeekDatePicker from './WeekDatePicker'
import ScheduleItem from './ScheduleItem'

interface Session {
  id: string
  title: string | null
  date: string | Date
  startTime: string | null
  endTime: string | null
  location: string | null
  sessionNo: number
  bookTitle: string | null
  program: {
    id: string
    title: string
    slug: string
    image: string | null
    type: string
  }
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export default function BookClubScheduleSection({ sessions }: { sessions: Session[] }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  const sessionDates = useMemo(() => {
    const set = new Set<string>()
    sessions.forEach((s) => {
      const d = new Date(s.date)
      set.add(toKey(d))
    })
    return set
  }, [sessions])

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => isSameDay(new Date(s.date), selectedDate))
  }, [sessions, selectedDate])

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
              Schedule
            </p>
            <h2 className="text-2xl md:text-[26px] font-bold text-zinc-900 tracking-tight">
              북클럽 모임 일정
            </h2>
          </div>
          <Link
            href="/club/bookclub"
            className="flex items-center gap-0.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Week Date Picker */}
        <div className="mb-8 flex justify-center">
          <WeekDatePicker
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            sessionDates={sessionDates}
          />
        </div>

        {/* Session List */}
        <div className="space-y-3">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <ScheduleItem
                key={session.id}
                id={session.id}
                title={session.title}
                startTime={session.startTime}
                endTime={session.endTime}
                location={session.location}
                sessionNo={session.sessionNo}
                bookTitle={session.bookTitle}
                program={session.program}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <CalendarDays className="w-10 h-10 mb-3 text-zinc-300" />
              <p className="text-sm font-medium">이 날은 예정된 일정이 없어요</p>
              <p className="text-xs text-zinc-300 mt-1">다른 날짜를 선택해 보세요</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
