'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

interface CreateQuoteInput {
  bookTitle: string
  bookAuthor?: string
  content: string
  page?: number
  memo?: string
  isPublic?: boolean
}

export async function createQuote(input: CreateQuoteInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  if (!input.bookTitle.trim()) {
    throw new Error('책 제목을 입력해주세요')
  }

  if (!input.content.trim()) {
    throw new Error('구절을 입력해주세요')
  }

  const quote = await prisma.quote.create({
    data: {
      userId: session.user.id,
      bookTitle: input.bookTitle.trim(),
      bookAuthor: input.bookAuthor?.trim() || null,
      content: input.content.trim(),
      page: input.page || null,
      memo: input.memo?.trim() || null,
      isPublic: input.isPublic ?? true,
    },
  })

  revalidatePath('/club/bookclub/quotes')

  return { success: true, quoteId: quote.id }
}

export async function deleteQuote(quoteId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  })

  if (!quote) {
    throw new Error('명문장을 찾을 수 없습니다')
  }

  if (quote.userId !== session.user.id) {
    throw new Error('권한이 없습니다')
  }

  await prisma.quote.delete({
    where: { id: quoteId },
  })

  revalidatePath('/club/bookclub/quotes')

  return { success: true }
}
