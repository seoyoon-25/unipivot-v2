import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApplicationForm } from './ApplicationForm'
import { getProgramStatus } from '@/lib/program/status-calculator'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const program = await prisma.program.findUnique({
    where: { slug },
    select: { title: true },
  })

  if (!program) {
    return { title: '프로그램을 찾을 수 없습니다' }
  }

  return {
    title: `${program.title} 신청 | 유니피벗`,
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: '검토 중',
    APPROVED: '승인됨',
    REJECTED: '거절됨',
    WAITLIST: '대기 중',
    CANCELLED: '취소됨',
  }
  return labels[status] || status
}

export default async function ApplyPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const { slug } = await params

  // Get program with application settings
  const program = await prisma.program.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      feeType: true,
      feeAmount: true,
      recruitStartDate: true,
      recruitEndDate: true,
      startDate: true,
      endDate: true,
      capacity: true,
      applicationCount: true,
      applicationOpen: true,
      applicationStartAt: true,
      applicationEndAt: true,
      maxParticipants: true,
      depositAmountSetting: true,
      requireMotivation: true,
      requireSelfIntro: true,
      customQuestions: true,
      autoApproveVVIP: true,
      autoApproveVIP: true,
      autoRejectBlocked: true,
      _count: {
        select: {
          applications: {
            where: { status: 'APPROVED' }
          }
        }
      }
    },
  })

  if (!program) {
    notFound()
  }

  // Check if program is recruiting or applicationOpen
  const programStatus = getProgramStatus({
    status: program.status,
    recruitStartDate: program.recruitStartDate,
    recruitEndDate: program.recruitEndDate,
    startDate: program.startDate,
    endDate: program.endDate,
  })

  // Check if application is open
  const isApplicationOpen = program.applicationOpen || programStatus === 'RECRUITING'

  if (!isApplicationOpen) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">현재 신청을 받고 있지 않습니다.</p>
            <Link
              href={`/programs/${slug}`}
              className="mt-4 inline-block text-orange-500 hover:underline"
            >
              프로그램 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Get user data and member data
  let userData = null
  let member = null
  let existingApplication = null

  if (session?.user?.id) {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        origin: true,
        gender: true,
        birthYear: true,
        organization: true,
        residenceRegion: true,
        residenceCity: true,
        birthRegion: true,
        birthCity: true,
      },
    })
    userData = user

    // Get linked member data
    member = await prisma.member.findUnique({
      where: { userId: session.user.id },
      include: {
        stats: true,
      },
    })

    // Check for existing application
    existingApplication = await prisma.programApplication.findFirst({
      where: {
        programId: program.id,
        OR: [
          { userId: session.user.id },
          ...(member ? [{ memberId: member.id }] : []),
        ],
      },
    })
  }

  // Already applied
  if (existingApplication) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold mb-4">이미 신청하셨습니다</h2>
            <p className="text-gray-500 mb-2">
              신청 상태: <span className="font-medium">{getStatusLabel(existingApplication.status)}</span>
            </p>
            <Link
              href="/mypage/applications"
              className="text-orange-500 hover:underline"
            >
              마이페이지에서 확인하기
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Get previous application for auto-fill if no member
  let previousApplication = null
  if (!member && session?.user?.id) {
    previousApplication = await prisma.programApplication.findFirst({
      where: { userId: session.user.id },
      orderBy: { appliedAt: 'desc' },
      select: {
        hometown: true,
        residence: true,
        origin: true,
        organization: true,
      },
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <ApplicationForm
          program={{
            ...program,
            depositAmount: program.depositAmountSetting,
            currentCount: program._count.applications,
          }}
          user={session?.user}
          userData={userData}
          member={member}
          previousApplication={previousApplication}
          isLoggedIn={!!session}
        />
      </div>
    </main>
  )
}
