import { MetadataRoute } from 'next'
import prisma from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bestcome.org'

  // 정적 페이지
  const staticPages = [
    '',
    '/club',
    '/club/bookclub',
    '/club/bookclub/reviews',
    '/club/bookclub/quotes',
    '/club/community',
    '/club/help',
    '/club/help/faq',
    '/programs',
    '/about',
    '/history',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  // 동적 페이지 - 공개 독후감
  const reviews = await prisma.bookReport.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 1000,
  })

  const reviewPages = reviews.map((review) => ({
    url: `${baseUrl}/club/bookclub/reviews/${review.id}`,
    lastModified: review.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // 동적 페이지 - 프로그램 (slug 기반)
  const programs = await prisma.program.findMany({
    where: { status: { in: ['RECRUITING', 'ONGOING', 'COMPLETED'] } },
    select: { slug: true, updatedAt: true },
  })

  const programPages = programs.map((program) => ({
    url: `${baseUrl}/programs/${program.slug}`,
    lastModified: program.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // 동적 페이지 - 공지사항
  const notices = await prisma.notice.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  })

  const noticePages = notices.map((notice) => ({
    url: `${baseUrl}/notice/${notice.id}`,
    lastModified: notice.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...reviewPages, ...programPages, ...noticePages]
}
