'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import {
  generateGoogleCalendarUrl,
  generateICalEvent,
  type CalendarEvent,
} from '@/lib/google-calendar'

interface Props {
  event: CalendarEvent
}

export default function AddToCalendarButton({ event }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(event), '_blank')
    setIsOpen(false)
  }

  const handleICalDownload = () => {
    const icalContent = generateICalEvent(event)
    const blob = new Blob([icalContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title}.ics`
    link.click()

    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
      >
        <Calendar className="w-4 h-4" />
        캘린더에 추가
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
            <button
              onClick={handleGoogleCalendar}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
            >
              Google Calendar
            </button>
            <button
              onClick={handleICalDownload}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
            >
              Apple Calendar / Outlook
            </button>
          </div>
        </>
      )}
    </div>
  )
}
