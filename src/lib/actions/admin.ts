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
    recentActivities
  ] = await Promise.all([
    prisma.user.count(),
    prisma.program.count({ where: { status: { in: ['OPEN', 'CLOSED'] } } }),
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
    })
  ])

  return {
    stats: {
      totalMembers,
      activePrograms,
      monthlyDonations: monthlyDonations._sum.amount || 0
    },
    recentMembers,
    recentActivities
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
      activityLogs: { take: 10, orderBy: { createdAt: 'desc' } }
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
}) {
  const { page = 1, limit = 10, search, type, status } = params

  const where: any = {}
  if (search) where.title = { contains: search }
  if (type) where.type = type
  if (status) where.status = status

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { registrations: true } }
      }
    }),
    prisma.program.count({ where })
  ])

  return { programs, total, pages: Math.ceil(total / limit) }
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
  capacity?: number
  fee?: number
  location?: string
  isOnline?: boolean
  startDate?: Date
  endDate?: Date
}) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now()

  const program = await prisma.program.create({
    data: { ...data, slug, status: 'DRAFT' }
  })
  revalidatePath('/admin/programs')
  return program
}

export async function updateProgram(id: string, data: {
  title?: string
  type?: string
  description?: string
  content?: string
  capacity?: number
  fee?: number
  location?: string
  isOnline?: boolean
  status?: string
  startDate?: Date
  endDate?: Date
}) {
  const program = await prisma.program.update({
    where: { id },
    data
  })
  revalidatePath('/admin/programs')
  return program
}

export async function deleteProgram(id: string) {
  await prisma.program.delete({ where: { id } })
  revalidatePath('/admin/programs')
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
// Finance - Transactions
// =============================================

export async function getTransactions(params: {
  page?: number
  limit?: number
  type?: string
  startDate?: Date
  endDate?: Date
}) {
  const { page = 1, limit = 10, type, startDate, endDate } = params

  const where: any = {}
  if (type) where.type = type
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const [transactions, total, summary] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' }
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
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

export async function createTransaction(data: {
  type: string
  category?: string
  amount: number
  description?: string
  date: Date
}) {
  const transaction = await prisma.transaction.create({ data })
  revalidatePath('/admin/finance/transactions')
  return transaction
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
