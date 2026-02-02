import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 사용자의 프로그램별 리뷰 목록 조회
 */
export async function getMyProgramsForReview() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const programs = await prisma.programParticipant.findMany({
    where: {
      userId: session.user.id,
      program: {
        status: { in: ['RECRUITING', 'ONGOING', 'COMPLETED'] },
      },
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          sessions: {
            orderBy: { sessionNo: 'asc' },
            select: {
              id: true,
              sessionNo: true,
              title: true,
              date: true,
              bookTitle: true,
              bookAuthor: true,
            },
          },
        },
      },
    },
    orderBy: {
      program: { startDate: 'desc' },
    },
  })

  return programs.map((p) => p.program)
}

/**
 * 프로그램의 공개 리뷰 목록 조회
 */
export async function getPublicReviews(options?: {
  programId?: string
  sessionId?: string
  limit?: number
  offset?: number
}) {
  const session = await getServerSession(authOptions)

  // Find member id for checking ownership
  let currentMemberId: string | null = null
  if (session?.user?.id) {
    const member = await prisma.member.findFirst({
      where: { userId: session.user.id },
    })
    currentMemberId = member?.id || null
  }

  const reviews = await prisma.bookReport.findMany({
    where: {
      visibility: 'PUBLIC',
      status: { in: ['PUBLISHED', 'APPROVED'] },
      ...(options?.programId && { programId: options.programId }),
      ...(options?.sessionId && { sessionId: options.sessionId }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          bookTitle: true,
          bookAuthor: true,
        },
      },
      program: {
        select: {
          id: true,
          title: true,
        },
      },
      structuredReport: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  })

  return reviews.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    bookTitle: r.bookTitle,
    bookAuthor: r.bookAuthor,
    visibility: r.visibility,
    status: r.status,
    rating: r.rating,
    likeCount: r.likeCount,
    viewCount: r.viewCount,
    createdAt: r.createdAt,
    author: {
      id: r.author.id,
      name: r.author.name,
    },
    session: r.session
      ? {
          id: r.session.id,
          sessionNo: r.session.sessionNo,
          title: r.session.title,
          bookTitle: r.session.bookTitle,
        }
      : null,
    program: r.program
      ? {
          id: r.program.id,
          title: r.program.title,
        }
      : null,
    hasStructuredData: !!r.structuredReport,
    structureCode: r.structuredReport?.structure || null,
    commentCount: r._count.comments,
    isOwner: currentMemberId === r.authorId,
  }))
}

/**
 * 내 리뷰 목록 조회
 */
export async function getMyAllReviews() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
  })

  if (!member) return []

  const reviews = await prisma.bookReport.findMany({
    where: {
      authorId: member.id,
    },
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          bookTitle: true,
        },
      },
      program: {
        select: {
          id: true,
          title: true,
        },
      },
      structuredReport: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return reviews.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    bookTitle: r.bookTitle,
    bookAuthor: r.bookAuthor,
    visibility: r.visibility,
    status: r.status,
    rating: r.rating,
    likeCount: r.likeCount,
    createdAt: r.createdAt,
    session: r.session
      ? {
          id: r.session.id,
          sessionNo: r.session.sessionNo,
          title: r.session.title,
        }
      : null,
    program: r.program
      ? {
          id: r.program.id,
          title: r.program.title,
        }
      : null,
    hasStructuredData: !!r.structuredReport,
    structureCode: r.structuredReport?.structure || null,
    commentCount: r._count.comments,
  }))
}

/**
 * 리뷰 작성을 위한 세션 정보 조회
 */
export async function getSessionForReview(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
  })

  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!programSession) return null

  // Check if already submitted
  let existingReview = null
  if (member) {
    existingReview = await prisma.bookReport.findFirst({
      where: {
        sessionId,
        authorId: member.id,
      },
      include: {
        structuredReport: true,
      },
    })
  }

  return {
    session: {
      id: programSession.id,
      sessionNo: programSession.sessionNo,
      title: programSession.title,
      date: programSession.date,
      bookTitle: programSession.bookTitle,
      bookAuthor: programSession.bookAuthor,
      bookRange: programSession.bookRange,
    },
    program: programSession.program,
    existingReview: existingReview
      ? {
          id: existingReview.id,
          title: existingReview.title,
          content: existingReview.content,
          visibility: existingReview.visibility,
          rating: existingReview.rating,
          structuredData: existingReview.structuredReport
            ? {
                structure: existingReview.structuredReport.structure,
                sections: JSON.parse(existingReview.structuredReport.sections),
              }
            : null,
        }
      : null,
  }
}
