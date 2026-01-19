import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, FileText, Clock, Check, X, UserX, AlertCircle, Users } from 'lucide-react'
import { CancelApplicationButton } from './CancelApplicationButton'

export const metadata: Metadata = {
  title: '신청 내역 | 마이페이지',
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  PENDING: { label: '검토중', icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: '승인', icon: Check, className: 'bg-green-100 text-green-700' },
  REJECTED: { label: '거절', icon: X, className: 'bg-red-100 text-red-700' },
  WAITLIST: { label: '대기', icon: Users, className: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: '취소', icon: X, className: 'bg-gray-100 text-gray-700' },
  // Legacy status types
  ACCEPTED: { label: '합격', icon: Check, className: 'bg-green-100 text-green-700' },
  ADDITIONAL: { label: '추가합격', icon: Check, className: 'bg-blue-100 text-blue-700' },
  NO_CONTACT: { label: '연락안됨', icon: UserX, className: 'bg-gray-100 text-gray-700' },
}

export default async function MyApplicationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const applications = await prisma.programApplication.findMany({
    where: { userId: session.user.id },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          image: true,
          thumbnailSquare: true,
          feeType: true,
          feeAmount: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  })

  // Separate current and past applications
  const now = new Date()
  const currentApplications = applications.filter((app) => {
    const isOngoing = !app.program.endDate || new Date(app.program.endDate) >= now
    const isActive = ['PENDING', 'APPROVED', 'WAITLIST', 'ACCEPTED', 'ADDITIONAL'].includes(app.status)
    return isOngoing && isActive
  })

  const pastApplications = applications.filter((app) => {
    const isPast = app.program.endDate && new Date(app.program.endDate) < now
    const isClosed = ['REJECTED', 'CANCELLED', 'NO_CONTACT'].includes(app.status)
    return isPast || isClosed
  })

  const typeLabels: Record<string, string> = {
    BOOKCLUB: '독서모임',
    SEMINAR: '세미나',
    WORKSHOP: '워크숍',
    KMOVE: 'K-Move',
    OTHER: '기타',
  }

  const renderApplication = (app: typeof applications[number]) => {
    const config = statusConfig[app.status] || statusConfig.PENDING
    const StatusIcon = config.icon
    const canCancel = ['PENDING', 'WAITLIST'].includes(app.status)
    const isApproved = ['APPROVED', 'ACCEPTED', 'ADDITIONAL'].includes(app.status)

    return (
      <div
        key={app.id}
        className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start gap-4">
          <img
            src={app.program.thumbnailSquare || app.program.image || '/images/placeholder-program.jpg'}
            alt={app.program.title}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-primary font-medium">
                {typeLabels[app.program.type] || app.program.type}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
              {app.memberGrade && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  app.memberGrade === 'VVIP' ? 'bg-purple-100 text-purple-700' :
                  app.memberGrade === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {app.memberGrade}
                </span>
              )}
            </div>
            <Link
              href={`/programs/${app.program.slug}`}
              className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1"
            >
              {app.program.title}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              신청일: {new Date(app.appliedAt).toLocaleDateString('ko-KR')}
            </p>
            {app.program.startDate && (
              <p className="text-sm text-gray-500">
                시작: {new Date(app.program.startDate).toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            {isApproved && (
              app.depositPaid ? (
                <span className="text-green-600 text-sm font-medium">입금완료</span>
              ) : app.depositAmount ? (
                <span className="text-orange-600 text-sm font-medium">입금대기</span>
              ) : null
            )}
            {canCancel && (
              <CancelApplicationButton applicationId={app.id} />
            )}
          </div>
        </div>

        {/* Deposit info for approved applications */}
        {isApproved && !app.depositPaid && app.depositAmount && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              보증금 {app.depositAmount.toLocaleString()}원을 입금해주세요.
            </p>
          </div>
        )}

        {/* Rejection reason */}
        {app.status === 'REJECTED' && app.rejectReason && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              사유: {app.rejectReason}
            </p>
          </div>
        )}

        {/* Book Survey Link for approved bookclub applications */}
        {isApproved &&
          app.program.type === 'BOOKCLUB' &&
          !app.bookSurveyCompletedAt && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700 mb-2">
                책 수령 방식을 아직 선택하지 않으셨습니다.
              </p>
              <Link
                href={`/programs/${app.program.slug}/book-survey`}
                className="text-sm text-primary font-medium hover:underline"
              >
                책 수령 조사 참여하기 →
              </Link>
            </div>
          )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/my"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">신청 내역</h1>
          <p className="text-gray-500">프로그램 신청 현황을 확인하세요</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            신청 내역이 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            프로그램에 신청하면 여기에서 확인할 수 있습니다
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            프로그램 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current applications */}
          {currentApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">진행 중</h2>
              <div className="space-y-4">
                {currentApplications.map(renderApplication)}
              </div>
            </div>
          )}

          {/* Past applications */}
          {pastApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">지난 신청</h2>
              <div className="space-y-4 opacity-70">
                {pastApplications.map(renderApplication)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
