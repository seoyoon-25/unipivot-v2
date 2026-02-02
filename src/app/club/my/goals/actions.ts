'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'
import { updateGoalProgress } from '@/lib/club/goal-queries'

export async function setYearlyGoal(targetBooks: number) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  if (!Number.isInteger(targetBooks) || targetBooks < 1 || targetBooks > 365) {
    return { error: '목표는 1권에서 365권 사이로 설정해주세요.' }
  }

  const year = new Date().getFullYear()

  // Prisma compound unique doesn't support null, so use findFirst + create/update
  const existing = await prisma.readingGoal.findFirst({
    where: { userId: user.id, year, month: null },
  })

  if (existing) {
    await prisma.readingGoal.update({
      where: { id: existing.id },
      data: { targetBooks },
    })
  } else {
    await prisma.readingGoal.create({
      data: { userId: user.id, year, targetBooks },
    })
  }

  // Sync current progress
  await updateGoalProgress(user.id)

  revalidatePath('/club/my/goals')
  return { success: true }
}

export async function setMonthlyGoal(targetBooks: number) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  if (!Number.isInteger(targetBooks) || targetBooks < 1 || targetBooks > 31) {
    return { error: '목표는 1권에서 31권 사이로 설정해주세요.' }
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  await prisma.readingGoal.upsert({
    where: {
      userId_year_month: { userId: user.id, year, month },
    },
    update: { targetBooks },
    create: {
      userId: user.id,
      year,
      month,
      targetBooks,
    },
  })

  // Sync current progress
  await updateGoalProgress(user.id)

  revalidatePath('/club/my/goals')
  return { success: true }
}
