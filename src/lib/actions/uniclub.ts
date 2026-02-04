'use server'

import { prisma } from '@/lib/db'

export async function getRecommendedBooks() {
  try {
    const books = await prisma.readBook.findMany({
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: 10,
      select: {
        id: true,
        title: true,
        author: true,
        image: true,
        rating: true,
        category: true,
        season: true,
        _count: {
          select: { bookReports: true },
        },
      },
    })
    return books
  } catch (error) {
    console.error('[uniclub] getRecommendedBooks error:', error)
    return []
  }
}

export async function getUpcomingSessions() {
  try {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const sessions = await prisma.programSession.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd },
        status: 'SCHEDULED',
        program: {
          status: { in: ['ONGOING', 'RECRUITING'] },
        },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        location: true,
        sessionNo: true,
        bookTitle: true,
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            type: true,
          },
        },
      },
    })
    return sessions
  } catch (error) {
    console.error('[uniclub] getUpcomingSessions error:', error)
    return []
  }
}

export async function getEventPrograms() {
  try {
    const programs = await prisma.program.findMany({
      where: {
        status: { in: ['RECRUITING', 'ONGOING'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        description: true,
        image: true,
        status: true,
        startDate: true,
        endDate: true,
        recruitEndDate: true,
        location: true,
        isOnline: true,
        fee: true,
        feeType: true,
        _count: {
          select: { applications: true, likes: true },
        },
      },
    })
    return programs
  } catch (error) {
    console.error('[uniclub] getEventPrograms error:', error)
    return []
  }
}
