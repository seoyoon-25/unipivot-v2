import { prisma } from '@/lib/db'
import CalendarManager from './CalendarManager'

async function getEvents(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const events = await prisma.calendarEvent.findMany({
    where: {
      startDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      project: {
        select: { id: true, title: true },
      },
    },
    orderBy: { startDate: 'asc' },
  })

  const projects = await prisma.project.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return { events, projects }
}

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function AdminBusinessCalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year || now.getFullYear().toString())
  const month = parseInt(params.month || (now.getMonth() + 1).toString())

  const { events, projects } = await getEvents(year, month)

  return (
    <CalendarManager
      events={events}
      projects={projects}
      year={year}
      month={month}
    />
  )
}
