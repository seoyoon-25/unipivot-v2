'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { matchApplicant } from '@/lib/services/member-matching'
import { revalidatePath } from 'next/cache'

interface ApplicationData {
  programId: string
  name: string
  email: string
  phone: string
  birthDate?: string
  birthYear?: number | null
  gender?: string
  organization?: string
  origin?: string
  hometown?: string
  residence?: string
  motivation?: string
  selfIntro?: string
  referralSource?: string
  referrerName?: string
  agreedToRules: boolean
  agreedToTerms: boolean
  agreedToPrivacy: boolean
  facePrivacy?: boolean
}

export async function submitApplication(data: ApplicationData) {
  const session = await getServerSession(authOptions)

  // Get program
  const program = await prisma.program.findUnique({
    where: { id: data.programId },
    include: {
      _count: {
        select: {
          applications: { where: { status: 'APPROVED' } }
        }
      }
    },
  })

  if (!program) {
    return { success: false, error: '프로그램을 찾을 수 없습니다.' }
  }

  if (!program.applicationOpen && program.status !== 'PUBLISHED') {
    return { success: false, error: '신청이 마감되었습니다.' }
  }

  // Normalize phone number
  const normalizedPhone = data.phone.replace(/[^0-9]/g, '')

  // Match with existing member
  const matchResult = await matchApplicant({
    name: data.name,
    email: data.email,
    phone: normalizedPhone,
    birthYear: data.birthYear ?? undefined,
    hometown: data.hometown,
  })

  // 로그인한 User와 연동된 Member 확인 (matchResult에서 못 찾은 경우)
  let linkedMember = matchResult.member
  if (!linkedMember && session?.user?.id) {
    const userLinkedMember = await prisma.member.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        memberCode: true,
        name: true,
        status: true,
        grade: true,
        email: true,
        phone: true,
        stats: {
          select: {
            attendanceRate: true,
            totalPrograms: true,
            noShowCount: true,
          },
        },
      },
    })
    if (userLinkedMember) {
      linkedMember = userLinkedMember
    }
  }

  // Check if blocked and auto-reject is enabled
  if (matchResult.alertLevel === 'BLOCKED' && program.autoRejectBlocked) {
    return { success: false, error: '신청이 제한되었습니다. 문의: unipivot@gmail.com' }
  }

  // Check for duplicate application
  const existingApplication = await prisma.programApplication.findFirst({
    where: {
      programId: data.programId,
      OR: [
        { email: data.email },
        { phone: normalizedPhone },
        ...(linkedMember ? [{ memberId: linkedMember.id }] : []),
        ...(session?.user?.id ? [{ userId: session.user.id }] : []),
      ],
    },
  })

  if (existingApplication) {
    return { success: false, error: '이미 신청하셨습니다.' }
  }

  // Determine status
  let status = 'PENDING'
  const isFull = program.maxParticipants && program._count.applications >= program.maxParticipants

  if (isFull) {
    status = 'WAITLIST'
  } else if (matchResult.alertLevel === 'BLOCKED' || matchResult.alertLevel === 'WARNING') {
    status = 'PENDING' // Needs review
  } else if (
    (program.autoApproveVVIP && linkedMember?.grade === 'VVIP') ||
    (program.autoApproveVIP && linkedMember?.grade === 'VIP')
  ) {
    status = 'APPROVED' // Auto-approve VIP
  }

  // Create application
  const application = await prisma.programApplication.create({
    data: {
      programId: data.programId,

      name: data.name,
      email: data.email,
      phone: normalizedPhone,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      birthYear: data.birthYear,
      gender: data.gender,
      organization: data.organization,
      origin: data.origin,
      hometown: data.hometown,
      residence: data.residence,

      motivation: data.motivation,
      selfIntro: data.selfIntro,
      referralSource: data.referralSource,
      referrerName: data.referrerName,

      agreedToRules: data.agreedToRules,
      agreedToTerms: data.agreedToTerms,
      agreedToPrivacy: data.agreedToPrivacy,
      facePrivacy: data.facePrivacy || false,

      userId: session?.user?.id,
      memberId: linkedMember?.id,

      matchedMemberId: linkedMember?.id,
      matchedMemberCode: linkedMember?.memberCode,
      memberGrade: linkedMember?.grade,
      memberStatus: linkedMember?.status,
      alertLevel: matchResult.alertLevel,
      matchType: matchResult.matchType,

      status,
      depositAmount: program.depositAmountSetting,
    },
  })

  // Update application count
  await prisma.program.update({
    where: { id: data.programId },
    data: { applicationCount: { increment: 1 } },
  })

  // Send admin notification for alert cases
  if (matchResult.alertLevel === 'BLOCKED' || matchResult.alertLevel === 'WARNING') {
    await prisma.adminNotification.create({
      data: {
        type: 'ALERT_APPLICATION',
        title: `${matchResult.alertLevel === 'BLOCKED' ? '차단' : '경고'} 회원 신청`,
        message: `${data.name}님이 ${program.title}에 신청했습니다.`,
        data: JSON.stringify({
          applicationId: application.id,
          alertLevel: matchResult.alertLevel,
          memberCode: linkedMember?.memberCode,
        }),
      },
    })
  }

  revalidatePath(`/admin/programs/${program.id}/applications`)
  revalidatePath('/admin/notifications')

  return {
    success: true,
    status,
    applicationId: application.id,
  }
}

// Check member status for non-logged-in users
export async function checkMemberStatus(data: {
  name: string
  email?: string
  phone?: string
  birthYear?: number
}) {
  const result = await matchApplicant(data)

  return {
    matched: result.matched,
    alertLevel: result.alertLevel,
    memberGrade: result.member?.grade,
  }
}

// Cancel application
export async function cancelApplication(applicationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  const application = await prisma.programApplication.findFirst({
    where: {
      id: applicationId,
      userId: session.user.id,
      status: { in: ['PENDING', 'WAITLIST'] },
    },
  })

  if (!application) {
    return { success: false, error: '취소할 수 없는 신청입니다.' }
  }

  await prisma.programApplication.update({
    where: { id: applicationId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  })

  revalidatePath('/mypage/applications')
  revalidatePath(`/admin/programs/${application.programId}/applications`)

  return { success: true }
}

// Get user's applications
export async function getMyApplications() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { current: [], past: [] }
  }

  const applications = await prisma.programApplication.findMany({
    where: { userId: session.user.id },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  })

  // Separate current and past applications
  const now = new Date()
  const current = applications.filter((app) => {
    const isOngoing = !app.program.endDate || new Date(app.program.endDate) >= now
    const isActive = ['PENDING', 'APPROVED', 'WAITLIST'].includes(app.status)
    return isOngoing || isActive
  })

  const past = applications.filter((app) => {
    const isPast = app.program.endDate && new Date(app.program.endDate) < now
    const isClosed = ['REJECTED', 'CANCELLED'].includes(app.status) ||
      (app.status === 'APPROVED' && isPast)
    return isClosed
  })

  return { current, past }
}

// Admin: Approve application
export async function approveApplication(applicationId: string, note?: string) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { success: false, error: '권한이 없습니다.' }
  }

  const application = await prisma.programApplication.findUnique({
    where: { id: applicationId },
    include: { program: true },
  })

  if (!application) {
    return { success: false, error: '신청을 찾을 수 없습니다.' }
  }

  await prisma.programApplication.update({
    where: { id: applicationId },
    data: {
      status: 'APPROVED',
      processedBy: session.user.name || session.user.email,
      processedAt: new Date(),
      approvalNote: note,
    },
  })

  revalidatePath(`/admin/programs/${application.programId}/applications`)

  return { success: true }
}

// Admin: Reject application
export async function rejectApplication(applicationId: string, reason: string) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { success: false, error: '권한이 없습니다.' }
  }

  const application = await prisma.programApplication.findUnique({
    where: { id: applicationId },
    include: { program: true },
  })

  if (!application) {
    return { success: false, error: '신청을 찾을 수 없습니다.' }
  }

  await prisma.programApplication.update({
    where: { id: applicationId },
    data: {
      status: 'REJECTED',
      processedBy: session.user.name || session.user.email,
      processedAt: new Date(),
      rejectReason: reason,
    },
  })

  revalidatePath(`/admin/programs/${application.programId}/applications`)

  return { success: true }
}

// Admin: Bulk approve applications
export async function bulkApproveApplications(applicationIds: string[]) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { success: false, error: '권한이 없습니다.' }
  }

  await prisma.programApplication.updateMany({
    where: { id: { in: applicationIds } },
    data: {
      status: 'APPROVED',
      processedBy: session.user.name || session.user.email,
      processedAt: new Date(),
    },
  })

  revalidatePath('/admin/programs')

  return { success: true, count: applicationIds.length }
}

// Admin: Bulk reject applications
export async function bulkRejectApplications(applicationIds: string[], reason: string) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { success: false, error: '권한이 없습니다.' }
  }

  await prisma.programApplication.updateMany({
    where: { id: { in: applicationIds } },
    data: {
      status: 'REJECTED',
      processedBy: session.user.name || session.user.email,
      processedAt: new Date(),
      rejectReason: reason,
    },
  })

  revalidatePath('/admin/programs')

  return { success: true, count: applicationIds.length }
}

// Admin: Confirm deposit paid
export async function confirmDepositPaid(applicationId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { success: false, error: '권한이 없습니다.' }
  }

  await prisma.programApplication.update({
    where: { id: applicationId },
    data: {
      depositPaid: true,
      depositPaidAt: new Date(),
      depositStatus: 'PAID',
    },
  })

  revalidatePath('/admin/programs')

  return { success: true }
}

// Get program applications (for admin)
export async function getProgramApplications(programId: string, options?: {
  status?: string
  alertLevel?: string
  page?: number
  limit?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('권한이 없습니다.')
  }

  const { status, alertLevel, page = 1, limit = 50 } = options || {}

  const where: any = { programId }
  if (status) where.status = status
  if (alertLevel) where.alertLevel = alertLevel

  const [applications, total, statusCounts] = await Promise.all([
    prisma.programApplication.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            memberCode: true,
            grade: true,
            status: true,
            stats: {
              select: {
                totalPrograms: true,
                attendanceRate: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { alertLevel: 'desc' }, // BLOCKED, WARNING first
        { appliedAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.programApplication.count({ where }),
    prisma.programApplication.groupBy({
      by: ['status'],
      where: { programId },
      _count: { id: true },
    }),
  ])

  // Get alert counts
  const alertCounts = await prisma.programApplication.groupBy({
    by: ['alertLevel'],
    where: { programId, alertLevel: { in: ['BLOCKED', 'WARNING', 'WATCH'] } },
    _count: { id: true },
  })

  return {
    applications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id])),
    alertCounts: Object.fromEntries(alertCounts.map((a) => [a.alertLevel, a._count.id])),
  }
}

// Export applications as CSV data
export async function exportApplicationsCSV(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('권한이 없습니다.')
  }

  const applications = await prisma.programApplication.findMany({
    where: { programId },
    include: {
      member: {
        select: {
          memberCode: true,
          grade: true,
        },
      },
    },
    orderBy: { appliedAt: 'asc' },
  })

  return applications.map((app, index) => ({
    번호: index + 1,
    이름: app.name,
    이메일: app.email,
    연락처: app.phone,
    출신: app.origin || '',
    고향: app.hometown || '',
    거주지: app.residence || '',
    소속: app.organization || '',
    상태: getStatusLabel(app.status),
    회원등급: app.memberGrade || '신규',
    회원번호: app.matchedMemberCode || '',
    보증금입금: app.depositPaid ? 'O' : 'X',
    신청일: app.appliedAt.toISOString().split('T')[0],
    신청동기: app.motivation || '',
    알게된경로: app.referralSource || '',
    추천인: app.referrerName || '',
  }))
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: '검토중',
    APPROVED: '승인',
    REJECTED: '거절',
    WAITLIST: '대기',
    CANCELLED: '취소',
  }
  return labels[status] || status
}
