import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Book,
  FileText,
  Users,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { FacilitatorApplicationButton } from '@/components/session/FacilitatorApplicationButton'
import { FacilitatorApplicationManagement } from '@/components/session/FacilitatorApplicationManagement'
import { FacilitatorChecklist } from '@/components/session/FacilitatorChecklist'
import { RSVPDashboard } from '@/components/rsvp/RSVPDashboard'
import { RSVPResponseForm } from '@/components/rsvp/RSVPResponseForm'
import { getSessionRSVPStatus, getSessionRSVPs, getMyRSVP } from '@/lib/actions/rsvp'
import {
  getSessionFacilitator,
  getSessionFacilitatorApplications,
  getProgramOrganizers,
} from '@/lib/actions/facilitator'
import { getFacilitatorChecklist } from '@/lib/actions/facilitator-checklist'
import type { FacilitatorType, ApplicationStatus } from '@/types/facilitator'

interface SessionDetailPageProps {
  params: Promise<{
    programId: string
    sessionId: string
  }>
}

async function SessionContent({
  programId,
  sessionId,
  userId,
}: {
  programId: string
  sessionId: string
  userId: string
}) {
  // 세션 정보 조회
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          rsvpEnabled: true,
          rsvpDeadlineHours: true,
        },
      },
    },
  })

  if (!session || session.programId !== programId) {
    notFound()
  }

  // 멤버십 확인
  const membership = await prisma.programMembership.findUnique({
    where: {
      programId_userId: { programId, userId },
    },
  })

  const isOrganizer = membership?.role === 'ORGANIZER'

  // 진행자 정보
  const currentFacilitator = await getSessionFacilitator(sessionId)
  const isFacilitator = currentFacilitator?.userId === userId

  // 체크리스트 (진행자인 경우)
  let checklistData = null
  if (isFacilitator && currentFacilitator) {
    checklistData = await getFacilitatorChecklist(currentFacilitator.id)
  }

  // 지원 현황 (운영진인 경우)
  let applications: any[] = []
  let organizers: any[] = []
  if (isOrganizer) {
    applications = await getSessionFacilitatorApplications(sessionId)
    organizers = await getProgramOrganizers(programId)
  }

  // 내 지원 현황 (참가자인 경우)
  let myApplication = null
  if (!isOrganizer) {
    const apps = await prisma.facilitatorApplication.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    })
    myApplication = apps
  }

  // RSVP 관련
  let rsvpStats = null
  let rsvps: any[] = []
  let myRsvp = null

  if (session.program.rsvpEnabled) {
    if (isOrganizer) {
      rsvpStats = await getSessionRSVPStatus(sessionId)
      rsvps = await getSessionRSVPs(sessionId)
    } else {
      myRsvp = await getMyRSVP(sessionId, userId)
    }
  }

  // 날짜 포맷
  const sessionDate = new Date(session.date)
  const dateStr = sessionDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const timeStr = sessionDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start gap-4">
          <Link href={`/mypage/programs/${programId}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
          </Link>
          <div className="flex-1">
            <p className="text-sm text-gray-500">{session.program.title}</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {session.title || `${session.sessionNo}회차`}
            </h1>
          </div>
        </div>

        {/* 세션 정보 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">날짜</p>
              <p className="font-medium">{dateStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">시간</p>
              <p className="font-medium">{timeStr}</p>
            </div>
          </div>
          {session.location && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">장소</p>
                <p className="font-medium">{session.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* 읽기 범위 */}
        {session.bookRange && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Book className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">읽기 범위</span>
            </div>
            <p className="text-blue-700">{session.bookRange}</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="mt-6 flex gap-3">
          <Link href={`/mypage/programs/${programId}/sessions/${sessionId}/review/write`}>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              독후감 작성
            </Button>
          </Link>
        </div>
      </div>

      {/* 진행자 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 진행자 지원/관리 */}
        {isOrganizer ? (
          <FacilitatorApplicationManagement
            sessionId={sessionId}
            programId={programId}
            currentUserId={userId}
            applications={applications.map(a => ({
              ...a,
              status: a.status as ApplicationStatus,
            }))}
            organizers={organizers}
            currentFacilitator={currentFacilitator ? {
              id: currentFacilitator.id,
              userId: currentFacilitator.userId,
              type: currentFacilitator.type as FacilitatorType,
              user: currentFacilitator.user,
            } : null}
          />
        ) : (
          <FacilitatorApplicationButton
            sessionId={sessionId}
            userId={userId}
            programId={programId}
            currentFacilitator={currentFacilitator ? {
              id: currentFacilitator.id,
              userId: currentFacilitator.userId,
              type: currentFacilitator.type as FacilitatorType,
              user: currentFacilitator.user,
            } : null}
            myApplication={myApplication ? {
              ...myApplication,
              status: myApplication.status as ApplicationStatus,
            } : null}
          />
        )}

        {/* 진행자 체크리스트 (진행자인 경우) */}
        {isFacilitator && checklistData && currentFacilitator && (
          <FacilitatorChecklist
            facilitatorId={currentFacilitator.id}
            userId={userId}
            items={checklistData.items}
            completedItems={checklistData.completedItems}
            progress={checklistData.progress}
            isRequired={checklistData.isRequired}
            sessionDate={session.date}
          />
        )}
      </div>

      {/* RSVP 섹션 */}
      {session.program.rsvpEnabled && (
        <div>
          {isOrganizer && rsvpStats ? (
            <RSVPDashboard
              sessionId={sessionId}
              programId={programId}
              currentUserId={userId}
              rsvps={rsvps}
              stats={rsvpStats}
              rsvpEnabled={session.program.rsvpEnabled}
            />
          ) : myRsvp ? (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                참석 확인
              </h3>
              <RSVPResponseForm
                rsvpId={myRsvp.id}
                userId={userId}
                currentStatus={myRsvp.status as any}
                currentNote={myRsvp.note}
                respondedAt={myRsvp.respondedAt}
                session={{
                  id: session.id,
                  title: session.title,
                  date: session.date,
                  location: session.location,
                  program: session.program,
                }}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const authSession = await getServerSession(authOptions)
  if (!authSession?.user?.id) {
    redirect('/login')
  }

  const { programId, sessionId } = await params

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <SessionContent
          programId={programId}
          sessionId={sessionId}
          userId={authSession.user.id}
        />
      </Suspense>
    </div>
  )
}
