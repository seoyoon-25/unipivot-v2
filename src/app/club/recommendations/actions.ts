'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'

export async function toggleSaveRecommendation(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const rec = await prisma.bookRecommendation.findUnique({
    where: { id },
  })

  if (!rec || rec.userId !== user.id) {
    return { error: '추천을 찾을 수 없습니다.' }
  }

  await prisma.bookRecommendation.update({
    where: { id },
    data: { isSaved: !rec.isSaved },
  })

  revalidatePath('/club/recommendations')
  return { success: true, isSaved: !rec.isSaved }
}

export async function toggleReadRecommendation(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const rec = await prisma.bookRecommendation.findUnique({
    where: { id },
  })

  if (!rec || rec.userId !== user.id) {
    return { error: '추천을 찾을 수 없습니다.' }
  }

  await prisma.bookRecommendation.update({
    where: { id },
    data: { isRead: !rec.isRead },
  })

  revalidatePath('/club/recommendations')
  return { success: true, isRead: !rec.isRead }
}

export async function deleteRecommendation(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const rec = await prisma.bookRecommendation.findUnique({
    where: { id },
  })

  if (!rec || rec.userId !== user.id) {
    return { error: '추천을 찾을 수 없습니다.' }
  }

  await prisma.bookRecommendation.delete({
    where: { id },
  })

  revalidatePath('/club/recommendations')
  return { success: true }
}
