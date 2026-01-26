'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// =============================================
// Dashboard Stats
// =============================================

export async function getDashboardStats() {
  const [
    totalMembers,
    activePrograms,
    monthlyDonations,
    recentMembers,
    recentActivities,
    activeSurveys,
    pendingRefunds
  ] = await Promise.all([
    prisma.user.count(),
    prisma.program.count({ where: { status: { in: ['RECRUITING', 'ONGOING', 'OPEN', 'RECRUIT_CLOSED'] } } }),
    prisma.donation.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, origin: true, createdAt: true }
    }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    }),
    // 진행 중인 만족도 조사
    prisma.satisfactionSurvey.findMany({
      where: { status: 'SENT' },
      include: {
        program: {
          select: { id: true, title: true, type: true }
        }
      },
      orderBy: { deadline: 'asc' },
      take: 5
    }),
    // 반환 대기 중인 보증금
    prisma.programApplication.count({
      where: { depositStatus: 'REFUND_PENDING' }
    })
  ])

  // 조사별 응답률 계산
  const surveysWithRate = activeSurveys.map(survey => ({
    id: survey.id,
    title: survey.title,
    programId: survey.program.id,
    programTitle: survey.program.title,
    programType: survey.program.type,
    deadline: survey.deadline,
    targetCount: survey.targetCount,
    responseCount: survey.responseCount,
    responseRate: survey.targetCount > 0
      ? Math.round((survey.responseCount / survey.targetCount) * 100)
      : 0,
    daysLeft: Math.ceil((new Date(survey.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }))

  return {
    stats: {
      totalMembers,
      activePrograms,
      monthlyDonations: monthlyDonations._sum.amount || 0,
      pendingRefunds
    },
    recentMembers,
    recentActivities,
    activeSurveys: surveysWithRate
  }
}

// =============================================
// Members CRUD
// =============================================

export async function getMembers(params: {
  page?: number
  limit?: number
  search?: string
  origin?: string
  status?: string
}) {
  const { page = 1, limit = 10, search, origin, status } = params

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ]
  }
  if (origin) where.origin = origin
  if (status) where.status = status

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { registrations: true } }
      }
    }),
    prisma.user.count({ where })
  ])

  return { members, total, pages: Math.ceil(total / limit) }
}

export async function getMember(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { program: true }
      },
      donations: true,
      activityLogs: { take: 10, orderBy: { createdAt: 'desc' } },
      programParticipants: {
        include: {
          program: {
            select: { id: true, title: true, type: true, startDate: true, endDate: true }
          }
        },
        orderBy: { joinedAt: 'desc' }
      },
      gradeHistory: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  })
}

export async function updateMember(id: string, data: {
  name?: string
  phone?: string
  origin?: string
  status?: string
  role?: string
}) {
  const member = await prisma.user.update({
    where: { id },
    data
  })
  revalidatePath('/admin/members')
  return member
}

export async function deleteMember(id: string) {
  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/members')
}

// =============================================
// Programs CRUD
// =============================================

export async function getPrograms(params: {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  sortBy?: 'newest' | 'oldest' | 'name' | 'startDate' | 'participants'
}) {
  const { page = 1, limit = 10, search, type, status, sortBy = 'newest' } = params

  const where: any = {}
  if (search) where.title = { contains: search }
  if (type) where.type = type
  if (status) where.status = status

  // 정렬 옵션 처리
  let orderBy: any = { createdAt: 'desc' }
  switch (sortBy) {
    case 'oldest': orderBy = { createdAt: 'asc' }; break
    case 'name': orderBy = { title: 'asc' }; break
    case 'startDate': orderBy = { startDate: 'desc' }; break
    case 'participants': orderBy = { applicationCount: 'desc' }; break
    default: orderBy = { createdAt: 'desc' }
  }

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        _count: { select: { registrations: true, sessions: true } }
      }
    }),
    prisma.program.count({ where })
  ])

  return { programs, total, pages: Math.ceil(total / limit) }
}

// 프로그램 상태별 통계
export async function getProgramStats() {
  const stats = await prisma.program.groupBy({
    by: ['status'],
    _count: true
  })

  const total = await prisma.program.count()

  return { stats, total }
}

export async function getProgram(id: string) {
  return prisma.program.findUnique({
    where: { id },
    include: {
      sessions: { orderBy: { date: 'asc' } },
      registrations: {
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      books: { include: { book: true } }
    }
  })
}

export async function createProgram(data: {
  title: string
  type: string
  description?: string
  content?: string
  scheduleContent?: string
  currentBookContent?: string
  capacity?: number
  fee?: number
  feeType?: string
  feeAmount?: number
  location?: string
  isOnline?: boolean
  status?: string
  image?: string
  thumbnailSquare?: string
  recruitStartDate?: Date
  recruitEndDate?: Date
  startDate?: Date
  endDate?: Date
  applicationFormId?: string
  reportStructure?: string
}) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now()

  const program = await prisma.program.create({
    data: {
      ...data,
      slug,
      status: data.status || 'DRAFT',
      feeType: data.feeType || 'FREE',
      feeAmount: data.feeAmount || 0
    }
  })
  revalidatePath('/admin/programs')
  revalidatePath('/programs')
  return program
}

export async function updateProgram(id: string, data: {
  title?: string
  type?: string
  description?: string
  content?: string
  scheduleContent?: string
  currentBookContent?: string
  capacity?: number
  fee?: number
  feeType?: string
  feeAmount?: number
  location?: string
  isOnline?: boolean
  status?: string
  image?: string
  thumbnailSquare?: string
  recruitStartDate?: Date | null
  recruitEndDate?: Date | null
  startDate?: Date | null
  endDate?: Date | null
  applicationFormId?: string | null
}) {
  const program = await prisma.program.update({
    where: { id },
    data
  })
  revalidatePath('/admin/programs')
  revalidatePath('/programs')
  revalidatePath(`/programs/${program.slug}`)
  return program
}

export async function deleteProgram(id: string) {
  await prisma.program.delete({ where: { id } })
  revalidatePath('/admin/programs')
}

export async function updateProgramReportStructure(
  programId: string,
  reportStructure: string | null
) {
  const program = await prisma.program.update({
    where: { id: programId },
    data: {
      reportStructure: reportStructure === null
        ? { set: null } as any
        : reportStructure
    }
  })
  revalidatePath('/admin/programs')
  revalidatePath(`/admin/programs/${programId}`)
  return program
}

// =============================================
// Registration Management
// =============================================

export async function updateRegistrationStatus(
  registrationId: string,
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED'
) {
  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: { status },
    include: {
      user: true,
      program: true
    }
  })

  // 활동 로그 기록
  await prisma.activityLog.create({
    data: {
      userId: registration.userId,
      action: status === 'APPROVED' ? 'REGISTRATION_APPROVED' :
              status === 'REJECTED' ? 'REGISTRATION_REJECTED' : 'REGISTRATION_CANCELLED',
      target: registration.program.title,
      targetId: registration.programId
    }
  })

  revalidatePath(`/admin/programs/${registration.programId}`)
  return registration
}

export async function bulkUpdateRegistrationStatus(
  registrationIds: string[],
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED'
) {
  const results = await Promise.all(
    registrationIds.map(id => updateRegistrationStatus(id, status))
  )
  return results
}

// =============================================
// Notices CRUD
// =============================================

export async function getNotices(params: {
  page?: number
  limit?: number
  search?: string
}) {
  const { page = 1, limit = 10, search } = params

  const where: any = {}
  if (search) where.title = { contains: search }

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.notice.count({ where })
  ])

  return { notices, total, pages: Math.ceil(total / limit) }
}

export async function createNotice(data: {
  title: string
  content: string
  isPinned?: boolean
  isPublic?: boolean
}) {
  const notice = await prisma.notice.create({ data })
  revalidatePath('/admin/contents/notices')
  return notice
}

export async function updateNotice(id: string, data: {
  title?: string
  content?: string
  isPinned?: boolean
  isPublic?: boolean
}) {
  const notice = await prisma.notice.update({
    where: { id },
    data
  })
  revalidatePath('/admin/contents/notices')
  return notice
}

export async function deleteNotice(id: string) {
  await prisma.notice.delete({ where: { id } })
  revalidatePath('/admin/contents/notices')
}

// =============================================
// Finance - Donations
// =============================================

export async function getDonations(params: {
  page?: number
  limit?: number
  status?: string
}) {
  const { page = 1, limit = 10, status } = params

  const where: any = {}
  if (status) where.status = status

  const [donations, total, summary] = await Promise.all([
    prisma.donation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    }),
    prisma.donation.count({ where }),
    prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true
    })
  ])

  return {
    donations,
    total,
    pages: Math.ceil(total / limit),
    summary: {
      totalAmount: summary._sum.amount || 0,
      totalCount: summary._count
    }
  }
}

export async function updateDonationStatus(id: string, status: string) {
  const donation = await prisma.donation.update({
    where: { id },
    data: { status }
  })
  revalidatePath('/admin/finance/donations')
  return donation
}

// =============================================
// Finance - Transactions (NGO 회계 시스템)
// =============================================

export async function getTransactions(params: {
  page?: number
  limit?: number
  type?: string
  fundId?: string
  startDate?: Date
  endDate?: Date
}) {
  const { page = 1, limit = 10, type, fundId, startDate, endDate } = params

  const where: any = {}
  if (type) where.type = type
  if (fundId) where.fundId = fundId
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const [transactions, total, summary] = await Promise.all([
    prisma.financeTransaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        fund: true,
        financeAccount: true,
        receipt: true
      }
    }),
    prisma.financeTransaction.count({ where }),
    prisma.financeTransaction.groupBy({
      by: ['type'],
      _sum: { amount: true }
    })
  ])

  const income = summary.find(s => s.type === 'INCOME')?._sum.amount || 0
  const expense = summary.find(s => s.type === 'EXPENSE')?._sum.amount || 0

  return {
    transactions,
    total,
    pages: Math.ceil(total / limit),
    summary: { income, expense, balance: income - expense }
  }
}

export async function createFinanceTransaction(data: {
  date: Date
  type: string
  fundId: string
  financeAccountId: string
  amount: number
  description: string
  vendor?: string
  paymentMethod?: string
  evidenceType?: string
  note?: string
  createdBy?: string
}) {
  const transaction = await prisma.$transaction(async (tx) => {
    const newTx = await tx.financeTransaction.create({
      data,
      include: { fund: true, financeAccount: true }
    })

    // 기금 잔액 업데이트
    const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount
    await tx.fund.update({
      where: { id: data.fundId },
      data: { balance: { increment: balanceChange } }
    })

    return newTx
  })

  revalidatePath('/admin/finance/transactions')
  return transaction
}

// =============================================
// Finance - Accounts (계정과목)
// =============================================

export async function getFinanceAccounts(params?: {
  type?: string
  category?: string
  isActive?: boolean
}) {
  const where: any = {}
  if (params?.type) where.type = params.type
  if (params?.category) where.category = params.category
  if (params?.isActive !== undefined) where.isActive = params.isActive

  return prisma.financeAccount.findMany({
    where,
    orderBy: { sortOrder: 'asc' }
  })
}

// =============================================
// Finance - Funds (기금)
// =============================================

export async function getFunds(params?: {
  type?: string
  isActive?: boolean
}) {
  const where: any = {}
  if (params?.type) where.type = params.type
  if (params?.isActive !== undefined) where.isActive = params.isActive

  return prisma.fund.findMany({
    where,
    include: {
      financeProject: true,
      _count: { select: { transactions: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createFund(data: {
  name: string
  type: string
  description?: string
  financeProjectId?: string
}) {
  const fund = await prisma.fund.create({
    data: { ...data, balance: 0 }
  })
  revalidatePath('/admin/finance/funds')
  return fund
}

// =============================================
// Finance - Summary (재무 요약)
// =============================================

export async function getFinanceSummary(year?: number) {
  const targetYear = year || new Date().getFullYear()
  const startDate = new Date(targetYear, 0, 1)
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59)

  const [incomeTotal, expenseTotal, funds, recentTx, monthlyData] = await Promise.all([
    prisma.financeTransaction.aggregate({
      where: { type: 'INCOME', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    }),
    prisma.financeTransaction.aggregate({
      where: { type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    }),
    prisma.fund.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true, balance: true }
    }),
    prisma.financeTransaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { financeAccount: true, fund: true }
    }),
    prisma.financeTransaction.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { date: true, type: true, amount: true }
    })
  ])

  // 월별 데이터 계산
  const monthlyTrend: { month: number; income: number; expense: number }[] = []
  for (let i = 1; i <= 12; i++) {
    monthlyTrend.push({ month: i, income: 0, expense: 0 })
  }
  monthlyData.forEach(tx => {
    const month = tx.date.getMonth()
    if (tx.type === 'INCOME') {
      monthlyTrend[month].income += tx.amount
    } else {
      monthlyTrend[month].expense += tx.amount
    }
  })

  return {
    period: { year: targetYear },
    totals: {
      income: incomeTotal._sum.amount || 0,
      expense: expenseTotal._sum.amount || 0,
      balance: (incomeTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0)
    },
    funds,
    recentTransactions: recentTx,
    monthlyTrend
  }
}

// =============================================
// Activity Logging
// =============================================

export async function logActivity(data: {
  userId?: string
  action: string
  target?: string
  targetId?: string
  details?: string
}) {
  return prisma.activityLog.create({ data })
}

// =============================================
// Program Participants (프로그램 참가자)
// =============================================

export async function getProgramParticipants(programId: string) {
  const participants = await prisma.programParticipant.findMany({
    where: { programId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      attendances: { include: { session: true } },
      reports: { where: { status: 'SUBMITTED' } }
    },
    orderBy: { joinedAt: 'asc' }
  })

  return participants.map(p => {
    const totalSessions = p.attendances.length
    const presentCount = p.attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
    const reportCount = p.reports.length

    return {
      ...p,
      stats: {
        totalSessions,
        presentCount,
        attendanceRate: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
        reportCount,
        reportRate: totalSessions > 0 ? Math.round((reportCount / totalSessions) * 100) : 0
      }
    }
  })
}

export async function addParticipant(programId: string, userId: string, depositAmount?: number) {
  const participant = await prisma.programParticipant.create({
    data: {
      programId,
      userId,
      depositAmount: depositAmount || 0,
      depositStatus: depositAmount ? 'UNPAID' : 'NONE'
    },
    include: { user: { select: { id: true, name: true, email: true } } }
  })
  revalidatePath(`/admin/programs/${programId}`)
  return participant
}

// =============================================
// Program Sessions (프로그램 세션)
// =============================================

export async function getProgramSessions(programId: string) {
  return prisma.programSession.findMany({
    where: { programId },
    include: {
      _count: { select: { attendances: true, reports: true } }
    },
    orderBy: { sessionNo: 'asc' }
  })
}

export async function createProgramSession(programId: string, data: {
  sessionNo: number
  date: Date
  startTime?: string
  endTime?: string
  title?: string
  bookTitle?: string
  bookRange?: string
  location?: string
  description?: string
  reportDeadline?: Date
}) {
  const crypto = await import('crypto')
  const qrCode = crypto.randomBytes(16).toString('hex')

  const session = await prisma.programSession.create({
    data: { ...data, programId, qrCode }
  })

  // 모든 활성 참가자에게 출석 레코드 생성
  const participants = await prisma.programParticipant.findMany({
    where: { programId, status: 'ACTIVE' }
  })

  if (participants.length > 0) {
    // SQLite doesn't support skipDuplicates, so we create records individually
    for (const p of participants) {
      const existing = await prisma.programAttendance.findFirst({
        where: { sessionId: session.id, participantId: p.id }
      })
      if (!existing) {
        await prisma.programAttendance.create({
          data: {
            sessionId: session.id,
            participantId: p.id,
            status: 'ABSENT'
          }
        })
      }
    }
  }

  revalidatePath(`/admin/programs/${programId}`)
  return session
}

// =============================================
// Attendance (출석)
// =============================================

export async function getSessionAttendance(sessionId: string) {
  return prisma.programAttendance.findMany({
    where: { sessionId },
    include: {
      participant: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } }
      }
    },
    orderBy: { participant: { user: { name: 'asc' } } }
  })
}

export async function updateAttendance(
  sessionId: string,
  participantId: string,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
) {
  const attendance = await prisma.programAttendance.upsert({
    where: { sessionId_participantId: { sessionId, participantId } },
    update: {
      status,
      checkedAt: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
      checkMethod: 'MANUAL'
    },
    create: {
      sessionId,
      participantId,
      status,
      checkedAt: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
      checkMethod: 'MANUAL'
    }
  })

  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    select: { programId: true }
  })
  if (session) revalidatePath(`/admin/programs/${session.programId}`)

  return attendance
}

// =============================================
// Deposit (보증금)
// =============================================

export async function getDepositSetting(programId: string) {
  return prisma.depositSetting.findUnique({ where: { programId } })
}

export async function updateDepositSetting(programId: string, data: {
  isEnabled?: boolean
  totalSessions: number
  depositAmount: number
  conditionType: string
  attendanceRate?: number
  reportRate?: number
}) {
  const setting = await prisma.depositSetting.upsert({
    where: { programId },
    update: data,
    create: { programId, ...data }
  })
  revalidatePath(`/admin/programs/${programId}`)
  return setting
}

export async function settleDeposit(participantId: string, data: {
  returnAmount?: number
  forfeitAmount?: number
  returnMethod?: string
  note?: string
}) {
  const participant = await prisma.programParticipant.update({
    where: { id: participantId },
    data: {
      returnAmount: data.returnAmount,
      forfeitAmount: data.forfeitAmount,
      returnMethod: data.returnMethod,
      settleNote: data.note,
      settledAt: new Date(),
      depositStatus: data.returnAmount && data.returnAmount > 0 ? 'RETURNED' :
                     data.forfeitAmount && data.forfeitAmount > 0 ? 'FORFEITED' : 'PAID'
    }
  })
  revalidatePath(`/admin/programs/${participant.programId}`)
  return participant
}

// =============================================
// Reports (독후감/보고서)
// =============================================

export async function getProgramReports(programId: string, sessionId?: string) {
  const where: any = { programId }
  if (sessionId) where.sessionId = sessionId

  return prisma.programReport.findMany({
    where,
    include: {
      session: true,
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// =============================================
// Finance Donations (기부금)
// =============================================

export async function getFinanceDonations(params: {
  page?: number
  limit?: number
  type?: string
}) {
  const { page = 1, limit = 20, type } = params
  const where: any = {}
  if (type) where.type = type

  const [donations, total, summary] = await Promise.all([
    prisma.financeDonation.findMany({
      where,
      include: { donor: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' }
    }),
    prisma.financeDonation.count({ where }),
    prisma.financeDonation.aggregate({
      _sum: { amount: true },
      _count: true
    })
  ])

  return {
    donations,
    total,
    pages: Math.ceil(total / limit),
    summary: { totalAmount: summary._sum.amount || 0, totalCount: summary._count }
  }
}

export async function createFinanceDonation(data: {
  donorName: string
  donorType?: string
  amount: number
  date: Date
  type?: string
  designation?: string
  note?: string
}) {
  // 기부자 생성 또는 찾기
  let donor = await prisma.donor.findFirst({
    where: { name: data.donorName }
  })

  if (!donor) {
    donor = await prisma.donor.create({
      data: { name: data.donorName, type: data.donorType || 'INDIVIDUAL' }
    })
  }

  const donation = await prisma.financeDonation.create({
    data: {
      donorId: donor.id,
      donorName: data.donorName,
      donorType: data.donorType || 'INDIVIDUAL',
      amount: data.amount,
      date: data.date,
      type: data.type || 'ONETIME',
      designation: data.designation,
      note: data.note
    }
  })

  // 기부자 통계 업데이트
  await prisma.donor.update({
    where: { id: donor.id },
    data: {
      totalDonation: { increment: data.amount },
      donationCount: { increment: 1 },
      lastDonationAt: data.date
    }
  })

  revalidatePath('/admin/finance/donations')
  return donation
}
