import { prisma } from '@/lib/db';

export interface BookFilter {
  season?: string;
  year?: number;
  search?: string;
}

/**
 * 전체 책장 조회 (ReadBook 모델 기반)
 */
export async function getAllBooks(filter?: BookFilter) {
  const where: any = {};

  if (filter?.season) {
    where.season = filter.season;
  }

  if (filter?.year) {
    where.createdAt = {
      gte: new Date(`${filter.year}-01-01`),
      lt: new Date(`${filter.year + 1}-01-01`),
    };
  }

  if (filter?.search) {
    where.OR = [
      { title: { contains: filter.search, mode: 'insensitive' } },
      { author: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const books = await prisma.readBook.findMany({
    where,
    include: {
      _count: {
        select: { bookReports: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    image: book.image,
    season: book.season,
    category: book.category,
    reportCount: book._count.bookReports,
  }));
}

/**
 * 책 상세 정보 조회
 */
export async function getBookDetail(bookId: string) {
  const book = await prisma.readBook.findUnique({
    where: { id: bookId },
    include: {
      bookReports: {
        where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: { bookReports: true },
      },
    },
  });

  return book;
}

/**
 * 필터용 시즌 목록 조회
 */
export async function getBookSeasons() {
  const books = await prisma.readBook.findMany({
    select: { season: true },
    distinct: ['season'],
    orderBy: { createdAt: 'desc' },
  });

  return books.map((b) => b.season);
}

/**
 * 필터용 연도 목록 조회
 */
export async function getBookYears() {
  const books = await prisma.readBook.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const years = Array.from(new Set(
    books.map((b) => new Date(b.createdAt).getFullYear())
  )).sort((a, b) => b - a);

  return years;
}
