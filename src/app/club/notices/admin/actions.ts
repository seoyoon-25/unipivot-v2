'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/check-role'
import { prisma } from '@/lib/db'
import { createBulkNotifications } from '@/lib/club/notification-service'

export async function createNotice(data: {
  title: string
  content: string
  isPinned: boolean
  isPublished: boolean
}) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    return { error: '권한이 없습니다.' }
  }

  if (!data.title.trim()) {
    return { error: '제목을 입력해주세요.' }
  }
  if (!data.content.trim()) {
    return { error: '내용을 입력해주세요.' }
  }

  const notice = await prisma.clubNotice.create({
    data: {
      authorId: user.id,
      title: data.title.trim(),
      content: data.content,
      isPinned: data.isPinned,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
    },
  })

  // Send notifications to all active users if published
  if (data.isPublished) {
    const activeUsers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    })

    await createBulkNotifications(
      activeUsers.map((u) => u.id),
      {
        type: 'ANNOUNCEMENT',
        title: `새 공지: ${data.title.trim()}`,
        content: data.content.replace(/<[^>]+>/g, '').slice(0, 100),
        link: `/club/notices/${notice.id}`,
      }
    )
  }

  revalidatePath('/club/notices')
  revalidatePath('/club/notices/admin')
  return { success: true, noticeId: notice.id }
}

export async function updateNotice(
  id: string,
  data: {
    title: string
    content: string
    isPinned: boolean
    isPublished: boolean
  }
) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    return { error: '권한이 없습니다.' }
  }

  if (!data.title.trim()) {
    return { error: '제목을 입력해주세요.' }
  }

  const existing = await prisma.clubNotice.findUnique({ where: { id } })
  if (!existing) {
    return { error: '공지사항을 찾을 수 없습니다.' }
  }

  // If changing from unpublished to published, set publishedAt
  const publishedAt =
    data.isPublished && !existing.isPublished ? new Date() : existing.publishedAt

  await prisma.clubNotice.update({
    where: { id },
    data: {
      title: data.title.trim(),
      content: data.content,
      isPinned: data.isPinned,
      isPublished: data.isPublished,
      publishedAt,
    },
  })

  revalidatePath('/club/notices')
  revalidatePath('/club/notices/admin')
  revalidatePath(`/club/notices/${id}`)
  return { success: true }
}

export async function deleteNotice(id: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    return { error: '권한이 없습니다.' }
  }

  const existing = await prisma.clubNotice.findUnique({ where: { id } })
  if (!existing) {
    return { error: '공지사항을 찾을 수 없습니다.' }
  }

  await prisma.clubNotice.delete({ where: { id } })

  revalidatePath('/club/notices')
  revalidatePath('/club/notices/admin')
  return { success: true }
}
