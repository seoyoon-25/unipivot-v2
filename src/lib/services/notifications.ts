import { prisma } from '@/lib/db'

// Admin notification types
export const ADMIN_NOTIFICATION_TYPES = {
  ALERT_APPLICATION: 'ALERT_APPLICATION',
  NEW_APPLICATION: 'NEW_APPLICATION',
  DEPOSIT_RECEIVED: 'DEPOSIT_RECEIVED',
  SURVEY_SUBMITTED: 'SURVEY_SUBMITTED',
} as const

export type AdminNotificationType = keyof typeof ADMIN_NOTIFICATION_TYPES

// Create admin notification
export async function createAdminNotification(data: {
  type: string
  title: string
  message: string
  data?: Record<string, any>
}) {
  return prisma.adminNotification.create({
    data: {
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || undefined,
    },
  })
}

// Get unread admin notifications count
export async function getUnreadAdminNotificationCount() {
  return prisma.adminNotification.count({
    where: { read: false },
  })
}

// Get admin notifications
export async function getAdminNotifications(options?: {
  limit?: number
  type?: string
  unreadOnly?: boolean
}) {
  const { limit = 50, type, unreadOnly } = options || {}

  const where: any = {}
  if (type) where.type = type
  if (unreadOnly) where.read = false

  return prisma.adminNotification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

// Mark notification as read
export async function markAdminNotificationAsRead(id: string) {
  return prisma.adminNotification.update({
    where: { id },
    data: { read: true },
  })
}

// Mark all notifications as read
export async function markAllAdminNotificationsAsRead() {
  return prisma.adminNotification.updateMany({
    where: { read: false },
    data: { read: true },
  })
}

// Delete old notifications (older than 30 days)
export async function cleanupOldAdminNotifications() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return prisma.adminNotification.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
      read: true,
    },
  })
}

// Send notification for alert application
export async function notifyAlertApplication(
  applicationId: string,
  alertLevel: string,
  applicantName: string,
  programTitle: string,
  memberCode?: string
) {
  const title = alertLevel === 'BLOCKED' ? '차단 회원 신청' : '경고 회원 신청'
  const message = `${applicantName}님이 ${programTitle}에 신청했습니다.${memberCode ? ` (회원번호: ${memberCode})` : ''}`

  return createAdminNotification({
    type: ADMIN_NOTIFICATION_TYPES.ALERT_APPLICATION,
    title,
    message,
    data: { applicationId, alertLevel, memberCode },
  })
}

// Send notification for new application
export async function notifyNewApplication(
  applicationId: string,
  applicantName: string,
  programTitle: string
) {
  return createAdminNotification({
    type: ADMIN_NOTIFICATION_TYPES.NEW_APPLICATION,
    title: '새 신청',
    message: `${applicantName}님이 ${programTitle}에 신청했습니다.`,
    data: { applicationId },
  })
}

// Send notification for deposit received
export async function notifyDepositReceived(
  applicationId: string,
  applicantName: string,
  programTitle: string,
  amount: number
) {
  return createAdminNotification({
    type: ADMIN_NOTIFICATION_TYPES.DEPOSIT_RECEIVED,
    title: '보증금 입금',
    message: `${applicantName}님이 ${programTitle} 보증금 ${amount.toLocaleString()}원을 입금했습니다.`,
    data: { applicationId, amount },
  })
}

// Create user notification
export async function createUserNotification(
  userId: string,
  data: {
    type: string
    title: string
    content: string
    link?: string
  }
) {
  return prisma.notification.create({
    data: {
      userId,
      type: data.type,
      title: data.title,
      content: data.content,
      link: data.link,
    },
  })
}

// Notify user about application status change
export async function notifyApplicationStatusChange(
  userId: string,
  programTitle: string,
  status: string,
  programSlug: string
) {
  const statusMessages: Record<string, { title: string; content: string }> = {
    APPROVED: {
      title: '신청 승인',
      content: `${programTitle} 참여가 승인되었습니다!`,
    },
    REJECTED: {
      title: '신청 결과 안내',
      content: `${programTitle} 신청이 승인되지 않았습니다.`,
    },
    WAITLIST: {
      title: '대기 등록',
      content: `${programTitle} 대기자로 등록되었습니다.`,
    },
  }

  const msg = statusMessages[status]
  if (!msg) return null

  return createUserNotification(userId, {
    type: 'PROGRAM',
    title: msg.title,
    content: msg.content,
    link: `/programs/${programSlug}`,
  })
}
