'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function markNotificationRead(notificationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: { isRead: true, readAt: new Date() },
  })

  revalidatePath('/club/notifications')
  return { success: true }
}

export async function markAllNotificationsRead() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  })

  revalidatePath('/club/notifications')
  return { success: true }
}

export async function updateNotificationSettings(data: {
  sessionReminder: boolean
  newSession: boolean
  reportComment: boolean
  announcement: boolean
  reminderHoursBefore: number
  quietHoursStart: number
  quietHoursEnd: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  // Validate numeric ranges
  const reminderHours = Math.min(Math.max(Math.round(data.reminderHoursBefore || 24), 1), 72)
  const quietStart = Math.min(Math.max(Math.round(data.quietHoursStart || 0), 0), 23)
  const quietEnd = Math.min(Math.max(Math.round(data.quietHoursEnd || 0), 0), 23)

  if (isNaN(reminderHours) || isNaN(quietStart) || isNaN(quietEnd)) {
    return { error: '유효하지 않은 값입니다.' }
  }

  data.reminderHoursBefore = reminderHours
  data.quietHoursStart = quietStart
  data.quietHoursEnd = quietEnd

  await prisma.notificationSettings.upsert({
    where: { userId: session.user.id },
    update: {
      sessionReminder: data.sessionReminder,
      newSession: data.newSession,
      reportComment: data.reportComment,
      announcement: data.announcement,
      reminderHoursBefore: data.reminderHoursBefore,
      quietHoursStart: data.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd,
    },
    create: {
      userId: session.user.id,
      sessionReminder: data.sessionReminder,
      newSession: data.newSession,
      reportComment: data.reportComment,
      announcement: data.announcement,
      reminderHoursBefore: data.reminderHoursBefore,
      quietHoursStart: data.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd,
    },
  })

  revalidatePath('/club/notifications/settings')
  return { success: true }
}
