'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, CalendarDays, Clock } from 'lucide-react'
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#faf8f5] via-white to-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 mb-4">
              <CalendarDays className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold text-teal-700 tracking-wide uppercase">Schedule</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">
              북클럽 모임 일정
            </h2>
            <p className="text-stone-500 mt-2 text-sm md:text-base">
              이번 주 예정된 독서 모임을 확인하세요
            </p>
          </div>
          <Link
            href="/club/bookclub"
            className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Week Date Picker */}
        <div className="mb-10 flex justify-center">
          <WeekDatePicker
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            sessionDates={sessionDates}
          />
        </div>

        {/* Session List */}
        <div className="space-y-4">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => (
              <div
                key={session.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-in fade-in slide-in-from-bottom-2"
              >
                <ScheduleItem
                  id={session.id}
                  title={session.title}
                  startTime={session.startTime}
                  endTime={session.endTime}
                  location={session.location}
                  sessionNo={session.sessionNo}
                  bookTitle={session.bookTitle}
                  program={session.program}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] bg-white border border-stone-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-base font-medium text-stone-500">이 날은 예정된 일정이 없어요</p>
              <p className="text-sm text-stone-400 mt-1">다른 날짜를 선택해 보세요</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
