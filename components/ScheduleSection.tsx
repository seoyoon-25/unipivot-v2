'use client'

import Link from 'next/link'

interface Session {
  id: string
  title: string | null
  date: Date
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

interface ScheduleSectionProps {
  sessions: Session[]
}

function formatDate(date: Date) {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[d.getDay()]
  return { month, day, weekday }
}

export default function ScheduleSection({ sessions }: ScheduleSectionProps) {
  if (sessions.length === 0) {
    return (
      <section className="mt-16">
        <h2>이번 주 일정</h2>
        <p className="mt-6 text-neutral-500">이번 주 예정된 일정이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between">
        <h2>이번 주 일정</h2>
        <Link href="/programs" className="text-sm text-primary hover:underline">
          전체보기 →
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {sessions.map((session) => {
          const { month, day, weekday } = formatDate(session.date)
          return (
            <Link
              key={session.id}
              href={`/programs/${session.program.slug}`}
              className="flex items-center gap-4 p-4 bg-white rounded-card shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-200"
            >
              {/* Date */}
              <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary-light rounded-lg">
                <span className="text-xs text-primary">{month}월</span>
                <span className="text-lg font-bold text-primary">{day}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-500">
                  {session.program.title} · {session.sessionNo}회차
                </p>
                <h3 className="mt-1 truncate">
                  {session.bookTitle || session.title || '모임'}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {weekday}요일 {session.startTime}
                  {session.location && ` · ${session.location}`}
                </p>
              </div>

              {/* Arrow */}
              <span className="text-neutral-500">→</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
