'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import type {
  FacilitatorType,
  ApplicationStatus,
  IncentiveType,
} from '@/types/facilitator'

/**
 * 1. 참가자가 진행자 지원
 */
export async function applyForFacilitator(
  sessionId: string,
  userId: string,
  message?: string
) {
  // 세션 정보 및 프로그램 조회
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: true,
      facilitators: true,
    },
  })

  if (!session) {
    throw new Error('세션을 찾을 수 없습니다.')
  }

  // 이미 진행자가 있는지 확인
  if (session.facilitators.length > 0) {
    throw new Error('이미 진행자가 배정되어 있습니다.')
  }

  // 참가자인지 확인
  const participant = await prisma.programParticipant.findFirst({
    where: {
      programId: session.programId,
      userId,
      status: 'ACTIVE',
    },
  })

  if (!participant) {
    throw new Error('해당 프로그램의 참가자만 지원할 수 있습니다.')
  }

  // 이미 지원했는지 확인
  const existingApplication = await prisma.facilitatorApplication.findUnique({
    where: {
      sessionId_userId: { sessionId, userId },
    },
  })

  if (existingApplication) {
    throw new Error('이미 지원하셨습니다.')
  }

  // 지원 생성
  const application = await prisma.facilitatorApplication.create({
    data: {
      sessionId,
      userId,
      message,
      status: 'PENDING',
    },
  })

  // TODO: 운영진들에게 알림 발송

  revalidatePath(`/mypage/programs/${session.programId}`)
  revalidatePath(`/mypage/programs/${session.programId}/sessions/${sessionId}`)

  return application
}

/**
 * 2. 지원 취소
 */
export async function cancelFacilitatorApplication(
  applicationId: string,
  userId: string
) {
  const application = await prisma.facilitatorApplication.findUnique({
    where: { id: applicationId },
    include: { session: true },
  })

  if (!application) {
    throw new Error('지원 내역을 찾을 수 없습니다.')
  }

  if (application.userId !== userId) {
    throw new Error('본인의 지원만 취소할 수 있습니다.')
  }

  if (application.status !== 'PENDING') {
    throw new Error('대기 중인 지원만 취소할 수 있습니다.')
  }

  await prisma.facilitatorApplication.delete({
    where: { id: applicationId },
  })

  revalidatePath(`/mypage/programs/${application.session.programId}`)

  return { success: true }
}

/**
 * 3. 운영진이 지원 승인
 */
export async function approveFacilitatorApplication(
  applicationId: string,
  reviewerId: string,
  note?: string
) {
  const application = await prisma.facilitatorApplication.findUnique({
    where: { id: applicationId },
    include: {
      session: {
        include: { program: true },
      },
    },
  })

  if (!application) {
    throw new Error('지원 내역을 찾을 수 없습니다.')
  }

  // 권한 확인 (운영진만)
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId: application.session.programId,
      userId: reviewerId,
      role: 'ORGANIZER',
    },
  })

  // 관리자도 허용
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: reviewerId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 승인할 수 있습니다.')
  }

  // 이미 진행자가 있는지 확인
  const existingFacilitator = await prisma.sessionFacilitator.findFirst({
    where: { sessionId: application.sessionId },
  })

  if (existingFacilitator) {
    throw new Error('이미 진행자가 배정되어 있습니다.')
  }

  // 트랜잭션으로 처리
  const result = await prisma.$transaction(async (tx) => {
    // Application 상태 → APPROVED
    await tx.facilitatorApplication.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    })

    // SessionFacilitator 생성 (type: VOLUNTEER, 인센티브 부여)
    const facilitator = await tx.sessionFacilitator.create({
      data: {
        sessionId: application.sessionId,
        userId: application.userId,
        type: 'VOLUNTEER',
        assignedBy: reviewerId,
        note,
        incentiveGranted: true, // 참가자 진행자는 인센티브 자동 부여
      },
    })

    // 체크리스트 생성 (템플릿이 있으면)
    const template = await tx.facilitatorChecklistTemplate.findUnique({
      where: { programId: application.session.programId },
    })

    if (template) {
      await tx.facilitatorChecklist.create({
        data: {
          facilitatorId: facilitator.id,
          completedItems: '[]',
          progress: 0,
        },
      })
    }

    return facilitator
  })

  // TODO: 지원자에게 알림 발송

  revalidatePath(`/mypage/programs/${application.session.programId}`)
  revalidatePath(`/mypage/programs/${application.session.programId}/sessions/${application.sessionId}`)

  return result
}

/**
 * 4. 운영진이 지원 거절
 */
export async function rejectFacilitatorApplication(
  applicationId: string,
  reviewerId: string,
  note?: string
) {
  const application = await prisma.facilitatorApplication.findUnique({
    where: { id: applicationId },
    include: { session: true },
  })

  if (!application) {
    throw new Error('지원 내역을 찾을 수 없습니다.')
  }

  // 권한 확인
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId: application.session.programId,
      userId: reviewerId,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: reviewerId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 거절할 수 있습니다.')
  }

  await prisma.facilitatorApplication.update({
    where: { id: applicationId },
    data: {
      status: 'REJECTED',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: note,
    },
  })

  // TODO: 지원자에게 알림 발송

  revalidatePath(`/mypage/programs/${application.session.programId}`)

  return { success: true }
}

/**
 * 5. 운영진이 직접 배정 (운영진끼리)
 */
export async function assignFacilitatorByOrganizer(
  sessionId: string,
  facilitatorUserId: string,
  assignerId: string,
  note?: string
) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: { program: true },
  })

  if (!session) {
    throw new Error('세션을 찾을 수 없습니다.')
  }

  // 권한 확인 (운영진만)
  const assignerMembership = await prisma.programMembership.findFirst({
    where: {
      programId: session.programId,
      userId: assignerId,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: assignerId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!assignerMembership && !isAdmin) {
    throw new Error('운영진만 배정할 수 있습니다.')
  }

  // 배정 대상이 운영진인지 확인
  const facilitatorMembership = await prisma.programMembership.findFirst({
    where: {
      programId: session.programId,
      userId: facilitatorUserId,
      role: 'ORGANIZER',
    },
  })

  const facilitatorType: FacilitatorType = facilitatorMembership ? 'ORGANIZER' : 'VOLUNTEER'

  // 이미 진행자가 있는지 확인
  const existingFacilitator = await prisma.sessionFacilitator.findFirst({
    where: { sessionId },
  })

  if (existingFacilitator) {
    throw new Error('이미 진행자가 배정되어 있습니다.')
  }

  // 트랜잭션으로 처리
  const result = await prisma.$transaction(async (tx) => {
    // SessionFacilitator 생성
    const facilitator = await tx.sessionFacilitator.create({
      data: {
        sessionId,
        userId: facilitatorUserId,
        type: facilitatorType,
        assignedBy: assignerId,
        note,
        // 운영진은 인센티브 없음, 참가자는 인센티브 부여
        incentiveGranted: facilitatorType === 'VOLUNTEER',
      },
    })

    // 체크리스트 생성 (템플릿이 있으면)
    const template = await tx.facilitatorChecklistTemplate.findUnique({
      where: { programId: session.programId },
    })

    if (template) {
      await tx.facilitatorChecklist.create({
        data: {
          facilitatorId: facilitator.id,
          completedItems: '[]',
          progress: 0,
        },
      })
    }

    return facilitator
  })

  // TODO: 진행자에게 알림 발송

  revalidatePath(`/mypage/programs/${session.programId}`)
  revalidatePath(`/mypage/programs/${session.programId}/sessions/${sessionId}`)

  return result
}

/**
 * 6. 진행자 제거
 */
export async function removeFacilitator(
  facilitatorId: string,
  removerId: string
) {
  const facilitator = await prisma.sessionFacilitator.findUnique({
    where: { id: facilitatorId },
    include: { session: true },
  })

  if (!facilitator) {
    throw new Error('진행자를 찾을 수 없습니다.')
  }

  // 권한 확인
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId: facilitator.session.programId,
      userId: removerId,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: removerId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 진행자를 제거할 수 있습니다.')
  }

  await prisma.sessionFacilitator.delete({
    where: { id: facilitatorId },
  })

  revalidatePath(`/mypage/programs/${facilitator.session.programId}`)
  revalidatePath(`/mypage/programs/${facilitator.session.programId}/sessions/${facilitator.sessionId}`)

  return { success: true }
}

/**
 * 7. 진행자 인센티브 자동 적용
 */
export async function applyFacilitatorIncentives(
  userId: string,
  programId: string
) {
  // 프로그램 정보 조회
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { sessions: true },
  })

  if (!program) {
    throw new Error('프로그램을 찾을 수 없습니다.')
  }

  const incentiveMax = program.facilitatorIncentiveMax || 3

  // 진행 완료한 세션 조회 (참가자 진행만)
  const facilitatedSessions = await prisma.sessionFacilitator.findMany({
    where: {
      userId,
      type: 'VOLUNTEER',
      incentiveGranted: true,
      incentiveApplied: false,
      session: { programId },
    },
    include: { session: true },
    orderBy: { createdAt: 'asc' },
  })

  // 최대 횟수까지만
  const eligibleCount = Math.min(facilitatedSessions.length, incentiveMax)

  if (eligibleCount === 0) {
    return { attendanceWaivers: 0, reportWaivers: 0 }
  }

  // 참가자 정보 조회
  const participant = await prisma.programParticipant.findFirst({
    where: { programId, userId },
  })

  if (!participant) {
    throw new Error('참가자 정보를 찾을 수 없습니다.')
  }

  // 결석 조회
  const absences = await prisma.programAttendance.findMany({
    where: {
      participantId: participant.id,
      status: 'ABSENT',
    },
  })

  // 독후감 미제출 조회 (Member를 통해 조회)
  const userMember = await prisma.member.findFirst({
    where: { userId },
  })

  const submittedReports = userMember
    ? await prisma.bookReport.findMany({
        where: {
          authorId: userMember.id,
          session: { programId },
        },
      })
    : []

  const totalSessions = program.sessions.length
  const missingReportsCount = totalSessions - submittedReports.length

  let attendanceWaivers = 0
  let reportWaivers = 0
  let appliedIndex = 0

  // 우선순위 1: 결석 면제
  if (absences.length > 0) {
    attendanceWaivers = Math.min(eligibleCount, absences.length)
    for (let i = 0; i < attendanceWaivers && appliedIndex < eligibleCount; i++) {
      await prisma.sessionFacilitator.update({
        where: { id: facilitatedSessions[appliedIndex].id },
        data: {
          incentiveType: 'ATTENDANCE',
          incentiveApplied: true,
        },
      })
      appliedIndex++
    }
  }

  // 우선순위 2: 독후감 면제 (남은 인센티브가 있으면)
  const remainingIncentives = eligibleCount - appliedIndex
  if (remainingIncentives > 0 && missingReportsCount > 0) {
    reportWaivers = Math.min(remainingIncentives, missingReportsCount)
    for (let i = 0; i < reportWaivers && appliedIndex < eligibleCount; i++) {
      await prisma.sessionFacilitator.update({
        where: { id: facilitatedSessions[appliedIndex].id },
        data: {
          incentiveType: 'REPORT',
          incentiveApplied: true,
        },
      })
      appliedIndex++
    }
  }

  return {
    attendanceWaivers,
    reportWaivers,
  }
}

/**
 * 8. 세션 진행자 조회
 */
export async function getSessionFacilitator(sessionId: string) {
  const facilitator = await prisma.sessionFacilitator.findFirst({
    where: { sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      checklist: true,
    },
  })

  return facilitator
}

/**
 * 9. 세션 진행자 지원 목록 조회
 */
export async function getSessionFacilitatorApplications(sessionId: string) {
  const applications = await prisma.facilitatorApplication.findMany({
    where: { sessionId },
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
    orderBy: { createdAt: 'asc' },
  })

  return applications
}

/**
 * 10. 프로그램 운영진 목록 조회
 */
export async function getProgramOrganizers(programId: string) {
  const organizers = await prisma.programMembership.findMany({
    where: {
      programId,
      role: 'ORGANIZER',
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

  return organizers
}

/**
 * 11. 운영진 추가
 */
export async function addProgramOrganizer(
  programId: string,
  userId: string,
  addedBy: string
) {
  // 권한 확인
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId,
      userId: addedBy,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: addedBy,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 추가할 수 있습니다.')
  }

  // 이미 운영진인지 확인
  const existing = await prisma.programMembership.findUnique({
    where: {
      programId_userId: { programId, userId },
    },
  })

  if (existing?.role === 'ORGANIZER') {
    throw new Error('이미 운영진입니다.')
  }

  // 운영진 추가 또는 업데이트
  const organizer = await prisma.programMembership.upsert({
    where: {
      programId_userId: { programId, userId },
    },
    create: {
      programId,
      userId,
      role: 'ORGANIZER',
    },
    update: {
      role: 'ORGANIZER',
    },
  })

  revalidatePath(`/mypage/programs/${programId}`)

  return organizer
}

/**
 * 12. 운영진 제거
 */
export async function removeProgramOrganizer(
  programId: string,
  userId: string,
  removedBy: string
) {
  // 권한 확인
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId,
      userId: removedBy,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: removedBy,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 제거할 수 있습니다.')
  }

  // 자기 자신 제거 방지
  if (userId === removedBy) {
    throw new Error('자기 자신은 제거할 수 없습니다.')
  }

  await prisma.programMembership.delete({
    where: {
      programId_userId: { programId, userId },
    },
  })

  revalidatePath(`/mypage/programs/${programId}`)

  return { success: true }
}

/**
 * 13. 내 진행 이력 조회
 */
export async function getMyFacilitatedSessions(
  userId: string,
  programId?: string
) {
  const where = programId
    ? { userId, session: { programId } }
    : { userId }

  const sessions = await prisma.sessionFacilitator.findMany({
    where,
    include: {
      session: {
        include: {
          program: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      checklist: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return sessions
}
