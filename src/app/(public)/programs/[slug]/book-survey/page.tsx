import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BookSurveyForm } from './BookSurveyForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const program = await prisma.program.findUnique({
    where: { slug },
    select: { title: true },
  })

  return {
    title: program ? `${program.title} 책 수령 조사` : '책 수령 조사',
  }
}

export default async function BookSurveyPage({ params }: PageProps) {
  const { slug } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/programs/${slug}/book-survey`)
  }

  const program = await prisma.program.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      type: true,
    },
  })

  if (!program) {
    notFound()
  }

  // Check if user has accepted application
  const application = await prisma.programApplication.findFirst({
    where: {
      programId: program.id,
      userId: session.user.id,
      status: { in: ['ACCEPTED', 'ADDITIONAL'] },
    },
    select: {
      id: true,
      bookReceiveType: true,
      ebookProvider: true,
      ebookProviderOther: true,
      bookSurveyCompletedAt: true,
    },
  })

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600 mb-6">
            이 프로그램에 합격한 참가자만 책 수령 조사에 응할 수 있습니다.
          </p>
          <a
            href={`/programs/${slug}`}
            className="text-primary hover:underline"
          >
            프로그램 페이지로 이동
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-primary to-primary-dark">
            <h1 className="text-xl font-bold text-white">{program.title}</h1>
            <p className="text-white/80 mt-1">책 수령 방식 조사</p>
          </div>
          <div className="p-6">
            {application.bookSurveyCompletedAt ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  응답 완료!
                </h2>
                <p className="text-gray-600 mb-4">
                  책 수령 방식:{' '}
                  {application.bookReceiveType === 'PAPER'
                    ? '종이책 (교보문고)'
                    : application.bookReceiveType === 'EBOOK'
                    ? `ebook (${
                        application.ebookProvider === 'OTHER'
                          ? application.ebookProviderOther
                          : application.ebookProvider
                      })`
                    : '이미 보유'}
                </p>
                <p className="text-sm text-gray-500">
                  수정이 필요하시면 아래에서 다시 응답해 주세요.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-600">
                  독서모임 진행을 위해 책을 보내드리려고 합니다.
                  <br />
                  아래에서 원하시는 책 수령 방식을 선택해 주세요.
                </p>
              </div>
            )}
            <BookSurveyForm
              programId={program.id}
              initialData={{
                bookReceiveType: application.bookReceiveType,
                ebookProvider: application.ebookProvider,
                ebookProviderOther: application.ebookProviderOther,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
