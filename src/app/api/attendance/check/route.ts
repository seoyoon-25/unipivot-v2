import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/attendance/check - QR 출석 체크
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { sessionId, participantId } = await request.json()

    // Verify participant belongs to user
    const participant = await prisma.programParticipant.findUnique({
      where: { id: participantId }
    })

    if (!participant || participant.userId !== session.user.id) {
      return NextResponse.json({ error: '참가자 정보가 일치하지 않습니다.' }, { status: 403 })
    }

    // Get session info
    const programSession = await prisma.programSession.findUnique({
      where: { id: sessionId }
    })

    if (!programSession) {
      return NextResponse.json({ error: '회차 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    // Check if QR is expired
    if (programSession.qrExpiresAt && new Date() > programSession.qrExpiresAt) {
      return NextResponse.json({ error: 'QR 코드가 만료되었습니다.' }, { status: 400 })
    }

    // Check if already checked in
    const existing = await prisma.programAttendance.findUnique({
      where: {
        sessionId_participantId: {
          sessionId,
          participantId
        }
      }
    })

    if (existing && (existing.status === 'PRESENT' || existing.status === 'LATE')) {
      return NextResponse.json({ error: '이미 출석 체크되었습니다.' }, { status: 400 })
    }

    // Determine if late (more than 15 minutes after session start)
    const now = new Date()
    const sessionStart = new Date(programSession.date)
    if (programSession.startTime) {
      const [hours, minutes] = programSession.startTime.split(':').map(Number)
      sessionStart.setHours(hours, minutes, 0, 0)
    }
    const lateThreshold = new Date(sessionStart.getTime() + 15 * 60 * 1000) // 15 minutes
    const isLate = now > lateThreshold

    // Create or update attendance
    const attendance = await prisma.programAttendance.upsert({
      where: {
        sessionId_participantId: {
          sessionId,
          participantId
        }
      },
      update: {
        status: isLate ? 'LATE' : 'PRESENT',
        checkedAt: now,
        checkMethod: 'QR'
      },
      create: {
        sessionId,
        participantId,
        status: isLate ? 'LATE' : 'PRESENT',
        checkedAt: now,
        checkMethod: 'QR'
      }
    })

    return NextResponse.json({
      success: true,
      status: attendance.status,
      isLate
    })
  } catch (error) {
    console.error('Error checking attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
