import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getBookReport } from '@/lib/actions/public'
import ReportDetail from './ReportDetail'

interface Props {
  params: { id: string }
}

export default async function ReportDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const report = await getBookReport(params.id)

  if (!report) {
    notFound()
  }

  // 본인 기록만 접근 가능
  if (report.userId !== session.user.id) {
    redirect('/my/reports')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">독서 기록</h1>
      <ReportDetail report={report} />
    </div>
  )
}
