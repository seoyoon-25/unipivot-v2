import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import QRDisplay from '@/components/club/attendance/QRDisplay'
import AttendanceList from '@/components/club/attendance/AttendanceList'
import { getSessionAttendance } from '@/lib/club/attendance-queries'

export const metadata = {
  title: 'QR 코드 | 운영진 도구 | 유니클럽',
}

interface PageProps {
  searchParams: Promise<{ sessionId?: string }>
}

export default async function QRCodePage({ searchParams }: PageProps) {
  const params = await searchParams
  const sessionId = params.sessionId

  if (!sessionId) {
    redirect('/club/facilitator/attendance')
  }

  // Get session info
  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: { select: { id: true, title: true } },
    },
  })

  if (!programSession) {
    redirect('/club/facilitator/attendance')
  }

  // Get active QR token
  const activeQR = await prisma.attendanceQR.findFirst({
    where: { sessionId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  // Get attendance list - need to also include participants without attendance
  const attendance = await getSessionAttendance(sessionId)

  // Get all participants for this program
  const participants = await prisma.programParticipant.findMany({
    where: { programId: programSession.programId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  // Build complete attendance list (including absent participants)
  const attendanceMap = new Map(attendance.map((a) => [a.user.id, a]))
  const fullAttendance = participants.map((p) => {
    const existing = attendanceMap.get(p.user.id)
    return existing || {
      id: `pending-${p.id}`,
      status: 'ABSENT',
      checkedAt: null,
      checkMethod: null,
      note: null,
      user: {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
      },
    }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">QR 출석 코드</h1>
      <p className="text-sm text-gray-500 mb-6">
        {programSession.program.title} · {programSession.sessionNo}회차
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 text-center">QR 코드</h2>
          <QRDisplay
            sessionId={sessionId}
            initialToken={activeQR?.token}
            initialValidUntil={activeQR?.validUntil.toISOString()}
          />
        </div>

        <div>
          <AttendanceList
            sessionId={sessionId}
            attendances={JSON.parse(JSON.stringify(fullAttendance))}
            isEditable
          />
        </div>
      </div>
    </div>
  )
}
