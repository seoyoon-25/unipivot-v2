'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'

// 챌린지 생성 (관리자만)
export async function createChallenge(data: {
  title: string
  description?: string
  type: string
  targetValue: number
  targetGenre?: string
  startDate: string
  endDate: string
}) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { error: '관리자만 챌린지를 생성할 수 있습니다.' }
  }

  if (!data.title.trim()) return { error: '제목을 입력해주세요.' }
  if (data.targetValue < 1) return { error: '목표값은 1 이상이어야 합니다.' }

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: '올바른 날짜를 입력해주세요.' }
  }

  if (endDate <= startDate) {
    return { error: '종료일은 시작일 이후여야 합니다.' }
  }

  const challenge = await prisma.readingChallenge.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      type: data.type,
      targetValue: data.targetValue,
      targetGenre: data.targetGenre?.trim() || null,
      startDate,
      endDate,
      createdBy: user.id,
    },
  })

  revalidatePath('/club/challenges')
  return { success: true, id: challenge.id }
}

// 챌린지 참가
export async function joinChallenge(challengeId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const challenge = await prisma.readingChallenge.findUnique({
    where: { id: challengeId },
  })

  if (!challenge) return { error: '챌린지를 찾을 수 없습니다.' }
  if (!challenge.isActive) return { error: '종료된 챌린지입니다.' }
  if (new Date() > challenge.endDate) return { error: '이미 마감된 챌린지입니다.' }

  const existing = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId: user.id } },
  })

  if (existing) return { error: '이미 참가 중인 챌린지입니다.' }

  await prisma.challengeParticipant.create({
    data: {
      challengeId,
      userId: user.id,
    },
  })

  revalidatePath(`/club/challenges/${challengeId}`)
  revalidatePath('/club/challenges')
  return { success: true }
}

// 챌린지 탈퇴
export async function leaveChallenge(challengeId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const participant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId: user.id } },
  })

  if (!participant) return { error: '참가 중인 챌린지가 아닙니다.' }
  if (participant.isCompleted) return { error: '이미 완료한 챌린지는 탈퇴할 수 없습니다.' }

  await prisma.challengeParticipant.delete({
    where: { id: participant.id },
  })

  revalidatePath(`/club/challenges/${challengeId}`)
  revalidatePath('/club/challenges/my')
  return { success: true }
}
