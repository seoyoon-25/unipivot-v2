import { generateGoogleCalendarUrl, generateICalEvent } from '@/lib/google-calendar'

describe('generateGoogleCalendarUrl', () => {
  const baseEvent = {
    title: '독서모임',
    startDate: new Date('2026-02-10T14:00:00Z'),
  }

  it('generates a valid Google Calendar URL', () => {
    const url = generateGoogleCalendarUrl(baseEvent)
    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
  })

  it('includes event title', () => {
    const url = generateGoogleCalendarUrl(baseEvent)
    expect(url).toContain(encodeURIComponent('독서모임'))
  })

  it('includes start and end dates', () => {
    const url = generateGoogleCalendarUrl(baseEvent)
    expect(url).toContain('dates=')
    // Dates are formatted as YYYYMMDDTHHmmssZ
    expect(url).toContain('20260210T140000Z')
  })

  it('defaults end date to 2 hours after start', () => {
    const url = generateGoogleCalendarUrl(baseEvent)
    expect(url).toContain('20260210T160000Z')
  })

  it('uses custom end date when provided', () => {
    const url = generateGoogleCalendarUrl({
      ...baseEvent,
      endDate: new Date('2026-02-10T17:00:00Z'),
    })
    expect(url).toContain('20260210T170000Z')
  })

  it('includes description when provided', () => {
    const url = generateGoogleCalendarUrl({
      ...baseEvent,
      description: '이번 주 독서모임입니다',
    })
    expect(url).toContain('details=')
  })

  it('includes location when provided', () => {
    const url = generateGoogleCalendarUrl({
      ...baseEvent,
      location: '서울 강남구',
    })
    expect(url).toContain('location=')
  })
})

describe('generateICalEvent', () => {
  const baseEvent = {
    title: '독서모임',
    startDate: new Date('2026-02-10T14:00:00Z'),
  }

  it('generates valid iCal format', () => {
    const ical = generateICalEvent(baseEvent)
    expect(ical).toContain('BEGIN:VCALENDAR')
    expect(ical).toContain('END:VCALENDAR')
    expect(ical).toContain('BEGIN:VEVENT')
    expect(ical).toContain('END:VEVENT')
    expect(ical).toContain('VERSION:2.0')
  })

  it('includes SUMMARY with escaped text', () => {
    const ical = generateICalEvent({ ...baseEvent, title: 'Test; event, here' })
    expect(ical).toContain('SUMMARY:Test\\; event\\, here')
  })

  it('includes DTSTART and DTEND', () => {
    const ical = generateICalEvent(baseEvent)
    expect(ical).toContain('DTSTART:20260210T140000Z')
    expect(ical).toContain('DTEND:20260210T160000Z')
  })

  it('includes DESCRIPTION when provided', () => {
    const ical = generateICalEvent({
      ...baseEvent,
      description: 'Line1\nLine2',
    })
    expect(ical).toContain('DESCRIPTION:Line1\\nLine2')
  })

  it('includes LOCATION when provided', () => {
    const ical = generateICalEvent({
      ...baseEvent,
      location: '서울, 강남구',
    })
    expect(ical).toContain('LOCATION:서울\\, 강남구')
  })

  it('uses CRLF line endings', () => {
    const ical = generateICalEvent(baseEvent)
    expect(ical).toContain('\r\n')
  })

  it('escapes backslashes in text', () => {
    const ical = generateICalEvent({ ...baseEvent, title: 'test\\value' })
    expect(ical).toContain('SUMMARY:test\\\\value')
  })
})
