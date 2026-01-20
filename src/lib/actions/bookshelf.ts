'use server'

import { prisma } from '@/lib/db'

// 책장 도서 목록 조회
export async function getBookshelfBooks(options?: {
  season?: string
  category?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { season, category, search, page = 1, limit = 24 } = options || {}

  const where: any = {}

  if (season) {
    where.season = season
  }

  if (category) {
    where.category = category
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [books, total] = await Promise.all([
    prisma.readBook.findMany({
      where,
      orderBy: [
        { season: 'desc' },
        { title: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.readBook.count({ where })
  ])

  return {
    books,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  }
}

// 시즌 목록 조회
export async function getSeasons() {
  const seasons = await prisma.readBook.findMany({
    select: { season: true },
    distinct: ['season'],
    orderBy: { season: 'desc' }
  })

  return seasons.map(s => s.season)
}

// 카테고리 목록 조회
export async function getCategories() {
  const categories = await prisma.readBook.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } },
    orderBy: { category: 'asc' }
  })

  return categories.map(c => c.category).filter(Boolean) as string[]
}

// 책 상세 조회
export async function getBookById(id: string) {
  return prisma.readBook.findUnique({
    where: { id },
    include: {
      bookReports: {
        where: {
          visibility: 'PUBLIC',
          status: 'APPROVED'
        },
        include: {
          author: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

// 통계
export async function getBookshelfStats() {
  const [totalBooks, seasons, categories, reportsCount] = await Promise.all([
    prisma.readBook.count(),
    prisma.readBook.findMany({
      select: { season: true },
      distinct: ['season']
    }),
    prisma.readBook.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } }
    }),
    prisma.bookReport.count({
      where: {
        visibility: 'PUBLIC',
        status: 'APPROVED'
      }
    })
  ])

  return {
    totalBooks,
    totalSeasons: seasons.length,
    totalCategories: categories.length,
    totalReports: reportsCount
  }
}
