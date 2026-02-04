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
    <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-2xl">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, today)
        const hasSession = sessionDates?.has(toKey(day))
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className={`relative flex flex-col items-center justify-center w-12 h-16 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : isToday
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-zinc-600 hover:bg-white/80'
            }`}
          >
            <span className={`text-[10px] font-medium leading-none mb-1 ${
              isSelected ? 'text-blue-100' : isToday ? 'text-blue-500' : 'text-zinc-400'
            }`}>
              {isToday ? '오늘' : DAY_LABELS[day.getDay()]}
            </span>
            <span className={`text-sm font-bold ${isSelected ? '' : ''}`}>
              {day.getDate()}
            </span>
            {/* Session dot */}
            {hasSession && !isSelected && (
              <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-500" />
            )}
          </button>
        )
      })}
    </div>
  )
}
