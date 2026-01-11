import { prisma } from './db'

interface NotificationData {
  userId: string
  type: 'SYSTEM' | 'PROGRAM' | 'PAYMENT' | 'OTHER'
  title: string
  content?: string
  link?: string
}

export async function createNotification(data: NotificationData): Promise<void> {
  await prisma.notification.create({
    data,
  })
}

export async function getUserNotifications(userId: string, limit = 10) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })
}

export async function markAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  })
}

// Notification helpers for common scenarios
export async function notifyProgramRegistration(
  userId: string,
  programTitle: string,
  programId: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'PROGRAM',
    title: '프로그램 신청 완료',
    content: `${programTitle}에 신청이 완료되었습니다.`,
    link: `/my/programs`,
  })
}

export async function notifyProgramApproval(
  userId: string,
  programTitle: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'PROGRAM',
    title: '프로그램 신청 승인',
    content: `${programTitle} 참여가 승인되었습니다.`,
    link: `/my/programs`,
  })
}

export async function notifyPaymentConfirmed(
  userId: string,
  amount: number
): Promise<void> {
  await createNotification({
    userId,
    type: 'PAYMENT',
    title: '입금 확인',
    content: `${amount.toLocaleString()}원 입금이 확인되었습니다.`,
    link: `/my/points`,
  })
}

export async function notifyPointsEarned(
  userId: string,
  points: number,
  reason: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'SYSTEM',
    title: '포인트 적립',
    content: `${reason}로 ${points}P가 적립되었습니다.`,
    link: `/my/points`,
  })
}

export async function notifyNewNotice(
  userId: string,
  noticeTitle: string,
  noticeId: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'SYSTEM',
    title: '새 공지사항',
    content: noticeTitle,
    link: `/notice/${noticeId}`,
  })
}
