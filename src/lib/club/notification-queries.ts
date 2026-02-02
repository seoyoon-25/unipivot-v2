import prisma from '@/lib/db'

export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean
    page?: number
    limit?: number
  }
) {
  const page = options?.page || 1
  const limit = options?.limit || 20
  const where: Record<string, unknown> = { userId }

  if (options?.unreadOnly) {
    where.isRead = false
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ])

  return {
    notifications,
    total,
    unreadCount,
    pages: Math.ceil(total / limit),
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function getNotificationSettings(userId: string) {
  let settings = await prisma.notificationSettings.findUnique({
    where: { userId },
  })

  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: { userId },
    })
  }

  return settings
}
