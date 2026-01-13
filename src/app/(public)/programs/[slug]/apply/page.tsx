import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApplicationForm } from './ApplicationForm'
import { getProgramStatus } from '@/lib/program/status-calculator'

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

export default async function ApplyPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const { slug } = await params

  // Get program
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
    },
  })

  if (!program) {
    notFound()
  }

  // Check if program is recruiting
  const programStatus = getProgramStatus({
    status: program.status,
    recruitStartDate: program.recruitStartDate,
    recruitEndDate: program.recruitEndDate,
    startDate: program.startDate,
    endDate: program.endDate,
  })

  if (programStatus !== 'RECRUITING') {
    redirect(`/programs/${slug}`)
  }

  // Check if user has already applied
  if (session?.user?.id) {
    const existingApplication = await prisma.programApplication.findUnique({
      where: {
        programId_userId: {
          programId: program.id,
          userId: session.user.id,
        },
      },
    })

    if (existingApplication) {
      redirect(`/programs/${slug}`)
    }
  }

  // Get user data for auto-fill
  let userData = null
  let previousApplication = null
  if (session?.user?.id) {
    const [user, prevApp] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      }),
      // Get previous application for auto-fill hometown/residence
      prisma.programApplication.findFirst({
        where: { userId: session.user.id },
        orderBy: { appliedAt: 'desc' },
        select: {
          hometown: true,
          residence: true,
        },
      }),
    ])
    userData = user
    previousApplication = prevApp
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <ApplicationForm
          program={program}
          userData={userData}
          previousApplication={previousApplication}
          isLoggedIn={!!session}
        />
      </div>
    </div>
  )
}
