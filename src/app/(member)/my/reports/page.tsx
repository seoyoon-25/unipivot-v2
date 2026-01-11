import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Book, Calendar, Eye, Edit, Plus, Lock, Globe } from 'lucide-react'
import { getUserBookReports } from '@/lib/actions/public'

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const reports = await getUserBookReports()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">독서 기록</h1>
        <Link
          href="/my/reports/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 기록 작성
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">아직 작성한 독서 기록이 없습니다</h3>
          <p className="text-gray-500 mb-6">독서모임에서 읽은 책에 대한 생각을 기록해보세요!</p>
          <Link
            href="/my/reports/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            첫 기록 작성하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/my/reports/${report.id}`}
              className="block bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{report.title}</h3>
                    {report.isPublic ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                        <Globe className="w-3 h-3" />
                        공개
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        <Lock className="w-3 h-3" />
                        비공개
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    {report.book.title} · {report.book.author}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {report.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 포인트 안내 */}
      <div className="mt-8 p-4 bg-primary-light rounded-xl">
        <p className="text-primary text-sm">
          <strong>TIP:</strong> 독서 기록을 작성하면 200 포인트가 적립됩니다!
        </p>
      </div>
    </div>
  )
}
