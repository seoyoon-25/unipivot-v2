'use client'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface WeekDatePickerProps {
  selectedDate: Date
  onSelect: (date: Date) => void
  sessionDates?: Set<string>
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

export default function WeekDatePicker({
  selectedDate,
  onSelect,
  sessionDates,
}: WeekDatePickerProps) {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  return (
    <div className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/30">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, today)
        const hasSession = sessionDates?.has(toKey(day))
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className={`relative flex flex-col items-center justify-center w-12 md:w-14 h-16 md:h-[72px] rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isSelected
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                : isToday
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className={`text-[10px] font-medium leading-none mb-1.5 ${
              isSelected ? 'text-indigo-100' : isToday ? 'text-indigo-500' : 'text-stone-400'
            }`}>
              {isToday ? '오늘' : DAY_LABELS[day.getDay()]}
            </span>
            <span className={`text-base font-bold ${isSelected ? '' : ''}`}>
              {day.getDate()}
            </span>
            {/* Session dot */}
            {hasSession && !isSelected && (
              <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
            {hasSession && isSelected && (
              <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-white/80" />
            )}
          </button>
        )
      })}
    </div>
  )
}
