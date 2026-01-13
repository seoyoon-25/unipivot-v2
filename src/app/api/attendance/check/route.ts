import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

// POST /api/attendance/check - QR 출석 체크
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'LOGIN_REQUIRED', message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token, sessionId, participantId } = body

    // 토큰 기반 출석 체크 (새로운 방식)
    if (token) {
      return handleTokenBasedAttendance(token, session.user.id, session.user.name || '')
    }

    // 기존 방식 (sessionId + participantId)
    if (sessionId && participantId) {
      return handleLegacyAttendance(sessionId, participantId, session.user.id)
    }

    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'token 또는 sessionId/participantId가 필요합니다.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error checking attendance:', error)
    return NextResponse.json({ error: '출석 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 토큰 기반 출석 체크 (새로운 방식)
async function handleTokenBasedAttendance(token: string, userId: string, userName: string) {
  // 토큰 검증
  const qrToken = await prisma.attendanceQR.findUnique({
    where: { token },
    include: {
      session: {
        include: {
          program: { select: { id: true, title: true } },
        },
      },
    },
  })

  if (!qrToken) {
    return NextResponse.json(
      { error: 'INVALID_TOKEN', message: '유효하지 않은 QR 코드입니다.' },
      { status: 400 }
    )
  }

  if (!qrToken.isActive) {
    return NextResponse.json(
      { error: 'EXPIRED_TOKEN', message: '만료된 QR 코드입니다. 새 QR을 요청해주세요.' },
      { status: 400 }
    )
  }

  const now = new Date()
  if (now < qrToken.validFrom || now > qrToken.validUntil) {
    return NextResponse.json(
      {
        error: 'TOKEN_NOT_VALID_TIME',
        message: `QR 유효시간이 아닙니다. (${format(qrToken.validFrom, 'HH:mm')} - ${format(qrToken.validUntil, 'HH:mm')})`,
      },
      { status: 400 }
    )
  }

  // 해당 프로그램 참가자인지 확인
  const participant = await prisma.programParticipant.findUnique({
    where: {
      programId_userId: {
        programId: qrToken.session.programId,
        userId,
      },
    },
  })

  if (!participant) {
    return NextResponse.json(
      { error: 'NOT_PARTICIPANT', message: '이 프로그램의 참여자가 아닙니다.' },
      { status: 403 }
    )
  }

  if (participant.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'PARTICIPANT_INACTIVE', message: '참가 상태가 활성화되지 않았습니다.' },
      { status: 403 }
    )
  }

  // 이미 출석했는지 확인
  const existingAttendance = await prisma.programAttendance.findUnique({
    where: {
      sessionId_participantId: {
        sessionId: qrToken.sessionId,
        participantId: participant.id,
      },
    },
  })

  if (existingAttendance?.status === 'PRESENT' || existingAttendance?.status === 'LATE') {
    return NextResponse.json({
      success: true,
      alreadyCheckedIn: true,
      message: '이미 출석 처리되었습니다.',
      attendance: {
        memberName: userName,
        programTitle: qrToken.session.program.title,
        sessionNumber: qrToken.session.sessionNo,
        sessionTitle: qrToken.session.title,
        sessionDate: format(qrToken.session.date, 'yyyy년 M월 d일 (EEE)', { locale: ko }),
        checkedAt: existingAttendance.checkedAt,
        status: existingAttendance.status,
      },
    })
  }

  // 지각 여부 확인
  const sessionStart = new Date(qrToken.session.date)
  if (qrToken.session.startTime) {
    const [hours, minutes] = qrToken.session.startTime.split(':').map(Number)
    sessionStart.setHours(hours, minutes, 0, 0)
  }
  const lateThreshold = new Date(sessionStart.getTime() + 15 * 60 * 1000)
  const isLate = now > lateThreshold

  // 출석 처리
  const attendance = await prisma.programAttendance.upsert({
    where: {
      sessionId_participantId: {
        sessionId: qrToken.sessionId,
        participantId: participant.id,
      },
    },
    update: {
      status: isLate ? 'LATE' : 'PRESENT',
      checkedAt: now,
      checkMethod: 'QR',
      qrTokenId: qrToken.id,
    },
    create: {
      sessionId: qrToken.sessionId,
      participantId: participant.id,
      status: isLate ? 'LATE' : 'PRESENT',
      checkedAt: now,
      checkMethod: 'QR',
      qrTokenId: qrToken.id,
    },
  })

  return NextResponse.json({
    success: true,
    message: isLate ? '지각 출석 완료!' : '출석 완료!',
    attendance: {
      memberName: userName,
      programTitle: qrToken.session.program.title,
      sessionNumber: qrToken.session.sessionNo,
      sessionTitle: qrToken.session.title,
      sessionDate: format(qrToken.session.date, 'yyyy년 M월 d일 (EEE)', { locale: ko }),
      checkedAt: attendance.checkedAt,
      status: attendance.status,
      isLate,
    },
  })
}

// 기존 방식 출석 체크
async function handleLegacyAttendance(sessionId: string, participantId: string, userId: string) {
  // Verify participant belongs to user
  const participant = await prisma.programParticipant.findUnique({
    where: { id: participantId },
  })

  if (!participant || participant.userId !== userId) {
    return NextResponse.json(
      { error: '참가자 정보가 일치하지 않습니다.' },
      { status: 403 }
    )
  }

  // Get session info
  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
  })

  if (!programSession) {
    return NextResponse.json(
      { error: '회차 정보를 찾을 수 없습니다.' },
      { status: 404 }
    )
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
        participantId,
      },
    },
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
  const lateThreshold = new Date(sessionStart.getTime() + 15 * 60 * 1000)
  const isLate = now > lateThreshold

  // Create or update attendance
  const attendance = await prisma.programAttendance.upsert({
    where: {
      sessionId_participantId: {
        sessionId,
        participantId,
      },
    },
    update: {
      status: isLate ? 'LATE' : 'PRESENT',
      checkedAt: now,
      checkMethod: 'QR',
    },
    create: {
      sessionId,
      participantId,
      status: isLate ? 'LATE' : 'PRESENT',
      checkedAt: now,
      checkMethod: 'QR',
    },
  })

  return NextResponse.json({
    success: true,
    status: attendance.status,
    isLate,
  })
}
