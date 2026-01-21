'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// 결석 신청 제출
export async function submitAbsenceRequest(data: {
  sessionId: string
  reason: string
  attachment?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  // 해당 세션의 참가자인지 확인
  const programSession = await prisma.programSession.findUnique({
    where: { id: data.sessionId },
    include: {
      program: {
        include: {
          participants: {
            where: { userId: session.user.id }
          }
        }
      }
    }
  })

  if (!programSession) {
    throw new Error('존재하지 않는 세션입니다.')
  }

  const participant = programSession.program.participants[0]
  if (!participant) {
    throw new Error('해당 프로그램의 참가자가 아닙니다.')
  }

  // 이미 결석 신청이 있는지 확인
  const existingRequest = await prisma.absenceRequest.findUnique({
    where: {
      sessionId_participantId: {
        sessionId: data.sessionId,
        participantId: participant.id
      }
    }
  })

  if (existingRequest) {
    throw new Error('이미 결석 신청이 존재합니다.')
  }

  // 세션 날짜 확인 (이미 지난 세션인지)
  const now = new Date()
  if (programSession.date < now) {
    throw new Error('이미 지난 세션에는 결석 신청을 할 수 없습니다.')
  }

  const absenceRequest = await prisma.absenceRequest.create({
    data: {
      sessionId: data.sessionId,
      participantId: participant.id,
      userId: session.user.id,
      reason: data.reason,
      attachment: data.attachment
    }
  })

  revalidatePath(`/mypage/programs/${programSession.programId}`)

  return absenceRequest
}

// 내 결석 신청 조회
export async function getMyAbsenceRequests(programId?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const where: any = {
    userId: session.user.id
  }

  if (programId) {
    where.session = {
      programId
    }
  }

  const requests = await prisma.absenceRequest.findMany({
    where,
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          program: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return requests
}

// 관리자용: 결석 신청 목록 조회
export async function getAbsenceRequests(params: {
  programId?: string
  sessionId?: string
  status?: string
  page?: number
  limit?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  // 권한 확인 (관리자 또는 운영진)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // 운영진 확인
  let isOrganizer = false
  if (params.programId && !isAdmin) {
    const membership = await prisma.programMembership.findUnique({
      where: {
        programId_userId: {
          programId: params.programId,
          userId: session.user.id
        }
      }
    })
    isOrganizer = membership?.role === 'ORGANIZER'
  }

  if (!isAdmin && !isOrganizer) {
    throw new Error('권한이 없습니다.')
  }

  const where: any = {}

  if (params.programId) {
    where.session = { programId: params.programId }
  }

  if (params.sessionId) {
    where.sessionId = params.sessionId
  }

  if (params.status) {
    where.status = params.status
  }

  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const [requests, total] = await Promise.all([
    prisma.absenceRequest.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            sessionNo: true,
            title: true,
            date: true,
            program: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.absenceRequest.count({ where })
  ])

  return {
    requests,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

// 결석 신청 승인
export async function approveAbsenceRequest(
  requestId: string,
  note?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const request = await prisma.absenceRequest.findUnique({
    where: { id: requestId },
    include: {
      session: {
        include: { program: true }
      }
    }
  })

  if (!request) {
    throw new Error('결석 신청을 찾을 수 없습니다.')
  }

  // 권한 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  if (!isAdmin) {
    const membership = await prisma.programMembership.findUnique({
      where: {
        programId_userId: {
          programId: request.session.programId,
          userId: session.user.id
        }
      }
    })
    if (membership?.role !== 'ORGANIZER') {
      throw new Error('권한이 없습니다.')
    }
  }

  const updated = await prisma.absenceRequest.update({
    where: { id: requestId },
    data: {
      status: 'APPROVED',
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNote: note
    }
  })

  // 출석 상태를 EXCUSED(사유 결석)로 업데이트
  await prisma.programAttendance.upsert({
    where: {
      sessionId_participantId: {
        sessionId: request.sessionId,
        participantId: request.participantId
      }
    },
    update: {
      status: 'EXCUSED',
      note: `결석 신청 승인: ${request.reason}`
    },
    create: {
      sessionId: request.sessionId,
      participantId: request.participantId,
      status: 'EXCUSED',
      note: `결석 신청 승인: ${request.reason}`
    }
  })

  // 알림 발송 (선택적)
  try {
    await prisma.adminNotification.create({
      data: {
        type: 'ABSENCE_APPROVED',
        title: '결석 신청 승인',
        message: `${request.session.sessionNo}회차 결석 신청이 승인되었습니다.`,
        data: JSON.stringify({
          requestId: request.id,
          userId: request.userId
        })
      }
    })
  } catch (error) {
    console.error('알림 생성 실패:', error)
  }

  revalidatePath(`/admin/programs/${request.session.programId}/absences`)

  return updated
}

// 결석 신청 반려
export async function rejectAbsenceRequest(
  requestId: string,
  reason: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const request = await prisma.absenceRequest.findUnique({
    where: { id: requestId },
    include: {
      session: {
        include: { program: true }
      }
    }
  })

  if (!request) {
    throw new Error('결석 신청을 찾을 수 없습니다.')
  }

  // 권한 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  if (!isAdmin) {
    const membership = await prisma.programMembership.findUnique({
      where: {
        programId_userId: {
          programId: request.session.programId,
          userId: session.user.id
        }
      }
    })
    if (membership?.role !== 'ORGANIZER') {
      throw new Error('권한이 없습니다.')
    }
  }

  const updated = await prisma.absenceRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNote: reason
    }
  })

  revalidatePath(`/admin/programs/${request.session.programId}/absences`)

  return updated
}

// 결석 신청 취소 (사용자)
export async function cancelAbsenceRequest(requestId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const request = await prisma.absenceRequest.findUnique({
    where: { id: requestId }
  })

  if (!request) {
    throw new Error('결석 신청을 찾을 수 없습니다.')
  }

  if (request.userId !== session.user.id) {
    throw new Error('본인의 결석 신청만 취소할 수 있습니다.')
  }

  if (request.status !== 'PENDING') {
    throw new Error('대기 중인 신청만 취소할 수 있습니다.')
  }

  await prisma.absenceRequest.delete({
    where: { id: requestId }
  })

  revalidatePath('/mypage')

  return { success: true }
}

// 결석 신청 상세 조회
export async function getAbsenceRequestDetail(requestId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const request = await prisma.absenceRequest.findUnique({
    where: { id: requestId },
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          program: {
            select: {
              id: true,
              title: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      },
      reviewer: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  if (!request) {
    throw new Error('결석 신청을 찾을 수 없습니다.')
  }

  // 본인이거나 관리자/운영진만 조회 가능
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isOwner = request.userId === session.user.id

  if (!isAdmin && !isOwner) {
    const membership = await prisma.programMembership.findUnique({
      where: {
        programId_userId: {
          programId: request.session.program.id,
          userId: session.user.id
        }
      }
    })
    if (membership?.role !== 'ORGANIZER') {
      throw new Error('권한이 없습니다.')
    }
  }

  return request
}
