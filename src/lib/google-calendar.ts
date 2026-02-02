export interface CalendarEvent {
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate?: Date
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const startDate = formatDateForGoogle(event.startDate)
  const endDate = formatDateForGoogle(
    event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000)
  )

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    ...(event.description && { details: event.description }),
    ...(event.location && { location: event.location }),
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function formatDateForICal(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export function generateICalEvent(event: CalendarEvent): string {
  const startDate = formatDateForICal(event.startDate)
  const endDate = formatDateForICal(
    event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000)
  )

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniClub//NONSGML v1.0//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@uniclub`,
    `DTSTAMP:${formatDateForICal(new Date())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
  ]

  if (event.description) lines.push(`DESCRIPTION:${event.description}`)
  if (event.location) lines.push(`LOCATION:${event.location}`)

  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}
