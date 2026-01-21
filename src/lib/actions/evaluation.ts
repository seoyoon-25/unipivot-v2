'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { awardBadge } from './badges'

// 운영진 권한 확인
async function checkOrganizerRole(programId: string, userId: string) {
  const membership = await prisma.programMembership.findUnique({
    where: {
      programId_userId: { programId, userId }
    }
  })

  return membership?.role === 'ORGANIZER' || membership?.role === 'ADMIN'
}

// 경고/칭찬 카드 발급
export async function issueCard(
  programId: string,
  userId: string,
  type: 'WARNING' | 'PRAISE',
  data: {
    category: string
    title: string
    description?: string
    sessionId?: string
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const isOrganizer = await checkOrganizerRole(programId, session.user.id)
  if (!isOrganizer) {
    return { error: '권한이 없습니다.' }
  }

  const card = await prisma.participantCard.create({
    data: {
      programId,
      userId,
      type,
      category: data.category,
      title: data.title,
      description: data.description,
      sessionId: data.sessionId,
      issuedBy: session.user.id
    }
  })

  // 경고 3회 이상 시 자동 조치
  if (type === 'WARNING') {
    const warningCount = await prisma.participantCard.count({
      where: {
        programId,
        userId,
        type: 'WARNING'
      }
    })

    if (warningCount >= 3) {
      // 보증금 환급 제한 설정 (RefundHistory에 플래그)
      await prisma.refundHistory.updateMany({
        where: {
          programId,
          memberId: userId,
          status: 'PENDING'
        },
        data: {
          status: 'CANCELLED'
        }
      })
    }
  }

  // 칭찬 3회 이상 시 배지 부여
  if (type === 'PRAISE') {
    const praiseCount = await prisma.participantCard.count({
      where: {
        programId,
        userId,
        type: 'PRAISE'
      }
    })

    if (praiseCount >= 3) {
      await awardBadge(userId, 'PRAISED_PARTICIPANT', programId)
    }
  }

  return card
}

// 운영진 메모 작성
export async function createNote(
  programId: string,
  userId: string,
  content: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const isOrganizer = await checkOrganizerRole(programId, session.user.id)
  if (!isOrganizer) {
    return { error: '권한이 없습니다.' }
  }

  return await prisma.organizerNote.create({
    data: {
      programId,
      userId,
      content,
      createdBy: session.user.id
    }
  })
}

// 운영진 메모 수정
export async function updateNote(noteId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const note = await prisma.organizerNote.findUnique({
    where: { id: noteId }
  })

  if (!note) {
    return { error: '메모를 찾을 수 없습니다.' }
  }

  // 작성자 본인 또는 운영진 확인
  if (note.createdBy !== session.user.id) {
    const isOrganizer = await checkOrganizerRole(note.programId, session.user.id)
    if (!isOrganizer) {
      return { error: '권한이 없습니다.' }
    }
  }

  return await prisma.organizerNote.update({
    where: { id: noteId },
    data: { content }
  })
}

// 운영진 메모 삭제
export async function deleteNote(noteId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const note = await prisma.organizerNote.findUnique({
    where: { id: noteId }
  })

  if (!note) {
    return { error: '메모를 찾을 수 없습니다.' }
  }

  if (note.createdBy !== session.user.id) {
    const isOrganizer = await checkOrganizerRole(note.programId, session.user.id)
    if (!isOrganizer) {
      return { error: '권한이 없습니다.' }
    }
  }

  await prisma.organizerNote.delete({
    where: { id: noteId }
  })

  return { success: true }
}

// 시즌 종료 종합 평가 생성/수정
export async function createSeasonEvaluation(
  programId: string,
  userId: string,
  evaluation: {
    overallRating: number
    participationScore: number
    preparationScore: number
    cooperationScore: number
    contributionScore: number
    strengths?: string
    improvements?: string
    recommendation: 'PRIORITY' | 'WELCOME' | 'HOLD' | 'RESTRICT'
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const isOrganizer = await checkOrganizerRole(programId, session.user.id)
  if (!isOrganizer) {
    return { error: '권한이 없습니다.' }
  }

  return await prisma.seasonEvaluation.upsert({
    where: {
      programId_userId: { programId, userId }
    },
    create: {
      programId,
      userId,
      ...evaluation,
      evaluatedBy: session.user.id
    },
    update: {
      ...evaluation
    }
  })
}

// 참여 권한 관리
export async function setParticipationPermission(
  userId: string,
  status: 'ALLOWED' | 'RESTRICTED' | 'BANNED',
  reason?: string,
  expiresAt?: Date,
  programId?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  // 관리자 권한 확인 (전체 제한의 경우)
  if (!programId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return { error: '관리자 권한이 필요합니다.' }
    }
  } else {
    const isOrganizer = await checkOrganizerRole(programId, session.user.id)
    if (!isOrganizer) {
      return { error: '권한이 없습니다.' }
    }
  }

  return await prisma.participationPermission.create({
    data: {
      userId,
      programId,
      status,
      reason,
      expiresAt,
      setBy: session.user.id
    }
  })
}

// 참가자 종합 정보 조회 (운영진 전용)
export async function getParticipantEvaluation(
  programId: string,
  userId: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const isOrganizer = await checkOrganizerRole(programId, session.user.id)
  if (!isOrganizer) {
    return { error: '권한이 없습니다.' }
  }

  const [cards, notes, evaluation, participant] = await Promise.all([
    prisma.participantCard.findMany({
      where: { programId, userId },
      include: {
        issuer: { select: { id: true, name: true } },
        session: { select: { id: true, sessionNo: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.organizerNote.findMany({
      where: { programId, userId },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.seasonEvaluation.findUnique({
      where: {
        programId_userId: { programId, userId }
      },
      include: { evaluator: { select: { id: true, name: true } } }
    }),

    prisma.programParticipant.findFirst({
      where: { programId, userId },
      include: {
        user: { select: { id: true, name: true, image: true, email: true } },
        attendances: true
      }
    })
  ])

  // 통계 계산
  const totalSessions = await prisma.programSession.count({
    where: { programId }
  })

  const attendedSessions = participant?.attendances.filter(
    a => a.status === 'PRESENT'
  ).length || 0

  const reportCount = await prisma.bookReport.count({
    where: { programId, authorId: userId }
  })

  const facilitatedCount = await prisma.sessionFacilitator.count({
    where: {
      session: { programId },
      userId
    }
  })

  const speakingTimes = await prisma.speakingTime.findMany({
    where: {
      session: { programId },
      userId
    }
  })

  const totalSpeakingTime = speakingTimes.reduce((sum, st) => sum + st.duration, 0)
  const averageSpeakingTime =
    speakingTimes.length > 0 ? Math.floor(totalSpeakingTime / speakingTimes.length) : 0

  return {
    user: participant?.user,
    cards: {
      warnings: cards.filter(c => c.type === 'WARNING'),
      praises: cards.filter(c => c.type === 'PRAISE')
    },
    notes,
    evaluation,
    stats: {
      attendanceRate:
        totalSessions > 0
          ? Math.round((attendedSessions / totalSessions) * 100)
          : 0,
      reportCount,
      facilitatedCount,
      averageSpeakingTime
    }
  }
}

// 프로그램 참가자 전체 평가 목록 조회
export async function getProgramParticipantsEvaluation(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const isOrganizer = await checkOrganizerRole(programId, session.user.id)
  if (!isOrganizer) {
    return { error: '권한이 없습니다.' }
  }

  const participants = await prisma.programParticipant.findMany({
    where: { programId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      attendances: true
    }
  })

  const totalSessions = await prisma.programSession.count({
    where: { programId }
  })

  // 각 참가자별 카드 및 평가 조회
  const participantsWithData = await Promise.all(
    participants.map(async p => {
      const [cardCounts, evaluation] = await Promise.all([
        prisma.participantCard.groupBy({
          by: ['type'],
          where: { programId, userId: p.userId },
          _count: true
        }),
        prisma.seasonEvaluation.findUnique({
          where: {
            programId_userId: { programId, userId: p.userId }
          }
        })
      ])

      const warningCount =
        cardCounts.find(c => c.type === 'WARNING')?._count || 0
      const praiseCount = cardCounts.find(c => c.type === 'PRAISE')?._count || 0

      const attendedSessions = p.attendances.filter(
        a => a.status === 'PRESENT'
      ).length

      return {
        user: p.user,
        attendanceRate:
          totalSessions > 0
            ? Math.round((attendedSessions / totalSessions) * 100)
            : 0,
        warningCount,
        praiseCount,
        evaluation: evaluation
          ? {
              overallRating: evaluation.overallRating,
              recommendation: evaluation.recommendation
            }
          : null
      }
    })
  )

  return participantsWithData.sort((a, b) => {
    // 평가 없는 사람 우선
    if (!a.evaluation && b.evaluation) return -1
    if (a.evaluation && !b.evaluation) return 1
    return 0
  })
}

// 참여 권한 확인
export async function checkParticipationPermission(
  userId: string,
  programId?: string
) {
  const permissions = await prisma.participationPermission.findMany({
    where: {
      userId,
      AND: [
        { OR: [{ programId: null }, { programId }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }
      ]
    },
    orderBy: { createdAt: 'desc' }
  })

  // 가장 엄격한 제한 적용
  const statuses = permissions.map(p => p.status)

  if (statuses.includes('BANNED')) return 'BANNED'
  if (statuses.includes('RESTRICTED')) return 'RESTRICTED'
  return 'ALLOWED'
}
