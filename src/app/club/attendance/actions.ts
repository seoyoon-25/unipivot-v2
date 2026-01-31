'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateQRToken } from '@/lib/utils/qr'
import { revalidatePath } from 'next/cache'

/**
 * QR 코드를 통한 출석 체크
 */
export async function checkInWithQR(token: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  try {
    // Validate QR token
    const validation = validateQRToken(token)
    if (!validation.isValid || !validation.sessionId) {
      throw new Error('유효하지 않은 QR 코드입니다')
    }

    const sessionId = validation.sessionId

    // Find the program session
    const programSession = await prisma.programSession.findUnique({
      where: { id: sessionId },
      include: { program: true },
    })

    if (!programSession) {
      throw new Error('세션을 찾을 수 없습니다')
    }

    // Find participant
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
    const existing = await prisma.programAttendance.findUnique({
      where: {
        sessionId_participantId: {
          sessionId,
          participantId: participant.id,
        },
      },
    })

    if (existing && existing.status !== 'ABSENT') {
      throw new Error('이미 출석 체크되었습니다')
    }

    // Determine if late (10 minutes after session start)
    const now = new Date()
    let status = 'PRESENT'
    if (programSession.startTime) {
      const [hours, minutes] = programSession.startTime.split(':').map(Number)
      const sessionStart = new Date(programSession.date)
      sessionStart.setHours(hours, minutes, 0, 0)
      const lateThreshold = new Date(sessionStart.getTime() + 10 * 60 * 1000)
      if (now > lateThreshold) {
        status = 'LATE'
      }
    }

    // Find or get the QR token record
    const qrToken = await prisma.attendanceQR.findFirst({
      where: { sessionId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    // Upsert attendance
    await prisma.programAttendance.upsert({
      where: {
        sessionId_participantId: {
          sessionId,
          participantId: participant.id,
        },
      },
      create: {
        sessionId,
        participantId: participant.id,
        status,
        checkedAt: now,
        checkMethod: 'QR',
        qrTokenId: qrToken?.id,
      },
      update: {
        status,
        checkedAt: now,
        checkMethod: 'QR',
        qrTokenId: qrToken?.id,
      },
    })

    revalidatePath('/club/attendance')

    return {
      success: true,
      status,
      programTitle: programSession.program.title,
      sessionNo: programSession.sessionNo,
    }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('출석 체크 중 오류가 발생했습니다')
  }
}

/**
 * 진행자: 수동 출석 체크
 */
export async function manualCheckIn(
  sessionId: string,
  userId: string,
  status: 'PRESENT' | 'LATE' | 'ABSENT'
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  try {
    // Find session to get programId
    const programSession = await prisma.programSession.findUnique({
      where: { id: sessionId },
    })

    if (!programSession) {
      throw new Error('세션을 찾을 수 없습니다')
    }

    // Role check: ADMIN/SUPER_ADMIN or program ORGANIZER/FACILITATOR
    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      const membership = await prisma.programMembership.findFirst({
        where: {
          userId: session.user.id,
          programId: programSession.programId,
          role: { in: ['ORGANIZER', 'FACILITATOR'] },
        },
      })
      if (!membership) {
        throw new Error('권한이 없습니다')
      }
    }

    // Find participant
    const participant = await prisma.programParticipant.findFirst({
      where: {
        programId: programSession.programId,
        userId,
      },
    })

    if (!participant) {
      throw new Error('참가자를 찾을 수 없습니다')
    }

    await prisma.programAttendance.upsert({
      where: {
        sessionId_participantId: {
          sessionId,
          participantId: participant.id,
        },
      },
      create: {
        sessionId,
        participantId: participant.id,
        status,
        checkedAt: status !== 'ABSENT' ? new Date() : null,
        checkMethod: 'MANUAL',
      },
      update: {
        status,
        checkedAt: status !== 'ABSENT' ? new Date() : null,
        checkMethod: 'MANUAL',
      },
    })

    revalidatePath('/club/facilitator/attendance')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('출석 처리 중 오류가 발생했습니다')
  }
}

/**
 * 진행자: QR 코드 생성
 */
export async function generateSessionQR(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  try {
    // Verify session exists and check role
    const programSession = await prisma.programSession.findUnique({
      where: { id: sessionId },
      select: { programId: true },
    })

    if (!programSession) {
      throw new Error('세션을 찾을 수 없습니다')
    }

    // Role check: ADMIN/SUPER_ADMIN or program ORGANIZER/FACILITATOR
    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      const membership = await prisma.programMembership.findFirst({
        where: {
          userId: session.user.id,
          programId: programSession.programId,
          role: { in: ['ORGANIZER', 'FACILITATOR'] },
        },
      })
      if (!membership) {
        throw new Error('권한이 없습니다')
      }
    }

    const { generateQRToken } = await import('@/lib/utils/qr')

    const token = generateQRToken(sessionId)
    const now = new Date()
    const validUntil = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes

    // Deactivate old tokens
    await prisma.attendanceQR.updateMany({
      where: { sessionId, isActive: true },
      data: { isActive: false },
    })

    // Create new token
    const qrRecord = await prisma.attendanceQR.create({
      data: {
        sessionId,
        token,
        validFrom: now,
        validUntil,
        isActive: true,
        createdBy: session.user.id,
      },
    })

    revalidatePath('/club/facilitator/attendance')

    return {
      token: qrRecord.token,
      validUntil: qrRecord.validUntil.toISOString(),
    }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('QR 코드 생성 중 오류가 발생했습니다')
  }
}
