import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { getAdminProgramReports, getReportStatusCounts } from '@/lib/actions/review'
import ReportsList from './ReportsList'

interface ReportManagementPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    status?: string
    sessionId?: string
    page?: string
  }>
}

async function ReportsContent({
  programId,
  status,
  sessionId,
  page,
}: {
  programId: string
  status?: string
  sessionId?: string
  page: number
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
        },
        orderBy: { sessionNo: 'asc' },
      },
    },
  })

  if (!program) {
    notFound()
  }

  // 독후감 목록 조회
  const result = await getAdminProgramReports(programId, {
    status,
    sessionId,
    page,
    limit: 20,
  })

  // 상태별 카운트
  const counts = await getReportStatusCounts(programId)
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)

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
          <h1 className="text-2xl font-bold text-gray-900">독후감 관리</h1>
          <p className="text-gray-600">{program.title}</p>
        </div>
      </div>

      {/* 상태별 탭 */}
      <div className="flex gap-2 flex-wrap">
        <Link href={`/admin/programs/${programId}/reports`}>
          <Button
            variant={!status ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            전체
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
              {totalCount}
            </span>
          </Button>
        </Link>
        <Link href={`/admin/programs/${programId}/reports?status=PUBLISHED`}>
          <Button
            variant={status === 'PUBLISHED' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            제출됨
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
              {counts.PUBLISHED || 0}
            </span>
          </Button>
        </Link>
        <Link href={`/admin/programs/${programId}/reports?status=APPROVED`}>
          <Button
            variant={status === 'APPROVED' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            승인됨
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
              {counts.APPROVED || 0}
            </span>
          </Button>
        </Link>
        <Link href={`/admin/programs/${programId}/reports?status=REVISION_REQUESTED`}>
          <Button
            variant={status === 'REVISION_REQUESTED' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            수정 요청
            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs">
              {counts.REVISION_REQUESTED || 0}
            </span>
          </Button>
        </Link>
        <Link href={`/admin/programs/${programId}/reports?status=REJECTED`}>
          <Button
            variant={status === 'REJECTED' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <XCircle className="w-4 h-4" />
            반려됨
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
              {counts.REJECTED || 0}
            </span>
          </Button>
        </Link>
      </div>

      {/* 세션 필터 */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-gray-500 self-center">회차:</span>
        <Link
          href={`/admin/programs/${programId}/reports${status ? `?status=${status}` : ''}`}
        >
          <Button variant={!sessionId ? 'secondary' : 'ghost'} size="sm">
            전체
          </Button>
        </Link>
        {program.sessions.map((session) => (
          <Link
            key={session.id}
            href={`/admin/programs/${programId}/reports?${status ? `status=${status}&` : ''}sessionId=${session.id}`}
          >
            <Button
              variant={sessionId === session.id ? 'secondary' : 'ghost'}
              size="sm"
            >
              {session.sessionNo}회차
            </Button>
          </Link>
        ))}
      </div>

      {/* 독후감 목록 */}
      <ReportsList
        reports={result.reports}
        programId={programId}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  )
}

export default async function ReportManagementPage({
  params,
  searchParams,
}: ReportManagementPageProps) {
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
        <ReportsContent
          programId={resolvedParams.id}
          status={resolvedSearchParams.status}
          sessionId={resolvedSearchParams.sessionId}
          page={parseInt(resolvedSearchParams.page || '1')}
        />
      </Suspense>
    </div>
  )
}
