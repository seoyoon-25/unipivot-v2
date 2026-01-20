import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, Star, Book } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReportInteractions from './ReportInteractions'

interface Props {
  params: { id: string }
}

export default async function PublicReportDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  // 조회수 증가
  await prisma.bookReport.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {})

  const report = await prisma.bookReport.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { id: true, name: true, memberCode: true }
      },
      book: {
        select: { id: true, title: true, author: true, image: true, season: true }
      },
      program: {
        select: { id: true, title: true, slug: true }
      },
      session: {
        select: { id: true, sessionNo: true }
      },
      likes: {
        include: {
          member: {
            select: { id: true, name: true }
          }
        }
      },
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: { id: true, name: true }
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!report) {
    notFound()
  }

  // 공개되지 않은 글은 접근 불가
  if (report.visibility !== 'PUBLIC' || report.status !== 'APPROVED') {
    // 본인 글이면 허용
    let isAuthor = false
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { member: true }
      })
      if (user?.member?.id === report.authorId) {
        isAuthor = true
      }
    }
    if (!isAuthor) {
      notFound()
    }
  }

  // 현재 로그인한 사용자의 Member ID
  let currentMemberId: string | null = null
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { member: true }
    })
    currentMemberId = user?.member?.id || null
  }

  const isLiked = currentMemberId
    ? report.likes.some(like => like.memberId === currentMemberId)
    : false

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Link */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            독후감 목록
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Book Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-start gap-6">
            {report.book?.image ? (
              <img
                src={report.book.image}
                alt={report.book.title}
                className="w-24 h-36 object-cover rounded-xl shadow-md"
              />
            ) : (
              <div className="w-24 h-36 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <Book className="w-8 h-8 text-primary/40" />
              </div>
            )}
            <div>
              <p className="text-sm text-primary font-medium mb-1">
                {report.book?.season || '독서 기록'}
              </p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {report.book?.title || report.bookTitle}
              </h2>
              <p className="text-gray-500">{report.book?.author || report.bookAuthor || '작자 미상'}</p>
              {report.program && (
                <Link
                  href={`/programs/${report.program.slug}`}
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  {report.program.title} {report.session && `(${report.session.sessionNo}회차)`}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{report.title}</h1>

            {/* Rating */}
            {report.rating && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">별점:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < report.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Author & Date */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                  {report.author.name?.[0] || '?'}
                </div>
                <span>{report.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(report.publishedAt || report.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {report.viewCount}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none whitespace-pre-wrap">
              {report.content}
            </div>
          </div>

          {/* Interactions */}
          <ReportInteractions
            reportId={report.id}
            likes={report.likes}
            comments={report.comments}
            isLiked={isLiked}
            currentMemberId={currentMemberId}
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>
    </div>
  )
}
