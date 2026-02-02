import { notFound } from 'next/navigation'
import { getStructuredReviewDetail } from '@/lib/actions/review'
import { getStructureInfo, isValidStructureCode } from '@/types/report'
import type { ReportStructureCode } from '@/types/report'
import ReviewDetailClient from './ReviewDetailClient'

export const metadata = {
  title: '소감 상세 | 유니클럽',
}

interface PageProps {
  params: Promise<{ reviewId: string }>
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
