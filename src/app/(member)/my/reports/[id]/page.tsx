import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getBookReport } from '@/lib/actions/public'
import { prisma } from '@/lib/db'
import ReportDetail from './ReportDetail'

interface Props {
  params: { id: string }
}

export default async function ReportDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [report, user] = await Promise.all([
    getBookReport(params.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { member: true }
    })
  ])

  if (!report) {
    notFound()
  }

  // 본인 기록만 접근 가능 (authorId는 Member ID)
  if (!user?.member || report.authorId !== user.member.id) {
    redirect('/my/reports')
  }

  // ReportDetail에 전달할 형식으로 변환
  const reportForDetail = {
    ...report,
    book: report.book || { id: '', title: report.bookTitle, author: report.bookAuthor }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">독서 기록</h1>
      <ReportDetail report={reportForDetail as any} />
    </div>
  )
}
