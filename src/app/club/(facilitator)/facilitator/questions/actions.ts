'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 진행자용 세션 목록 (질문 생성용)
 */
export async function getQuestionSessions() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const memberships = await prisma.programMembership.findMany({
    where: {
      userId: session.user.id,
      role: { in: ['ORGANIZER', 'FACILITATOR'] },
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          sessions: {
            orderBy: { date: 'desc' },
            take: 10,
            select: {
              id: true,
              sessionNo: true,
              title: true,
              date: true,
              bookTitle: true,
              _count: {
                select: {
                  bookReports: true,
                  aiGeneratedQuestions: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return memberships.map((m) => ({
    programId: m.program.id,
    programTitle: m.program.title,
    sessions: m.program.sessions.map((s) => ({
      ...s,
      reportCount: s._count.bookReports,
      questionCount: s._count.aiGeneratedQuestions,
    })),
  }))
}
