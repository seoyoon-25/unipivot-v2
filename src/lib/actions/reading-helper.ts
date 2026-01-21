'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 읽기 진도 업데이트
export async function updateReadingProgress(
  sessionId: string,
  currentPage: number,
  totalPages: number
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const percentage =
    totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0

  return await prisma.readingProgress.upsert({
    where: {
      userId_sessionId: {
        userId: session.user.id,
        sessionId
      }
    },
    create: {
      userId: session.user.id,
      sessionId,
      currentPage,
      totalPages,
      percentage,
      lastReadAt: new Date()
    },
    update: {
      currentPage,
      totalPages,
      percentage,
      lastReadAt: new Date()
    }
  })
}

// 읽기 진도 조회
export async function getReadingProgress(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  return await prisma.readingProgress.findUnique({
    where: {
      userId_sessionId: {
        userId: session.user.id,
        sessionId
      }
    }
  })
}

// 남은 일수 및 일일 목표 계산
export async function getReadingGoal(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const [progress, programSession] = await Promise.all([
    prisma.readingProgress.findUnique({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId
        }
      }
    }),
    prisma.programSession.findUnique({
      where: { id: sessionId }
    })
  ])

  if (!programSession) return null

  const today = new Date()
  const sessionDate = new Date(programSession.date)
  const daysUntilSession = Math.max(
    0,
    Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  )

  const currentPage = progress?.currentPage || 0
  const totalPages = progress?.totalPages || 0
  const remainingPages = Math.max(0, totalPages - currentPage)

  const dailyGoal =
    daysUntilSession > 0 ? Math.ceil(remainingPages / daysUntilSession) : remainingPages

  return {
    currentPage,
    totalPages,
    remainingPages,
    daysUntilSession,
    dailyGoal,
    percentage: progress?.percentage || 0
  }
}

// 하이라이트 저장
export async function saveHighlight(
  sessionId: string,
  data: {
    text: string
    page: number
    note?: string
    photoUrl?: string
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  return await prisma.highlight.create({
    data: {
      userId: session.user.id,
      sessionId,
      text: data.text,
      page: data.page,
      note: data.note,
      photoUrl: data.photoUrl
    }
  })
}

// 하이라이트 목록 조회
export async function getHighlights(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  return await prisma.highlight.findMany({
    where: {
      userId: session.user.id,
      sessionId
    },
    orderBy: { page: 'asc' }
  })
}

// 하이라이트 삭제
export async function deleteHighlight(highlightId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const highlight = await prisma.highlight.findUnique({
    where: { id: highlightId }
  })

  if (!highlight || highlight.userId !== session.user.id) {
    return { error: '권한이 없습니다.' }
  }

  await prisma.highlight.delete({
    where: { id: highlightId }
  })

  return { success: true }
}

// 하이라이트 독후감에 사용 표시
export async function markHighlightAsUsedInReport(highlightId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  return await prisma.highlight.update({
    where: { id: highlightId },
    data: { isUsedInReport: true }
  })
}

// 사용자의 전체 읽기 진도 조회
export async function getAllReadingProgress() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  return await prisma.readingProgress.findMany({
    where: { userId: session.user.id },
    include: {
      session: {
        include: {
          program: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    orderBy: { lastReadAt: 'desc' }
  })
}

// 미사용 하이라이트 조회 (독후감 작성용)
export async function getUnusedHighlights(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  return await prisma.highlight.findMany({
    where: {
      userId: session.user.id,
      sessionId,
      isUsedInReport: false
    },
    orderBy: { page: 'asc' }
  })
}
