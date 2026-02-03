import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { getStructuredReviewDetail } from '@/lib/actions/review'
import { getStructureInfo, isValidStructureCode } from '@/types/report'
import type { ReportStructureCode } from '@/types/report'
import { BookReviewJsonLd } from '@/components/seo/JsonLd'
import ReviewDetailClient from './ReviewDetailClient'

interface PageProps {
  params: Promise<{ reviewId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reviewId } = await params
  const review = await prisma.bookReport.findUnique({
    where: { id: reviewId },
    select: {
      title: true,
      bookTitle: true,
      bookAuthor: true,
      content: true,
      author: { select: { name: true } },
      createdAt: true,
    },
  })

  if (!review) {
    return { title: '소감을 찾을 수 없습니다' }
  }

  const description = review.content.replace(/<[^>]*>/g, '').slice(0, 160)
  const title = review.title || `${review.bookTitle} - 소감`

  return {
    title: `${title} | 유니클럽`,
    description,
    openGraph: {
      title: `${review.bookTitle} 소감`,
      description,
      type: 'article',
      authors: [review.author.name || '익명'],
      publishedTime: review.createdAt.toISOString(),
    },
    twitter: {
      card: 'summary',
      title: `${review.bookTitle} 소감`,
      description,
    },
  }
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { reviewId } = await params
  const review = await getStructuredReviewDetail(reviewId)

  if (!review) {
    notFound()
  }

  const structureInfo =
    review.structuredData?.structure && isValidStructureCode(review.structuredData.structure)
      ? getStructureInfo(review.structuredData.structure as ReportStructureCode)
      : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <BookReviewJsonLd
        review={{
          id: review.id,
          bookTitle: review.bookTitle,
          bookAuthor: review.bookAuthor,
          content: review.content,
          rating: review.rating,
          createdAt: review.createdAt.toISOString(),
          authorName: review.user.name,
        }}
      />
      <ReviewDetailClient
        review={{
          id: review.id,
          title: review.title,
          content: review.content,
          bookTitle: review.bookTitle,
          bookAuthor: review.bookAuthor,
          visibility: review.visibility,
          status: review.status,
          rating: review.rating,
          likeCount: review.likeCount,
          viewCount: review.viewCount,
          createdAt: review.createdAt.toISOString(),
          user: review.user,
          session: review.session
            ? {
                sessionNo: review.session.sessionNo,
                title: review.session.title,
                date: review.session.date?.toISOString() || null,
              }
            : null,
          program: review.program,
          comments: review.comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt.toISOString(),
            author: { id: c.author.id, name: c.author.name },
          })),
          hasLiked: review.hasLiked,
          isOwner: review.isOwner,
          structuredData: review.structuredData,
          structureInfo: structureInfo
            ? { name: structureInfo.name, icon: structureInfo.icon, color: structureInfo.color }
            : null,
          likeCountFromRelation: review._count.likes,
        }}
      />
    </div>
  )
}
