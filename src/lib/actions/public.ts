'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// =============================================
// Home Page Data
// =============================================

export async function getHomePageData() {
  try {
    const [programs, notices, stats] = await Promise.all([
      // 최근 프로그램 (모집중, 진행중)
      prisma.program.findMany({
        where: {
          status: { in: ['RECRUITING', 'RECRUIT_CLOSED', 'ONGOING', 'OPEN', 'CLOSED'] }
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          thumbnailSquare: true,
          isOnline: true,
          feeType: true,
          feeAmount: true,
          status: true,
          recruitStartDate: true,
          recruitEndDate: true,
          startDate: true,
          endDate: true,
          likeCount: true,
          applicationCount: true,
          capacity: true,
          location: true,
          _count: { select: { registrations: true, applications: true } }
        }
      }).catch(() => []), // 에러시 빈 배열 반환
      // 최근 공지사항
      prisma.notice.findMany({
        where: { isPublic: true },
        take: 5,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
      }).catch(() => []), // 에러시 빈 배열 반환
      // 통계
      Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.program.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
        prisma.registration.count({ where: { status: 'APPROVED' } }).catch(() => 0)
      ])
    ])

    return {
      programs: programs || [],
      notices: notices || [],
      stats: {
        members: stats[0] || 0,
        completedPrograms: stats[1] || 0,
        totalParticipations: stats[2] || 0
      }
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)

    // 에러 발생시 기본값 반환
    return {
      programs: [],
      notices: [],
      stats: {
        members: 0,
        completedPrograms: 0,
        totalParticipations: 0
      }
    }
  }
}

// =============================================
// Programs
// =============================================

export async function getProgramsByType(type: string) {
  return prisma.program.findMany({
    where: { type },
    orderBy: [
      { displayOrder: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      _count: { select: { registrations: { where: { status: 'APPROVED' } } } }
    }
  })
}

export async function getOpenPrograms() {
  return prisma.program.findMany({
    where: { status: { in: ['OPEN', 'CLOSED'] } },
    orderBy: { startDate: 'asc' },
    include: {
      _count: { select: { registrations: { where: { status: 'APPROVED' } } } }
    }
  })
}

export async function getProgramBySlug(slug: string) {
  return prisma.program.findUnique({
    where: { slug },
    include: {
      sessions: { orderBy: { date: 'asc' } },
      books: { include: { book: true } },
      _count: { select: { registrations: { where: { status: 'APPROVED' } } } }
    }
  })
}

export async function getProgramById(id: string) {
  return prisma.program.findUnique({
    where: { id },
    include: {
      sessions: { orderBy: { date: 'asc' } },
      books: { include: { book: true } },
      _count: { select: { registrations: { where: { status: 'APPROVED' } } } }
    }
  })
}

// =============================================
// Notices
// =============================================

export async function getPublicNotices(params: { page?: number; limit?: number }) {
  const { page = 1, limit = 10 } = params

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where: { isPublic: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.notice.count({ where: { isPublic: true } })
  ])

  return { notices, total, pages: Math.ceil(total / limit) }
}

export async function getNoticeById(id: string) {
  // 조회수 증가
  await prisma.notice.update({
    where: { id },
    data: { views: { increment: 1 } }
  })

  return prisma.notice.findUnique({ where: { id } })
}

// =============================================
// User / Member
// =============================================

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      registrations: {
        include: { program: true },
        orderBy: { createdAt: 'desc' }
      },
      donations: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      bookReports: {
        include: { book: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function getUserPrograms(userId: string) {
  return prisma.registration.findMany({
    where: { userId },
    include: {
      program: {
        include: { _count: { select: { registrations: { where: { status: 'APPROVED' } } } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateUserProfile(userId: string, data: {
  name?: string
  phone?: string
  birthYear?: number
  occupation?: string
  bio?: string
}) {
  return prisma.user.update({
    where: { id: userId },
    data
  })
}

// =============================================
// Program Registration
// =============================================

export async function registerForProgram(programId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const userId = session.user.id

  // 이미 신청했는지 확인
  const existing = await prisma.registration.findUnique({
    where: { userId_programId: { userId, programId } }
  })

  if (existing) {
    throw new Error('이미 신청한 프로그램입니다.')
  }

  // 프로그램 정원 확인
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { _count: { select: { registrations: { where: { status: 'APPROVED' } } } } }
  })

  if (!program) {
    throw new Error('프로그램을 찾을 수 없습니다.')
  }

  if (program.status !== 'OPEN') {
    throw new Error('현재 모집중인 프로그램이 아닙니다.')
  }

  const registration = await prisma.registration.create({
    data: {
      userId,
      programId,
      status: program._count.registrations < program.capacity ? 'APPROVED' : 'PENDING'
    }
  })

  // 활동 로그
  await prisma.activityLog.create({
    data: {
      userId,
      action: 'PROGRAM_REGISTER',
      target: program.title,
      targetId: programId
    }
  })

  return registration
}

export async function cancelRegistration(userId: string, programId: string) {
  const registration = await prisma.registration.findUnique({
    where: { userId_programId: { userId, programId } }
  })

  if (!registration) {
    throw new Error('신청 내역을 찾을 수 없습니다.')
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: { status: 'CANCELLED' }
  })

  return { success: true }
}

// =============================================
// Donations
// =============================================

export async function createDonation(data: {
  amount: number
  method: 'CARD' | 'BANK_TRANSFER'
  message?: string
  anonymous?: boolean
}) {
  const session = await getServerSession(authOptions)

  const donation = await prisma.donation.create({
    data: {
      userId: session?.user?.id || null,
      amount: data.amount,
      type: 'ONE_TIME',
      method: data.method,
      message: data.message || null,
      anonymous: data.anonymous || false,
      status: 'PENDING'
    }
  })

  // 활동 로그 기록 (로그인한 경우만)
  if (session?.user?.id) {
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DONATION',
        target: `₩${data.amount.toLocaleString()}`,
        targetId: donation.id
      }
    })
  }

  return donation
}

export async function getUserDonations() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return []
  }

  return prisma.donation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })
}

// =============================================
// Points
// =============================================

export async function getUserPoints() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true }
  })

  // 이번 달 적립/사용 내역
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyHistory = await prisma.pointHistory.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfMonth }
    }
  })

  const earnedThisMonth = monthlyHistory
    .filter(h => h.type === 'EARN')
    .reduce((sum, h) => sum + h.amount, 0)

  const spentThisMonth = monthlyHistory
    .filter(h => h.type === 'SPEND')
    .reduce((sum, h) => sum + Math.abs(h.amount), 0)

  return {
    balance: user?.points || 0,
    earnedThisMonth,
    spentThisMonth
  }
}

export async function getPointHistory(params?: { limit?: number }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return []
  }

  return prisma.pointHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: params?.limit || 20
  })
}

// =============================================
// Book Reports
// =============================================

export async function getUserBookReports() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return []
  }

  return prisma.bookReport.findMany({
    where: { userId: session.user.id },
    include: { book: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getBookReport(id: string) {
  return prisma.bookReport.findUnique({
    where: { id },
    include: { book: true, user: true }
  })
}

export async function getBooks() {
  return prisma.book.findMany({
    orderBy: { title: 'asc' }
  })
}

export async function createBookReport(data: {
  bookId: string
  title: string
  content: string
  isPublic?: boolean
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const report = await prisma.bookReport.create({
    data: {
      userId: session.user.id,
      bookId: data.bookId,
      title: data.title,
      content: data.content,
      isPublic: data.isPublic || false
    },
    include: { book: true }
  })

  // 포인트 적립 (200P)
  await addPoints(session.user.id, 200, 'REPORT', `독서 기록 작성 - ${report.book.title}`)

  return report
}

export async function updateBookReport(
  id: string,
  data: { title?: string; content?: string; isPublic?: boolean }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const report = await prisma.bookReport.findUnique({ where: { id } })

  if (!report || report.userId !== session.user.id) {
    throw new Error('수정 권한이 없습니다.')
  }

  return prisma.bookReport.update({
    where: { id },
    data
  })
}

export async function deleteBookReport(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const report = await prisma.bookReport.findUnique({ where: { id } })

  if (!report || report.userId !== session.user.id) {
    throw new Error('삭제 권한이 없습니다.')
  }

  await prisma.bookReport.delete({ where: { id } })
  return { success: true }
}

export async function addPoints(
  userId: string,
  amount: number,
  category: string,
  description: string
) {
  // 현재 포인트 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true }
  })

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.')
  }

  const newBalance = user.points + amount

  // 포인트 업데이트
  await prisma.user.update({
    where: { id: userId },
    data: { points: newBalance }
  })

  // 포인트 내역 기록
  const history = await prisma.pointHistory.create({
    data: {
      userId,
      amount,
      type: amount >= 0 ? 'EARN' : 'SPEND',
      category,
      description,
      balance: newBalance
    }
  })

  return history
}

// =============================================
// Blog
// =============================================

export async function getPublicBlogPosts(params: {
  page?: number
  limit?: number
  category?: string
  search?: string
}) {
  const { page = 1, limit = 12, category, search } = params

  const where: any = {
    isPublished: true
  }

  if (category) {
    where.category = category
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [posts, total, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        }
      }
    }),
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { isPublished: true, category: { not: null } }
    })
  ])

  return {
    posts,
    total,
    pages: Math.ceil(total / limit),
    categories: categories.map(c => c.category).filter(Boolean) as string[]
  }
}

export async function getBlogPostBySlug(slug: string) {
  // 조회수 증가
  await prisma.blogPost.update({
    where: { slug },
    data: { views: { increment: 1 } }
  }).catch(() => {})

  return prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
    include: {
      author: {
        select: { id: true, name: true, image: true }
      }
    }
  })
}

export async function getRelatedBlogPosts(slug: string, category: string | null) {
  return prisma.blogPost.findMany({
    where: {
      isPublished: true,
      slug: { not: slug },
      ...(category ? { category } : {})
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      image: true,
      category: true,
      createdAt: true
    }
  })
}
