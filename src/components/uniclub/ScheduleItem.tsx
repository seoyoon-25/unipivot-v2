import Link from 'next/link'
import { MapPin, BookOpen, Wifi, ArrowRight } from 'lucide-react'

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
    <Link
      href={`/programs/${program.slug}`}
      className="group flex items-center gap-4 md:gap-6 p-5 md:p-6 rounded-2xl bg-white border border-stone-100 hover:border-teal-200 shadow-sm hover:shadow-xl hover:shadow-teal-100/30 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Time Column */}
      <div className="flex-shrink-0 w-16 md:w-20 text-center">
        {startTime && (
          <p className="text-lg md:text-xl font-bold bg-gradient-to-br from-teal-600 to-teal-700 bg-clip-text text-transparent">
            {startTime}
          </p>
        )}
        {endTime && (
          <p className="text-[11px] text-stone-400 mt-0.5 font-medium">~{endTime}</p>
        )}
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 w-px h-14 bg-gradient-to-b from-transparent via-teal-200 to-transparent group-hover:via-teal-400 transition-colors duration-300" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
            {sessionNo}회차
          </span>
          {isOnline && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
              <Wifi className="w-3 h-3" />
              온라인
            </span>
          )}
        </div>
        <h4 className="text-base font-semibold text-stone-800 truncate group-hover:text-teal-700 transition-colors duration-200">
          {program.title}
        </h4>
        <div className="flex items-center gap-3 mt-2">
          {location && !isOnline && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {location}
            </span>
          )}
          {bookTitle && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              <span className="truncate max-w-[120px]">{bookTitle}</span>
            </span>
          )}
        </div>
      </div>

      {/* Join Button */}
      <div className="flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-teal-500/25 group-hover:shadow-xl group-hover:shadow-teal-500/40 group-hover:-translate-y-0.5 transition-all duration-300">
          참가
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
