'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { generateQRToken, validateQRToken } from '@/lib/utils/qr'
import {
  determineAttendanceStatus,
  calculateLateMinutes,
  canCheckIn,
  AttendanceStatus,
} from '@/lib/utils/attendance'

/**
 * QR 출석 코드 생성 (진행자용)
 */
export async function createAttendanceQR(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Verify session exists
  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
  })

  if (!programSession) {
    throw new Error('세션을 찾을 수 없습니다')
  }

  // Generate QR token
  const qrToken = generateQRToken(sessionId)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  // Create AttendanceQR record
  await prisma.attendanceQR.create({
    data: {
      sessionId,
      token: qrToken,
      validFrom: new Date(),
      validUntil: expiresAt,
      isActive: true,
      createdBy: session.user.id,
    },
  })

  // Update session with QR code
  await prisma.programSession.update({
    where: { id: sessionId },
    data: {
      qrCode: qrToken,
      qrExpiresAt: expiresAt,
    },
  })

  return {
    token: qrToken,
    expiresAt,
  }
}

/**
 * QR 토큰 갱신
 */
export async function refreshAttendanceQR(sessionId: string) {
  // Deactivate old tokens
  await prisma.attendanceQR.updateMany({
    where: {
      sessionId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  })

  return createAttendanceQR(sessionId)
}

/**
 * QR 코드로 출석 체크
 */
export async function checkAttendanceWithQR(token: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Validate token
  const validation = validateQRToken(token)
  if (!validation.isValid || !validation.sessionId) {
    throw new Error(validation.error || 'QR 코드가 유효하지 않습니다')
  }

  const sessionId = validation.sessionId

  // Get session details
  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: true,
    },
  })

  if (!programSession) {
    throw new Error('세션을 찾을 수 없습니다')
  }

  // Find participant for this user in the program
  const participant = await prisma.programParticipant.findFirst({
    where: {
      programId: programSession.programId,
      userId: session.user.id,
    },
  })

  if (!participant) {
    throw new Error('이 프로그램의 참가자가 아닙니다')
  }

  // Check if already checked in
  const existingAttendance = await prisma.programAttendance.findFirst({
    where: {
      sessionId,
      participantId: participant.id,
    },
  })

  if (existingAttendance && existingAttendance.status !== 'ABSENT') {
    return {
      success: false,
      message: '이미 출석 처리되었습니다',
      status: existingAttendance.status as AttendanceStatus,
    }
  }

  // Check if check-in is allowed
  const sessionStartTime = new Date(programSession.date)
  const now = new Date()

  if (!canCheckIn(sessionStartTime, null, now)) {
    throw new Error('출석 체크 가능 시간이 아닙니다')
  }

  // Determine attendance status
  const status = determineAttendanceStatus(sessionStartTime, now)
  const lateMinutes = status === 'LATE' ? calculateLateMinutes(sessionStartTime, now) : null

  // Find QR token record
  const qrToken = await prisma.attendanceQR.findFirst({
    where: {
      token,
      isActive: true,
    },
  })

  // Create or update attendance record
  if (existingAttendance) {
    await prisma.programAttendance.update({
      where: { id: existingAttendance.id },
      data: {
        status,
        checkedAt: now,
        checkMethod: 'QR',
        qrTokenId: qrToken?.id,
      },
    })
  } else {
    await prisma.programAttendance.create({
      data: {
        sessionId,
        participantId: participant.id,
        status,
        checkedAt: now,
        checkMethod: 'QR',
        qrTokenId: qrToken?.id,
      },
    })
  }

  revalidatePath(`/mypage/programs/${programSession.programId}`)

  return {
    success: true,
    message: getCheckInResultMessage(status, lateMinutes),
    status,
    lateMinutes,
  }
}

function getCheckInResultMessage(status: AttendanceStatus, lateMinutes: number | null): string {
  switch (status) {
    case 'PRESENT':
      return '출석이 완료되었습니다! 🎉'
    case 'LATE':
      return `지각 처리되었습니다 (${lateMinutes}분 늦음)`
    case 'ABSENT':
      return '결석 처리됩니다'
    default:
      return '출석 처리되었습니다'
  }
}

/**
 * 수동 출석 처리 (진행자용)
 */
export async function markAttendanceManually(
  sessionId: string,
  participantId: string,
  status: AttendanceStatus,
  notes?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
  })

  if (!programSession) {
    throw new Error('세션을 찾을 수 없습니다')
  }

  // Check existing attendance
  const existing = await prisma.programAttendance.findUnique({
    where: {
      sessionId_participantId: {
        sessionId,
        participantId,
      },
    },
  })

  if (existing) {
    await prisma.programAttendance.update({
      where: { id: existing.id },
      data: {
        status,
        note: notes,
      },
    })
  } else {
    await prisma.programAttendance.create({
      data: {
        sessionId,
        participantId,
        status,
        checkedAt: new Date(),
        checkMethod: 'MANUAL',
        note: notes,
      },
    })
  }

  revalidatePath(`/mypage/programs/${programSession.programId}`)

  return { success: true }
}

/**
 * 출석 현황 조회 (세션별)
 */
export async function getSessionAttendances(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      attendances: true,
    },
  })

  if (!programSession) {
    throw new Error('세션을 찾을 수 없습니다')
  }

  // Get participants for this program
  const participants = await prisma.programParticipant.findMany({
    where: {
      programId: programSession.programId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  // Map participants with their attendance
  const participantsWithAttendance = participants.map((participant) => {
    const attendance = programSession.attendances.find(
      (a) => a.participantId === participant.id
    )
    return {
      user: {
        id: participant.user.id,
        name: participant.user.name,
        email: participant.user.email,
        image: participant.user.image,
      },
      attendance: attendance
        ? {
            status: attendance.status as AttendanceStatus,
            checkInTime: attendance.checkedAt,
            lateMinutes: null,
            notes: attendance.note,
          }
        : null,
    }
  })

  return {
    session: {
      id: programSession.id,
      sessionNumber: programSession.sessionNo,
      title: programSession.title,
      date: programSession.date,
    },
    participants: participantsWithAttendance,
    stats: {
      total: participantsWithAttendance.length,
      present: participantsWithAttendance.filter((p) => p.attendance?.status === 'PRESENT').length,
      late: participantsWithAttendance.filter((p) => p.attendance?.status === 'LATE').length,
      absent: participantsWithAttendance.filter((p) => !p.attendance || p.attendance.status === 'ABSENT').length,
      excused: participantsWithAttendance.filter((p) => p.attendance?.status === 'EXCUSED').length,
    },
  }
}

/**
 * 내 출석 현황 조회 (프로그램별)
 */
export async function getMyAttendances(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Find participant record
  const participant = await prisma.programParticipant.findFirst({
    where: {
      programId,
      userId: session.user.id,
    },
  })

  if (!participant) {
    return []
  }

  const attendances = await prisma.programAttendance.findMany({
    where: {
      participantId: participant.id,
    },
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
        },
      },
    },
    orderBy: {
      session: {
        sessionNo: 'asc',
      },
    },
  })

  return attendances.map((a) => ({
    ...a,
    session: {
      ...a.session,
      sessionNumber: a.session.sessionNo,
    },
  }))
}

/**
 * QR 코드 상태 조회 (진행자용)
 */
export async function getQRStatus(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
    select: {
      qrCode: true,
      qrExpiresAt: true,
    },
  })

  if (!programSession) {
    throw new Error('세션을 찾을 수 없습니다')
  }

  const now = new Date()
  const isExpired = programSession.qrExpiresAt
    ? now > programSession.qrExpiresAt
    : true

  return {
    hasQR: !!programSession.qrCode,
    isExpired,
    expiresAt: programSession.qrExpiresAt,
    token: isExpired ? null : programSession.qrCode,
  }
}
