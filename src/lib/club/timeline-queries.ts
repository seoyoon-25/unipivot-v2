import prisma from '@/lib/db'

export type TimelineItemType = 'attendance' | 'report' | 'quote'

export interface TimelineItem {
  id: string
  type: TimelineItemType
  title: string
  description?: string
  link?: string
  createdAt: Date
}

export async function getTimeline(
  userId: string,
  options: {
    type?: TimelineItemType | 'all'
    cursor?: string
    limit?: number
  } = {}
): Promise<{ items: TimelineItem[]; nextCursor: string | null }> {
  const { type = 'all', cursor, limit = 20 } = options
  const cursorDate = cursor ? new Date(cursor) : undefined

  const items: TimelineItem[] = []

  if (type === 'all' || type === 'attendance') {
    const attendances = await prisma.programAttendance.findMany({
      where: {
        participant: { userId },
        status: { in: ['PRESENT', 'LATE'] },
        ...(cursorDate && { session: { date: { lt: cursorDate } } }),
      },
      include: {
        session: {
          select: {
            sessionNo: true,
            date: true,
            program: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { session: { date: 'desc' } },
      take: limit + 1,
    })

    items.push(
      ...attendances.map((a) => ({
        id: `attendance-${a.id}`,
        type: 'attendance' as const,
        title: `${a.session.program.title} ${a.session.sessionNo}회차 출석`,
        link: `/club/programs/${a.session.program.id}`,
        createdAt: a.session.date,
      }))
    )
  }

  if (type === 'all' || type === 'report') {
    const reports = await prisma.bookReport.findMany({
      where: {
        authorId: userId,
        ...(cursorDate && { createdAt: { lt: cursorDate } }),
      },
      select: {
        id: true,
        bookTitle: true,
        bookAuthor: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    })

    items.push(
      ...reports.map((r) => ({
        id: `report-${r.id}`,
        type: 'report' as const,
        title: `"${r.bookTitle}" 독후감 작성`,
        description: r.bookAuthor ? `저자: ${r.bookAuthor}` : undefined,
        link: `/club/bookclub/reviews/${r.id}`,
        createdAt: r.createdAt,
      }))
    )
  }

  if (type === 'all' || type === 'quote') {
    const quotes = await prisma.quote.findMany({
      where: {
        userId,
        ...(cursorDate && { createdAt: { lt: cursorDate } }),
      },
      select: {
        id: true,
        bookTitle: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    })

    items.push(
      ...quotes.map((q) => ({
        id: `quote-${q.id}`,
        type: 'quote' as const,
        title: `"${q.bookTitle}" 명문장 등록`,
        description: q.content.length > 50 ? q.content.slice(0, 50) + '...' : q.content,
        link: '/club/bookclub/quotes',
        createdAt: q.createdAt,
      }))
    )
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const limitedItems = items.slice(0, limit + 1)

  const hasMore = limitedItems.length > limit
  if (hasMore) limitedItems.pop()

  const nextCursor =
    hasMore && limitedItems.length > 0
      ? limitedItems[limitedItems.length - 1].createdAt.toISOString()
      : null

  return { items: limitedItems, nextCursor }
}
