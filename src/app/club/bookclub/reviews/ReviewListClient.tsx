'use client'

import { useState } from 'react'
import ReviewCard from '@/components/club/bookclub/ReviewCard'

interface ReviewItem {
  id: string
  title: string
  content: string
  bookTitle: string
  bookAuthor?: string | null
  visibility: string
  status: string
  likeCount: number
  createdAt: Date
  author?: { id: string; name: string | null }
  session?: { id: string; sessionNo: number; title: string | null; bookTitle?: string | null } | null
  program?: { id: string; title: string } | null
  hasStructuredData?: boolean
  structureCode?: string | null
  commentCount: number
  isOwner?: boolean
}

interface ReviewListClientProps {
  publicReviews: ReviewItem[]
  myReviews: ReviewItem[]
  isLoggedIn: boolean
}

export default function ReviewListClient({
  publicReviews,
  myReviews,
  isLoggedIn,
}: ReviewListClientProps) {
  const [tab, setTab] = useState<'public' | 'my'>(isLoggedIn && myReviews.length > 0 ? 'my' : 'public')

  return (
    <div>
      {/* Tabs */}
      {isLoggedIn && (
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setTab('public')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
              tab === 'public'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            전체 소감 ({publicReviews.length})
          </button>
          <button
            onClick={() => setTab('my')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
              tab === 'my'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            내 소감 ({myReviews.length})
          </button>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-3">
        {tab === 'public' ? (
          publicReviews.length > 0 ? (
            publicReviews.map((review) => (
              <ReviewCard key={review.id} review={review} showAuthor />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              아직 공개된 소감이 없습니다
            </div>
          )
        ) : myReviews.length > 0 ? (
          myReviews.map((review) => (
            <ReviewCard key={review.id} review={review} showAuthor={false} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            아직 작성한 소감이 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
