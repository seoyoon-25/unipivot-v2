import Link from 'next/link'
import { Clock, MapPin, BookOpen, Wifi } from 'lucide-react'

interface ScheduleItemProps {
  id: string
  title: string | null
  startTime: string | null
  endTime: string | null
  location: string | null
  sessionNo: number
  bookTitle: string | null
  program: {
    id: string
    title: string
    slug: string
    type: string
  }
}

export default function ScheduleItem({
  startTime,
  endTime,
  location,
  sessionNo,
  bookTitle,
  program,
}: ScheduleItemProps) {
  const isOnline = location?.includes('온라인') || location?.includes('Zoom')

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-100 hover:border-blue-100 hover:shadow-md transition-all duration-200">
      {/* Time Column */}
      <div className="flex-shrink-0 w-16 text-center">
        {startTime && (
          <p className="text-base font-bold text-zinc-900">{startTime}</p>
        )}
        {endTime && (
          <p className="text-[10px] text-zinc-400 mt-0.5">~{endTime}</p>
        )}
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 w-px h-12 bg-zinc-200 group-hover:bg-blue-200 transition-colors duration-200" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {sessionNo}회차
          </span>
          {isOnline && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <Wifi className="w-2.5 h-2.5" />
              온라인
            </span>
          )}
        </div>
        <h4 className="text-sm font-semibold text-zinc-900 truncate">
          {program.title}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          {location && !isOnline && (
            <span className="flex items-center gap-0.5 text-xs text-zinc-400">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
          {bookTitle && (
            <span className="flex items-center gap-0.5 text-xs text-zinc-400">
              <BookOpen className="w-3 h-3" />
              {bookTitle}
            </span>
          )}
        </div>
      </div>

      {/* Join Button */}
      <Link
        href={`/programs/${program.slug}`}
        className="flex-shrink-0 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm hover:shadow-md"
      >
        참가
      </Link>
    </div>
  )
}
