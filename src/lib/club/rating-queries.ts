import prisma from '@/lib/db'

/**
 * 책별 평균 평점 조회
 */
export async function getBookRating(bookTitle: string) {
  const result = await prisma.bookReport.aggregate({
    where: {
      bookTitle,
      rating: { not: null },
    },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return {
    avgRating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : null,
    ratingCount: result._count.rating,
  }
}

/**
 * 평점 높은 책 목록 (최소 2개 이상 평점이 있는 책)
 */
export async function getTopRatedBooks(limit = 20) {
  const books = await prisma.bookReport.groupBy({
    by: ['bookTitle', 'bookAuthor'],
    _avg: { rating: true },
    _count: { rating: true },
    where: { rating: { not: null } },
    having: { rating: { _count: { gte: 2 } } },
    orderBy: { _avg: { rating: 'desc' } },
    take: limit,
  })

  return books.map((b) => ({
    bookTitle: b.bookTitle,
    bookAuthor: b.bookAuthor,
    avgRating: b._avg.rating ? Math.round(b._avg.rating * 10) / 10 : 0,
    ratingCount: b._count.rating,
  }))
}

/**
 * 사용자의 평점 목록 (Member.id 기반)
 */
export async function getUserRatings(userId: string) {
  const member = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  })

  if (!member) return []

  return prisma.bookReport.findMany({
    where: {
      authorId: member.id,
      rating: { not: null },
    },
    select: {
      id: true,
      bookTitle: true,
      bookAuthor: true,
      rating: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}
