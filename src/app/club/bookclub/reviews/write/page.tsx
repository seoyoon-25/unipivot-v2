import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMyProgramsForReview, getSessionForReview } from '@/lib/club/review-queries'
import ReviewEditor from '@/components/club/bookclub/ReviewEditor'
import WritePageClient from './WritePageClient'

export const metadata = {
  title: '소감 작성 | 유니클럽',
}

interface PageProps {
  searchParams: Promise<{ programId?: string; sessionId?: string; edit?: string }>
}

export default async function ReviewWritePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login?callbackUrl=/club/bookclub/reviews/write')
  }

  const params = await searchParams
  const programs = await getMyProgramsForReview()

  // If sessionId is provided, go directly to editor
  if (params.sessionId) {
    const sessionData = await getSessionForReview(params.sessionId)
    if (!sessionData) {
      redirect('/club/bookclub/reviews')
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {sessionData.existingReview ? '소감 수정' : '소감 작성'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {sessionData.program.title} · {sessionData.session.sessionNo}회차
        </p>
        <ReviewEditor
          programId={sessionData.program.id}
          sessionId={sessionData.session.id}
          bookTitle={sessionData.session.bookTitle || '책 제목 없음'}
          bookAuthor={sessionData.session.bookAuthor}
          existingReview={sessionData.existingReview}
        />
      </div>
    )
  }

  // Otherwise, show program/session selector
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">소감 작성</h1>
      <p className="text-sm text-gray-500 mb-6">프로그램과 회차를 선택해주세요</p>
      <WritePageClient programs={programs} />
    </div>
  )
}
