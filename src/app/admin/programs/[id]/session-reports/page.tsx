import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  User,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

interface SessionReportsPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    sessionId?: string
  }>
}

async function SessionReportsContent({
  programId,
  sessionId,
}: {
  programId: string
  sessionId?: string
}) {
  // 프로그램 정보 조회
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      sessions: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          bookTitle: true,
        },
        orderBy: { sessionNo: 'asc' },
      },
    },
  })

  if (!program) {
    notFound()
  }

  // 세션별 독후감 통계 조회
  const sessionStats = await Promise.all(
    program.sessions.map(async (session) => {
      const [submitted, draft, total] = await Promise.all([
        prisma.sessionReport.count({
          where: { sessionId: session.id, status: 'SUBMITTED' },
        }),
        prisma.sessionReport.count({
          where: { sessionId: session.id, status: 'DRAFT' },
        }),
        prisma.programMembership.count({
          where: { programId, role: 'PARTICIPANT' },
        }),
      ])
      return {
        ...session,
        submitted,
        draft,
        total,
        notSubmitted: total - submitted - draft,
      }
    })
  )

  // 선택된 세션의 독후감 목록
  let reports: any[] = []
  let selectedSession = null

  if (sessionId) {
    selectedSession = program.sessions.find((s) => s.id === sessionId)

    reports = await prisma.sessionReport.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/admin/programs/${programId}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            프로그램으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">세션 독후감 현황</h1>
          <p className="text-gray-600">{program.title}</p>
        </div>
      </div>

      {/* 세션별 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessionStats.map((session) => (
          <Link
            key={session.id}
            href={`/admin/programs/${programId}/session-reports?sessionId=${session.id}`}
            className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
              sessionId === session.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-lg font-semibold text-gray-900">
                  {session.sessionNo}회차
                </span>
                {session.title && (
                  <p className="text-sm text-gray-500">{session.title}</p>
                )}
              </div>
              <span className="text-sm text-gray-400">
                {new Date(session.date).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {session.bookTitle && (
              <p className="text-sm text-gray-600 mb-3 truncate">
                {session.bookTitle}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">{session.submitted}</span>
                <span className="text-gray-400">제출</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 font-medium">{session.draft}</span>
                <span className="text-gray-400">작성중</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 font-medium">{session.notSubmitted}</span>
                <span className="text-gray-400">미제출</span>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${session.total > 0 ? (session.submitted / session.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {session.total > 0
                ? Math.round((session.submitted / session.total) * 100)
                : 0}
              % 완료
            </p>
          </Link>
        ))}
      </div>

      {/* 선택된 세션의 독후감 목록 */}
      {sessionId && selectedSession && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">
              {selectedSession.sessionNo}회차 독후감 목록
            </h2>
            <p className="text-sm text-gray-500">
              {reports.length}건의 독후감
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">아직 작성된 독후감이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y">
              {reports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.user.name || '이름 없음'}
                        </p>
                        <p className="text-sm text-gray-500">{report.user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {report.template && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {report.template.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(report.updatedAt).toLocaleString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          report.status === 'SUBMITTED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {report.status === 'SUBMITTED' ? '제출완료' : '임시저장'}
                      </span>
                      <SessionReportViewButton report={report} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 세션 미선택 시 안내 */}
      {!sessionId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="font-semibold text-blue-900 mb-2">회차를 선택하세요</h3>
          <p className="text-blue-700">
            위의 회차 카드를 클릭하면 해당 회차의 독후감 목록을 볼 수 있습니다.
          </p>
        </div>
      )}
    </div>
  )
}

// 독후감 상세 보기 버튼
function SessionReportViewButton({ report }: { report: any }) {
  const content = (() => {
    try {
      return JSON.parse(report.content)
    } catch {
      return {}
    }
  })()

  return (
    <details className="relative">
      <summary className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
        <Eye className="w-4 h-4 text-gray-500" />
      </summary>
      <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg p-4 z-10 max-h-96 overflow-y-auto">
        <h4 className="font-semibold text-gray-900 mb-3">독후감 내용</h4>
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase">{key}</p>
            <div className="mt-1 text-sm text-gray-700">
              {typeof value === 'string' ? (
                <p className="whitespace-pre-wrap">{value}</p>
              ) : typeof value === 'number' ? (
                <p>{value}점</p>
              ) : Array.isArray(value) ? (
                <ul className="list-disc list-inside">
                  {value.map((item, i) => (
                    <li key={i}>
                      {typeof item === 'string'
                        ? item
                        : typeof item === 'object'
                        ? `${item.question}: ${item.answer}`
                        : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{JSON.stringify(value)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </details>
  )
}

export default async function SessionReportsPage({
  params,
  searchParams,
}: SessionReportsPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return notFound()
  }

  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <SessionReportsContent
          programId={resolvedParams.id}
          sessionId={resolvedSearchParams.sessionId}
        />
      </Suspense>
    </div>
  )
}
