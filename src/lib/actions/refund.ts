'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateRefundEligibility, RefundEligibility } from '@/lib/utils/refund'
import { revalidatePath } from 'next/cache'

interface RefundAccountInput {
  surveyResponseId: string
  bankName: string
  accountNumber: string
  accountHolder: string
  wantRefund: boolean
}

/**
 * 환급 계좌 정보 저장
 */
export async function saveRefundAccount(input: RefundAccountInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const { surveyResponseId, bankName, accountNumber, accountHolder, wantRefund } = input

  // Validate response exists and belongs to user
  const response = await prisma.surveyResponse.findFirst({
    where: {
      id: surveyResponseId,
      userId: session.user.id,
    },
  })

  if (!response) {
    throw new Error('설문 응답을 찾을 수 없습니다')
  }

  // Parse existing answers and add refund info
  const answers = JSON.parse(response.answers || '{}')
  const updatedAnswers = {
    ...answers,
    _refundInfo: {
      wantRefund,
      bankName: wantRefund ? bankName : null,
      accountNumber: wantRefund ? accountNumber : null,
      accountHolder: wantRefund ? accountHolder : null,
      updatedAt: new Date().toISOString(),
    },
  }

  // Update the response
  await prisma.surveyResponse.update({
    where: { id: surveyResponseId },
    data: {
      answers: JSON.stringify(updatedAnswers),
    },
  })

  return { success: true }
}

/**
 * 기부 처리
 */
export async function processDonation(surveyResponseId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const response = await prisma.surveyResponse.findFirst({
    where: {
      id: surveyResponseId,
      userId: session.user.id,
    },
  })

  if (!response) {
    throw new Error('설문 응답을 찾을 수 없습니다')
  }

  const answers = JSON.parse(response.answers || '{}')
  const updatedAnswers = {
    ...answers,
    _refundInfo: {
      wantRefund: false,
      donated: true,
      donatedAt: new Date().toISOString(),
    },
  }

  await prisma.surveyResponse.update({
    where: { id: surveyResponseId },
    data: {
      answers: JSON.stringify(updatedAnswers),
    },
  })

  return { success: true }
}

/**
 * 프로그램 참가자의 환급 자격 조회
 */
export async function getParticipantRefundEligibility(
  programId: string,
  userId?: string
): Promise<RefundEligibility | null> {
  const session = await getServerSession(authOptions)
  const targetUserId = userId || session?.user?.id

  if (!targetUserId) {
    return null
  }

  // Find participant
  const participant = await prisma.programParticipant.findFirst({
    where: {
      programId,
      userId: targetUserId,
    },
  })

  if (!participant) {
    return null
  }

  // Get all sessions
  const sessions = await prisma.programSession.findMany({
    where: {
      programId,
      date: { lte: new Date() },
    },
  })

  // Get attendances
  const attendances = await prisma.programAttendance.findMany({
    where: {
      participantId: participant.id,
      session: {
        programId,
      },
    },
  })

  // Get book reports (need to map through Member)
  const member = await prisma.member.findFirst({
    where: { userId: targetUserId },
  })

  const bookReports = member
    ? await prisma.bookReport.findMany({
        where: {
          programId,
          authorId: member.id,
        },
      })
    : []

  // Calculate attendance stats
  const totalSessions = sessions.length
  let present = 0
  let late = 0
  let absent = 0

  attendances.forEach((a) => {
    switch (a.status) {
      case 'PRESENT':
        present++
        break
      case 'LATE':
        late++
        break
      case 'ABSENT':
        absent++
        break
    }
  })
  absent = totalSessions - present - late

  // Calculate eligibility
  const eligibility = calculateRefundEligibility(
    { present, late, absent, total: totalSessions },
    { submitted: bookReports.length, total: totalSessions }
  )

  return eligibility
}

/**
 * 프로그램의 모든 참가자 환급 자격 조회 (관리자용)
 */
export async function getAllParticipantsRefundStatus(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Get all participants
  const participants = await prisma.programParticipant.findMany({
    where: { programId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  // Get eligibility for each participant
  const results = await Promise.all(
    participants.map(async (participant) => {
      const eligibility = await getParticipantRefundEligibility(programId, participant.userId)

      // Get refund info from survey response if exists
      // Find application first
      const application = await prisma.programApplication.findFirst({
        where: {
          programId,
          userId: participant.userId,
        },
      })

      let refundInfo = null
      if (application) {
        const surveyResponse = await prisma.surveyResponse.findFirst({
          where: {
            applicationId: application.id,
            survey: {
              programId,
              surveyType: 'program',
            },
          },
          orderBy: { submittedAt: 'desc' },
        })

        if (surveyResponse) {
          const answers = JSON.parse(surveyResponse.answers || '{}')
          refundInfo = answers._refundInfo || null
        }
      }

      return {
        user: {
          id: participant.user.id,
          name: participant.user.name,
          email: participant.user.email,
        },
        eligibility,
        refundInfo,
        depositAmount: participant.depositAmount || 50000,
      }
    })
  )

  return results
}

/**
 * 환급 처리 완료 표시 (관리자용)
 */
export async function markRefundAsProcessed(
  programId: string,
  userId: string,
  processedBy: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Find application
  const application = await prisma.programApplication.findFirst({
    where: {
      programId,
      userId,
    },
  })

  if (!application) {
    throw new Error('신청 정보를 찾을 수 없습니다')
  }

  // Find the survey response
  const surveyResponse = await prisma.surveyResponse.findFirst({
    where: {
      applicationId: application.id,
      survey: {
        programId,
        surveyType: 'program',
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  if (!surveyResponse) {
    throw new Error('설문 응답을 찾을 수 없습니다')
  }

  const answers = JSON.parse(surveyResponse.answers || '{}')
  const updatedAnswers = {
    ...answers,
    _refundInfo: {
      ...answers._refundInfo,
      processed: true,
      processedAt: new Date().toISOString(),
      processedBy,
    },
  }

  await prisma.surveyResponse.update({
    where: { id: surveyResponse.id },
    data: {
      answers: JSON.stringify(updatedAnswers),
    },
  })

  revalidatePath(`/admin/programs/${programId}`)

  return { success: true }
}

/**
 * 환급 통계 조회
 */
export async function getRefundStats(programId: string) {
  const participants = await getAllParticipantsRefundStatus(programId)

  const stats = {
    totalParticipants: participants.length,
    eligibleCount: 0,
    ineligibleCount: 0,
    wantRefundCount: 0,
    donatedCount: 0,
    processedCount: 0,
    pendingCount: 0,
    totalRefundAmount: 0,
    totalDonationAmount: 0,
  }

  participants.forEach((p) => {
    if (p.eligibility?.isEligible) {
      stats.eligibleCount++

      if (p.refundInfo?.wantRefund) {
        stats.wantRefundCount++
        stats.totalRefundAmount += p.depositAmount

        if (p.refundInfo.processed) {
          stats.processedCount++
        } else {
          stats.pendingCount++
        }
      } else if (p.refundInfo?.donated) {
        stats.donatedCount++
        stats.totalDonationAmount += p.depositAmount
      }
    } else {
      stats.ineligibleCount++
    }
  })

  return stats
}
