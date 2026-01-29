import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { PenSquare } from 'lucide-react'
import { getPublicReviews, getMyAllReviews, getMyProgramsForReview } from '@/lib/club/review-queries'
import ReviewCard from '@/components/club/bookclub/ReviewCard'
import ReviewListClient from './ReviewListClient'

export const metadata = {
  title: '소감나눔 | 유니클럽',
}

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)

  const [publicReviews, myReviews, myPrograms] = await Promise.all([
    getPublicReviews({ limit: 20 }),
    session?.user ? getMyAllReviews() : Promise.resolve([]),
    session?.user ? getMyProgramsForReview() : Promise.resolve([]),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">소감나눔</h1>
          <p className="text-sm text-gray-500 mt-1">
            독서 모임의 감상과 생각을 나눠보세요
          </p>
        </div>
        {session?.user && myPrograms.length > 0 && (
          <Link
            href="/club/bookclub/reviews/write"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <PenSquare className="w-4 h-4" />
            작성하기
          </Link>
        )}
      </div>

      <ReviewListClient
        publicReviews={publicReviews}
        myReviews={myReviews}
        isLoggedIn={!!session?.user}
      />
    </div>
  )
}
