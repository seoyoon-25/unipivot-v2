import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Book, User, Eye, Heart, MessageSquare } from 'lucide-react'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReportInteraction from './ReportInteraction'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const report = await prisma.programReport.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      },
      program: {
        select: { id: true, title: true, slug: true }
      },
      session: {
        select: { sessionNo: true, title: true, date: true, bookTitle: true, bookRange: true }
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      likes: session?.user?.id ? {
        where: { userId: session.user.id }
      } : false
    }
  })

  if (!report) {
    notFound()
  }

  // Check access
  if (report.visibility === 'PARTICIPANTS' && report.userId !== session?.user?.id) {
    // Check if user is a participant
    if (session?.user?.id) {
      const participant = await prisma.programParticipant.findUnique({
        where: {
          programId_userId: {
            programId: report.programId,
            userId: session.user.id
          }
        }
      })
      if (!participant) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">이 독후감은 참가자만 볼 수 있습니다.</p>
              <Link href="/community/reports" className="text-primary hover:underline">
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        )
      }
    } else {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">이 독후감을 보려면 로그인이 필요합니다.</p>
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </div>
      )
    }
  }

  // Increment view count
  await prisma.programReport.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  })

  const hasLiked = report.likes && report.likes.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/community/reports"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          독후감 목록
        </Link>

        {/* Report */}
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href={`/programs/${report.program.slug}`} className="hover:text-primary">
                {report.program.title}
              </Link>
              <span>·</span>
              <span>{report.session.sessionNo}회차</span>
              {report.session.bookTitle && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    {report.session.bookTitle}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{report.title}</h1>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {report.user.image ? (
                    <img src={report.user.image} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{report.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {report.submittedAt && new Date(report.submittedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {report.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {report.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {report.commentCount}
                </span>
              </div>
            </div>
          </div>

          {/* Photo */}
          {report.photoUrl && (
            <div className="p-6 border-b border-gray-100">
              <img
                src={report.photoUrl}
                alt=""
                className="max-h-96 mx-auto rounded-xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div className="prose prose-gray max-w-none whitespace-pre-wrap">
              {report.content}
            </div>

            {report.question && (
              <div className="mt-8 p-4 bg-primary/5 rounded-xl">
                <p className="text-sm text-primary font-medium mb-1">나누고 싶은 질문</p>
                <p className="text-gray-700">{report.question}</p>
              </div>
            )}
          </div>

          {/* Interaction */}
          <ReportInteraction
            reportId={report.id}
            initialLikeCount={report.likeCount}
            initialHasLiked={hasLiked}
            isLoggedIn={!!session}
            comments={report.comments}
            currentUserId={session?.user?.id}
          />
        </article>
      </div>
    </div>
  )
}
