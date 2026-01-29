import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 공개 명문장 목록 조회
 */
export async function getPublicQuotes(options?: {
  search?: string
  limit?: number
  offset?: number
}) {
  const session = await getServerSession(authOptions)

  const quotes = await prisma.quote.findMany({
    where: {
      isPublic: true,
      ...(options?.search && {
        OR: [
          { bookTitle: { contains: options.search, mode: 'insensitive' as const } },
          { content: { contains: options.search, mode: 'insensitive' as const } },
          { bookAuthor: { contains: options.search, mode: 'insensitive' as const } },
        ],
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 30,
    skip: options?.offset || 0,
  })

  return quotes.map((q) => ({
    ...q,
    isOwner: session?.user?.id === q.userId,
  }))
}

/**
 * 내 명문장 목록 조회
 */
export async function getMyQuotes() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  return prisma.quote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}
