import prisma from '@/lib/db'
import { createCachedQuery, CacheTags } from '@/lib/cache'

interface SearchResult {
  type: 'program' | 'notice' | 'report' | 'quote'
  id: string
  title: string
  content: string | null
  link: string
  createdAt: Date
  meta?: Record<string, string>
}

async function _searchAll(
  query: string,
  options?: { limit?: number }
): Promise<{
  programs: SearchResult[]
  notices: SearchResult[]
  reports: SearchResult[]
  quotes: SearchResult[]
  totalCount: number
}> {
  const limit = options?.limit || 10

  if (!query.trim()) {
    return { programs: [], notices: [], reports: [], quotes: [], totalCount: 0 }
  }

  const searchTerm = query.trim()

  const [programs, notices, reports, quotes] = await Promise.all([
    // Search Programs
    prisma.program.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        createdAt: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

    // Search ClubNotices
    prisma.clubNotice.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

    // Search BookReports
    prisma.bookReport.findMany({
      where: {
        isPublic: true,
        status: 'PUBLISHED',
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { bookTitle: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        bookTitle: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

    // Search Quotes
    prisma.quote.findMany({
      where: {
        isPublic: true,
        OR: [
          { content: { contains: searchTerm, mode: 'insensitive' } },
          { bookTitle: { contains: searchTerm, mode: 'insensitive' } },
          { bookAuthor: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        content: true,
        bookTitle: true,
        bookAuthor: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ])

  const programResults: SearchResult[] = programs.map((p) => ({
    type: 'program' as const,
    id: p.id,
    title: p.title,
    content: p.description,
    link: `/club/programs/${p.slug}`,
    createdAt: p.createdAt,
    meta: { type: p.type },
  }))

  const noticeResults: SearchResult[] = notices.map((n) => ({
    type: 'notice' as const,
    id: n.id,
    title: n.title,
    content: n.content.replace(/<[^>]+>/g, '').slice(0, 200),
    link: `/club/notices/${n.id}`,
    createdAt: n.createdAt,
    meta: { author: n.author.name || '' },
  }))

  const reportResults: SearchResult[] = reports.map((r) => ({
    type: 'report' as const,
    id: r.id,
    title: r.title,
    content: r.content.replace(/<[^>]+>/g, '').slice(0, 200),
    link: `/club/bookclub/reviews/${r.id}`,
    createdAt: r.createdAt,
    meta: { bookTitle: r.bookTitle },
  }))

  const quoteResults: SearchResult[] = quotes.map((q) => ({
    type: 'quote' as const,
    id: q.id,
    title: q.bookTitle,
    content: q.content,
    link: `/club/bookclub/quotes`,
    createdAt: q.createdAt,
    meta: { author: q.bookAuthor || '' },
  }))

  return {
    programs: programResults,
    notices: noticeResults,
    reports: reportResults,
    quotes: quoteResults,
    totalCount:
      programResults.length + noticeResults.length + reportResults.length + quoteResults.length,
  }
}

export const searchAll = createCachedQuery(
  _searchAll,
  ['search', 'all'],
  { tags: [CacheTags.search], revalidate: 120 }
)
