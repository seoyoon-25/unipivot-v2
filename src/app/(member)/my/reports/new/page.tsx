import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getBooks } from '@/lib/actions/public'
import ReportForm from './ReportForm'

export default async function NewReportPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const books = await getBooks()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">새 독서 기록</h1>
      <ReportForm books={books} />
    </div>
  )
}
