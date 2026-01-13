'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react'
import EventFormModal from './EventFormModal'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date | null
  allDay: boolean
  location: string | null
  type: string | null
  projectId: string | null
  project: { id: string; title: string } | null
}

interface Project {
  id: string
  title: string
}

interface Props {
  events: CalendarEvent[]
  projects: Project[]
  year: number
  month: number
}

const typeColors: Record<string, string> = {
  MEETING: 'bg-blue-500',
  DEADLINE: 'bg-red-500',
  EVENT: 'bg-green-500',
  OTHER: 'bg-gray-500',
}

const typeLabels: Record<string, string> = {
  MEETING: '회의',
  DEADLINE: '마감',
  EVENT: '행사',
  OTHER: '기타',
}

export default function CalendarManager({ events, projects, year, month }: Props) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  const navigateMonth = (delta: number) => {
    let newMonth = month + delta
    let newYear = year
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    router.push(`/admin/business/calendar?year=${newYear}&month=${newMonth}`)
  }

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month - 1, i))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingEvent(event)
    setSelectedDate(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('이 일정을 삭제하시겠습니까?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/calendar/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreate = () => {
    setEditingEvent(null)
    setSelectedDate(new Date())
    setIsModalOpen(true)
  }

  const days = getDaysInMonth()
  const today = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
            <p className="text-gray-500">사업 일정 및 이벤트</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 일정
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {year}년 {monthNames[month - 1]}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map((day, i) => (
            <div
              key={day}
              className={`py-3 text-center text-sm font-medium ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-32 border-r border-b border-gray-100 bg-gray-50" />
            }

            const dayEvents = getEventsForDate(date)
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            const dayOfWeek = date.getDay()

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`h-32 border-r border-b border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? 'w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center'
                        : dayOfWeek === 0
                        ? 'text-red-500'
                        : dayOfWeek === 6
                        ? 'text-blue-500'
                        : 'text-gray-900'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className="group flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate hover:bg-gray-200 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          typeColors[event.type || 'OTHER']
                        }`}
                      />
                      <span className="truncate">{event.title}</span>
                      <button
                        onClick={(e) => handleDelete(event.id, e)}
                        disabled={deletingId === event.id}
                        className="hidden group-hover:block ml-auto text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3}개 더</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${typeColors[type]}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEvent(null)
          setSelectedDate(null)
        }}
        event={editingEvent}
        projects={projects}
        defaultDate={selectedDate}
      />
    </div>
  )
}
