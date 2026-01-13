import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import AttendanceCheckIn from './AttendanceCheckIn'

interface Props {
  params: Promise<{ code: string }>
}

export default async function QRAttendancePage({ params }: Props) {
  const { code } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/attendance/${code}`)
  }

  // Find session by QR code
  const programSession = await prisma.programSession.findUnique({
    where: { qrCode: code },
    include: {
      program: {
        select: { id: true, title: true }
      }
    }
  })

  if (!programSession) {
    notFound()
  }

  // Check if QR code is expired
  const isExpired = programSession.qrExpiresAt ? new Date() > programSession.qrExpiresAt : false

  // Check if user is a participant
  const participant = await prisma.programParticipant.findUnique({
    where: {
      programId_userId: {
        programId: programSession.programId,
        userId: session.user.id
      }
    }
  })

  // Check existing attendance
  const existingAttendance = participant ? await prisma.programAttendance.findUnique({
    where: {
      sessionId_participantId: {
        sessionId: programSession.id,
        participantId: participant.id
      }
    }
  }) : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AttendanceCheckIn
        session={{
          id: programSession.id,
          sessionNo: programSession.sessionNo,
          date: programSession.date.toISOString(),
          title: programSession.title,
          program: programSession.program
        }}
        isExpired={isExpired}
        isParticipant={!!participant}
        participantId={participant?.id || null}
        alreadyCheckedIn={existingAttendance?.status === 'PRESENT' || existingAttendance?.status === 'LATE'}
        userName={session.user.name || ''}
      />
    </div>
  )
}
