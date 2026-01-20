'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  validateReview,
  REVIEW_POINTS,
} from '@/lib/utils/review'

interface SubmitBookReportInput {
  programId: string
  sessionId: string
  title: string
  content: string
  isPublic?: boolean
}

/**
 * 독후감 제출
 */
export async function submitBookReport(input: SubmitBookReportInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const { programId, sessionId, title, content, isPublic = true } = input

  // Validate input
  const validation = validateReview(title, content)
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0])
  }

  // Get session for book info
  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
  })

  if (!programSession) {
    throw new Error('세션을 찾을 수 없습니다')
  }

  // Find member linked to user
  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
  })

  if (!member) {
    throw new Error('멤버 정보를 찾을 수 없습니다')
  }

  // Check if already submitted
  const existing = await prisma.bookReport.findFirst({
    where: {
      programId,
      sessionId,
      authorId: member.id,
    },
  })

  if (existing) {
    throw new Error('이미 독후감을 제출했습니다')
  }

  // Create book report
  const report = await prisma.bookReport.create({
    data: {
      programId,
      sessionId,
      authorId: member.id,
      title,
      content,
      bookTitle: programSession.bookTitle || '책 제목 없음',
      bookAuthor: programSession.bookAuthor,
      visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  // Award points via PointHistory
  await prisma.pointHistory.create({
    data: {
      userId: session.user.id,
      amount: REVIEW_POINTS,
      type: 'EARN',
      category: 'BOOK_REPORT',
      description: `독후감 작성: ${title}`,
      balance: 0, // Should be calculated
    },
  })

  revalidatePath(`/mypage/programs/${programId}`)

  return {
    success: true,
    reportId: report.id,
    isLate: false,
  }
}

/**
 * 독후감 수정
 */
export async function updateBookReport(
  reportId: string,
  data: { title?: string; content?: string; isPublic?: boolean }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Find member
  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
  })

  const report = await prisma.bookReport.findUnique({
    where: { id: reportId },
  })

  if (!report) {
    throw new Error('독후감을 찾을 수 없습니다')
  }

  if (!member || report.authorId !== member.id) {
    throw new Error('권한이 없습니다')
  }

  // Validate if title/content changed
  if (data.title !== undefined || data.content !== undefined) {
    const validation = validateReview(
      data.title ?? report.title,
      data.content ?? report.content
    )
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0])
    }
  }

  await prisma.bookReport.update({
    where: { id: reportId },
    data: {
      title: data.title,
      content: data.content,
      visibility: data.isPublic !== undefined ? (data.isPublic ? 'PUBLIC' : 'PRIVATE') : undefined,
    },
  })

  if (report.programId) {
    revalidatePath(`/mypage/programs/${report.programId}`)
  }

  return { success: true }
}

/**
 * 내 독후감 목록 조회
 */
export async function getMyReviews(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Find member
  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
  })

  if (!member) {
    return []
  }

  const reviews = await prisma.bookReport.findMany({
    where: {
      programId,
      authorId: member.id,
    },
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
        },
      },
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
    ...r,
    session: r.session ? {
      ...r.session,
      sessionNumber: r.session.sessionNo,
    } : null,
  }))
}

/**
 * 프로그램 독후감 목록 조회 (공개 독후감)
 */
export async function getProgramReviews(
  programId: string,
  options?: {
    sessionId?: string
    limit?: number
    offset?: number
  }
) {
  const reviews = await prisma.bookReport.findMany({
    where: {
      programId,
      visibility: 'PUBLIC',
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
        },
      },
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
    ...r,
    user: {
      id: r.author.id,
      name: r.author.name,
      email: r.author.email,
    },
    session: r.session ? {
      ...r.session,
      sessionNumber: r.session.sessionNo,
    } : null,
  }))
}

/**
 * 독후감 상세 조회
 */
export async function getReviewDetail(reportId: string) {
  const session = await getServerSession(authOptions)

  const report = await prisma.bookReport.findUnique({
    where: { id: reportId },
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
        },
      },
      program: {
        select: {
          id: true,
          title: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  })

  if (!report) {
    return null
  }

  // Check if current user has liked
  let hasLiked = false
  if (session?.user?.id) {
    const member = await prisma.member.findFirst({
      where: { userId: session.user.id },
    })
    if (member) {
      const like = await prisma.bookReportLike.findFirst({
        where: {
          reportId,
          memberId: member.id,
        },
      })
      hasLiked = !!like
    }
  }

  // Get current user's member id
  let isOwner = false
  if (session?.user?.id) {
    const member = await prisma.member.findFirst({
      where: { userId: session.user.id },
    })
    isOwner = member?.id === report.authorId
  }

  return {
    ...report,
    user: {
      id: report.author.id,
      name: report.author.name,
      email: report.author.email,
    },
    session: report.session ? {
      ...report.session,
      sessionNumber: report.session.sessionNo,
    } : null,
    hasLiked,
    isOwner,
  }
}

/**
 * 독후감 좋아요 토글
 */
export async function toggleReviewLike(reportId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Find member
  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
  })

  if (!member) {
    throw new Error('멤버 정보를 찾을 수 없습니다')
  }

  const existing = await prisma.bookReportLike.findFirst({
    where: {
      reportId,
      memberId: member.id,
    },
  })

  if (existing) {
    await prisma.bookReportLike.delete({
      where: { id: existing.id },
    })
    await prisma.bookReport.update({
      where: { id: reportId },
      data: { likeCount: { decrement: 1 } },
    })
    return { liked: false }
  } else {
    await prisma.bookReportLike.create({
      data: {
        reportId,
        memberId: member.id,
      },
    })
    await prisma.bookReport.update({
      where: { id: reportId },
      data: { likeCount: { increment: 1 } },
    })
    return { liked: true }
  }
}

/**
 * 독후감 댓글 작성
 */
export async function addReviewComment(reportId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  if (!content.trim()) {
    throw new Error('댓글 내용을 입력해주세요')
  }

  // Find member
  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
  })

  if (!member) {
    throw new Error('멤버 정보를 찾을 수 없습니다')
  }

  const comment = await prisma.bookReportComment.create({
    data: {
      reportId,
      authorId: member.id,
      content: content.trim(),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return {
    ...comment,
    user: {
      id: comment.author.id,
      name: comment.author.name,
      email: comment.author.email,
    },
  }
}

/**
 * 독후감 제출 현황 조회 (진행자용)
 */
export async function getReviewSubmissionStatus(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Get program with sessions
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      sessions: {
        orderBy: { sessionNo: 'asc' },
      },
    },
  })

  if (!program) {
    throw new Error('프로그램을 찾을 수 없습니다')
  }

  // Get participants
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

  // Get all reviews for this program
  const reviews = await prisma.bookReport.findMany({
    where: { programId },
    select: {
      id: true,
      authorId: true,
      sessionId: true,
      createdAt: true,
    },
  })

  // Get member mappings for participants
  const memberMappings = await prisma.member.findMany({
    where: {
      userId: { in: participants.map(p => p.userId) },
    },
    select: {
      id: true,
      userId: true,
    },
  })

  const userToMember = new Map(memberMappings.map(m => [m.userId, m.id]))

  // Build submission matrix
  const submissionMatrix = participants.map((participant) => {
    const memberId = userToMember.get(participant.userId)
    const userReviews = memberId
      ? reviews.filter((r) => r.authorId === memberId)
      : []
    const sessionSubmissions = program.sessions.map((ps) => {
      const review = userReviews.find((r) => r.sessionId === ps.id)
      return {
        sessionId: ps.id,
        sessionNumber: ps.sessionNo,
        submitted: !!review,
        isLate: false,
        submittedAt: review?.createdAt || null,
      }
    })

    return {
      user: {
        id: participant.user.id,
        name: participant.user.name,
        email: participant.user.email,
      },
      submissions: sessionSubmissions,
      totalSubmitted: userReviews.length,
      totalSessions: program.sessions.length,
      submissionRate: program.sessions.length > 0
        ? Math.round((userReviews.length / program.sessions.length) * 100)
        : 0,
    }
  })

  return {
    sessions: program.sessions.map((s) => ({ ...s, sessionNumber: s.sessionNo })),
    participants: submissionMatrix,
    summary: {
      totalParticipants: participants.length,
      totalSessions: program.sessions.length,
      totalReviews: reviews.length,
      avgSubmissionRate: submissionMatrix.length > 0
        ? Math.round(
            submissionMatrix.reduce((sum, p) => sum + p.submissionRate, 0) /
              submissionMatrix.length
          )
        : 0,
    },
  }
}
