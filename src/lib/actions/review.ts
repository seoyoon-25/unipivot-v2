'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  validateReview,
  REVIEW_POINTS,
} from '@/lib/utils/review'
import { updateGoalProgress } from '@/lib/club/goal-queries'
import { updateChallengeProgress } from '@/lib/club/challenge-queries'
import type {
  ReportStructureCode,
  StructuredReportData,
  ReportTemplateStructure,
} from '@/types/report'

interface SubmitBookReportInput {
  programId: string
  sessionId: string
  title: string
  content: string
  isPublic?: boolean
  rating?: number | null
}

/**
 * 독후감 제출
 */
export async function submitBookReport(input: SubmitBookReportInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const { programId, sessionId, title, content, isPublic = true, rating } = input

  // Validate rating if provided
  if (rating !== undefined && rating !== null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('별점은 1~5 사이의 정수여야 합니다')
    }
  }

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
      rating: rating ?? null,
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

  // Update reading goal progress + challenge progress + award badges if completed
  await updateGoalProgress(session.user.id).catch(() => {})
  await updateChallengeProgress(session.user.id).catch(() => {})

  revalidatePath(`/mypage/programs/${programId}`)

  return {
    success: true,
    reportId: report.id,
    isLate: false,
  }
}

interface SubmitStructuredReportInput {
  programId: string
  sessionId: string
  title: string
  structure: ReportStructureCode
  template: ReportTemplateStructure
  data: StructuredReportData
  isPublic?: boolean
  rating?: number | null
}

/**
 * 구조화된 독후감 제출
 */
export async function submitStructuredReport(input: SubmitStructuredReportInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const { programId, sessionId, title, structure, template, data, isPublic = true, rating } = input

  // Validate rating if provided
  if (rating !== undefined && rating !== null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('별점은 1~5 사이의 정수여야 합니다')
    }
  }

  // Validate title
  if (!title.trim()) {
    throw new Error('제목을 입력해주세요')
  }

  // Validate required sections
  for (const section of template.sections) {
    if (section.required) {
      const sectionData = data.sections[section.id]
      if (!sectionData) {
        throw new Error(`${section.title} 섹션을 작성해주세요`)
      }

      // Type-specific validation
      if (section.type === 'textarea' && typeof sectionData === 'string') {
        if (!sectionData.trim()) {
          throw new Error(`${section.title}을(를) 작성해주세요`)
        }
      } else if (section.type === 'quote') {
        const quoteData = sectionData as { quote?: string }
        if (!quoteData.quote?.trim()) {
          throw new Error(`${section.title}에 구절을 입력해주세요`)
        }
      } else if (section.type === 'list') {
        const listData = sectionData as { items?: string[] }
        const validItems = listData.items?.filter(item => item.trim()) || []
        if (validItems.length === 0) {
          throw new Error(`${section.title}에 최소 1개 항목을 입력해주세요`)
        }
      } else if (section.type === 'emotion') {
        const emotionData = sectionData as { emotions?: string[] }
        if (!emotionData.emotions || emotionData.emotions.length === 0) {
          throw new Error(`${section.title}에서 감정을 선택해주세요`)
        }
      } else if (section.type === 'questions') {
        const questionsData = sectionData as { questions?: string[] }
        const validQuestions = questionsData.questions?.filter(q => q.trim()) || []
        if (validQuestions.length === 0) {
          throw new Error(`${section.title}에 최소 1개 질문을 입력해주세요`)
        }
      }
    }
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

  // Generate content from structured data for backward compatibility
  const generatedContent = generateContentFromStructuredData(template, data)

  // Create book report with structured data using transaction
  const report = await prisma.$transaction(async (tx) => {
    // Create book report
    const bookReport = await tx.bookReport.create({
      data: {
        programId,
        sessionId,
        authorId: member.id,
        title,
        content: generatedContent,
        bookTitle: programSession.bookTitle || '책 제목 없음',
        bookAuthor: programSession.bookAuthor,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rating: rating ?? null,
      },
    })

    // Create structured book report
    await tx.structuredBookReport.create({
      data: {
        reportId: bookReport.id,
        structure,
        sections: JSON.stringify(data.sections),
      },
    })

    return bookReport
  })

  // Award points via PointHistory
  await prisma.pointHistory.create({
    data: {
      userId: session.user.id,
      amount: REVIEW_POINTS,
      type: 'EARN',
      category: 'BOOK_REPORT',
      description: `독후감 작성: ${title}`,
      balance: 0,
    },
  })

  // Update reading goal progress + challenge progress + award badges if completed
  await updateGoalProgress(session.user.id).catch(() => {})
  await updateChallengeProgress(session.user.id).catch(() => {})

  revalidatePath(`/mypage/programs/${programId}`)

  return {
    success: true,
    reportId: report.id,
    isLate: false,
  }
}

/**
 * 구조화된 데이터에서 텍스트 콘텐츠 생성 (하위 호환성용)
 */
function generateContentFromStructuredData(
  template: ReportTemplateStructure,
  data: StructuredReportData
): string {
  const parts: string[] = []

  for (const section of template.sections) {
    const sectionData = data.sections[section.id]
    if (!sectionData) continue

    parts.push(`## ${section.emoji} ${section.title}\n`)

    if (section.type === 'textarea' && typeof sectionData === 'string') {
      parts.push(sectionData)
    } else if (section.type === 'quote') {
      const quoteData = sectionData as { quote?: string; page?: string; reason?: string }
      if (quoteData.quote) {
        parts.push(`> "${quoteData.quote}"`)
        if (quoteData.page) {
          parts.push(`(${quoteData.page})`)
        }
        if (quoteData.reason) {
          parts.push(`\n선택 이유: ${quoteData.reason}`)
        }
      }
    } else if (section.type === 'list') {
      const listData = sectionData as { items?: string[] }
      if (listData.items) {
        listData.items.forEach((item, i) => {
          if (item.trim()) {
            parts.push(`${i + 1}. ${item}`)
          }
        })
      }
    } else if (section.type === 'emotion') {
      const emotionData = sectionData as { emotions?: string[]; description?: string }
      if (emotionData.emotions?.length) {
        parts.push(`감정: ${emotionData.emotions.join(', ')}`)
      }
      if (emotionData.description) {
        parts.push(emotionData.description)
      }
    } else if (section.type === 'questions') {
      const questionsData = sectionData as { questions?: string[] }
      if (questionsData.questions) {
        questionsData.questions.forEach((q, i) => {
          if (q.trim()) {
            parts.push(`Q${i + 1}. ${q}`)
          }
        })
      }
    }

    parts.push('\n')
  }

  return parts.join('\n')
}

/**
 * 구조화된 독후감 수정
 */
export async function updateStructuredReport(
  reportId: string,
  input: {
    title?: string
    structure?: ReportStructureCode
    template?: ReportTemplateStructure
    data?: StructuredReportData
    isPublic?: boolean
    rating?: number | null
  }
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
    include: { structuredReport: true },
  })

  if (!report) {
    throw new Error('독후감을 찾을 수 없습니다')
  }

  if (!member || report.authorId !== member.id) {
    throw new Error('권한이 없습니다')
  }

  const updateData: Record<string, unknown> = {}

  if (input.title !== undefined) {
    if (!input.title.trim()) {
      throw new Error('제목을 입력해주세요')
    }
    updateData.title = input.title
  }

  if (input.isPublic !== undefined) {
    updateData.visibility = input.isPublic ? 'PUBLIC' : 'PRIVATE'
  }

  if (input.rating !== undefined) {
    if (input.rating !== null && (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)) {
      throw new Error('별점은 1~5 사이의 정수여야 합니다')
    }
    updateData.rating = input.rating
  }

  // Update structured content
  if (input.template && input.data) {
    updateData.content = generateContentFromStructuredData(input.template, input.data)

    if (report.structuredReport) {
      // Update existing structured report
      await prisma.structuredBookReport.update({
        where: { id: report.structuredReport.id },
        data: {
          structure: input.structure || report.structuredReport.structure,
          sections: JSON.stringify(input.data.sections),
        },
      })
    } else {
      // Create new structured report
      await prisma.structuredBookReport.create({
        data: {
          reportId: report.id,
          structure: input.structure || 'FREE',
          sections: JSON.stringify(input.data.sections),
        },
      })
    }
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.bookReport.update({
      where: { id: reportId },
      data: updateData,
    })
  }

  if (report.programId) {
    revalidatePath(`/mypage/programs/${report.programId}`)
  }

  return { success: true }
}

/**
 * 구조화된 독후감 상세 조회
 */
export async function getStructuredReviewDetail(reportId: string) {
  const report = await getReviewDetail(reportId)
  if (!report) return null

  const structuredReport = await prisma.structuredBookReport.findUnique({
    where: { reportId },
  })

  return {
    ...report,
    structuredData: structuredReport
      ? {
          structure: structuredReport.structure as ReportStructureCode,
          sections: JSON.parse(structuredReport.sections) as Record<string, unknown>,
        }
      : null,
  }
}

/**
 * 독후감 템플릿 목록 조회
 */
export async function getReportTemplates(category?: string) {
  const templates = await prisma.reportTemplate.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
    },
    orderBy: [
      { isDefault: 'desc' },
      { sortOrder: 'asc' },
    ],
  })

  return templates.map((t) => ({
    ...t,
    structure: JSON.parse(t.structure) as ReportTemplateStructure,
  }))
}

/**
 * 독후감 템플릿 상세 조회
 */
export async function getReportTemplate(code: string) {
  const template = await prisma.reportTemplate.findUnique({
    where: { code },
  })

  if (!template) return null

  return {
    ...template,
    structure: JSON.parse(template.structure) as ReportTemplateStructure,
  }
}

/**
 * 독후감 수정
 */
export async function updateBookReport(
  reportId: string,
  data: { title?: string; content?: string; isPublic?: boolean; rating?: number | null }
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

  // Validate rating
  if (data.rating !== undefined && data.rating !== null) {
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new Error('별점은 1~5 사이의 정수여야 합니다')
    }
  }

  await prisma.bookReport.update({
    where: { id: reportId },
    data: {
      title: data.title,
      content: data.content,
      visibility: data.isPublic !== undefined ? (data.isPublic ? 'PUBLIC' : 'PRIVATE') : undefined,
      rating: data.rating !== undefined ? (data.rating ?? null) : undefined,
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
 * 관리자: 프로그램 독후감 목록 조회
 */
export async function getAdminProgramReports(
  programId: string,
  options?: {
    status?: string
    sessionId?: string
    page?: number
    limit?: number
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  // Check admin permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    // Check if user is program organizer
    const membership = await prisma.programMembership.findFirst({
      where: {
        programId,
        userId: session.user.id,
        role: 'ORGANIZER',
      },
    })
    if (!membership) {
      throw new Error('권한이 없습니다')
    }
  }

  const page = options?.page || 1
  const limit = options?.limit || 20
  const skip = (page - 1) * limit

  const where = {
    programId,
    ...(options?.status && { status: options.status }),
    ...(options?.sessionId && { sessionId: options.sessionId }),
  }

  const [reports, total] = await Promise.all([
    prisma.bookReport.findMany({
      where,
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
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.bookReport.count({ where }),
  ])

  return {
    reports,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  }
}

/**
 * 관리자: 독후감 승인
 */
export async function approveReport(reportId: string, note?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const report = await prisma.bookReport.findUnique({
    where: { id: reportId },
    include: {
      author: {
        include: {
          user: true,
        },
      },
      program: true,
    },
  })

  if (!report) {
    throw new Error('독후감을 찾을 수 없습니다')
  }

  // Check permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    if (report.programId) {
      const membership = await prisma.programMembership.findFirst({
        where: {
          programId: report.programId,
          userId: session.user.id,
          role: 'ORGANIZER',
        },
      })
      if (!membership) {
        throw new Error('권한이 없습니다')
      }
    } else {
      throw new Error('권한이 없습니다')
    }
  }

  // Update report
  const updated = await prisma.bookReport.update({
    where: { id: reportId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: session.user.id,
    },
  })

  // Send notification to author
  if (report.author.user) {
    await prisma.notification.create({
      data: {
        userId: report.author.user.id,
        type: 'REPORT_APPROVED',
        title: '독후감이 승인되었습니다',
        content: note || `"${report.title}" 독후감이 승인되었습니다.`,
        link: `/my/reports/${reportId}`,
      },
    })
  }

  if (report.programId) {
    revalidatePath(`/admin/programs/${report.programId}/reports`)
  }

  return updated
}

/**
 * 관리자: 독후감 반려
 */
export async function rejectReport(reportId: string, reason: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  if (!reason.trim()) {
    throw new Error('반려 사유를 입력해주세요')
  }

  const report = await prisma.bookReport.findUnique({
    where: { id: reportId },
    include: {
      author: {
        include: {
          user: true,
        },
      },
      program: true,
    },
  })

  if (!report) {
    throw new Error('독후감을 찾을 수 없습니다')
  }

  // Check permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    if (report.programId) {
      const membership = await prisma.programMembership.findFirst({
        where: {
          programId: report.programId,
          userId: session.user.id,
          role: 'ORGANIZER',
        },
      })
      if (!membership) {
        throw new Error('권한이 없습니다')
      }
    } else {
      throw new Error('권한이 없습니다')
    }
  }

  // Update report
  const updated = await prisma.bookReport.update({
    where: { id: reportId },
    data: {
      status: 'REJECTED',
    },
  })

  // Send notification to author
  if (report.author.user) {
    await prisma.notification.create({
      data: {
        userId: report.author.user.id,
        type: 'REPORT_REJECTED',
        title: '독후감이 반려되었습니다',
        content: `"${report.title}" 독후감이 반려되었습니다. 사유: ${reason}`,
        link: `/my/reports/${reportId}`,
      },
    })
  }

  if (report.programId) {
    revalidatePath(`/admin/programs/${report.programId}/reports`)
  }

  return updated
}

/**
 * 관리자: 독후감 수정 요청
 */
export async function requestReportRevision(reportId: string, feedback: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  if (!feedback.trim()) {
    throw new Error('피드백을 입력해주세요')
  }

  const report = await prisma.bookReport.findUnique({
    where: { id: reportId },
    include: {
      author: {
        include: {
          user: true,
        },
      },
      program: true,
    },
  })

  if (!report) {
    throw new Error('독후감을 찾을 수 없습니다')
  }

  // Check permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    if (report.programId) {
      const membership = await prisma.programMembership.findFirst({
        where: {
          programId: report.programId,
          userId: session.user.id,
          role: 'ORGANIZER',
        },
      })
      if (!membership) {
        throw new Error('권한이 없습니다')
      }
    } else {
      throw new Error('권한이 없습니다')
    }
  }

  // Update report
  const updated = await prisma.bookReport.update({
    where: { id: reportId },
    data: {
      status: 'REVISION_REQUESTED',
    },
  })

  // Send notification to author
  if (report.author.user) {
    await prisma.notification.create({
      data: {
        userId: report.author.user.id,
        type: 'REPORT_REVISION_REQUESTED',
        title: '독후감 수정이 요청되었습니다',
        content: `"${report.title}" 독후감에 수정이 요청되었습니다. 피드백: ${feedback}`,
        link: `/my/reports/${reportId}/edit`,
      },
    })
  }

  if (report.programId) {
    revalidatePath(`/admin/programs/${report.programId}/reports`)
  }

  return updated
}

/**
 * 독후감 상태별 카운트 조회
 */
export async function getReportStatusCounts(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const counts = await prisma.bookReport.groupBy({
    by: ['status'],
    where: { programId },
    _count: true,
  })

  const result: Record<string, number> = {
    DRAFT: 0,
    PENDING: 0,
    PUBLISHED: 0,
    APPROVED: 0,
    REJECTED: 0,
    REVISION_REQUESTED: 0,
  }

  for (const count of counts) {
    result[count.status] = count._count
  }

  return result
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
