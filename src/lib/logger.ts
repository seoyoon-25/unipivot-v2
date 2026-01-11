import { prisma } from './db'
import { headers } from 'next/headers'

interface LogData {
  userId?: string
  action: string
  target?: string
  targetId?: string
  details?: string
}

export async function logActivity(data: LogData): Promise<void> {
  try {
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await prisma.activityLog.create({
      data: {
        ...data,
        ip,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Activity log error:', error)
  }
}

// Action types
export const Actions = {
  // Auth
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_RESET: 'PASSWORD_RESET',

  // User
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  SETTINGS_UPDATE: 'SETTINGS_UPDATE',

  // Program
  PROGRAM_CREATE: 'PROGRAM_CREATE',
  PROGRAM_UPDATE: 'PROGRAM_UPDATE',
  PROGRAM_DELETE: 'PROGRAM_DELETE',
  PROGRAM_REGISTER: 'PROGRAM_REGISTER',
  PROGRAM_CANCEL: 'PROGRAM_CANCEL',
  ATTENDANCE_MARK: 'ATTENDANCE_MARK',

  // Content
  NOTICE_CREATE: 'NOTICE_CREATE',
  NOTICE_UPDATE: 'NOTICE_UPDATE',
  NOTICE_DELETE: 'NOTICE_DELETE',
  BLOG_CREATE: 'BLOG_CREATE',
  BLOG_UPDATE: 'BLOG_UPDATE',
  BLOG_DELETE: 'BLOG_DELETE',

  // Finance
  DONATION_RECEIVE: 'DONATION_RECEIVE',
  DEPOSIT_CONFIRM: 'DEPOSIT_CONFIRM',

  // Admin
  MEMBER_UPDATE: 'MEMBER_UPDATE',
  MEMBER_BAN: 'MEMBER_BAN',
  SETTINGS_CHANGE: 'SETTINGS_CHANGE',
  BACKUP_CREATE: 'BACKUP_CREATE',
} as const

// Helper functions
export async function logLogin(userId: string): Promise<void> {
  await logActivity({
    userId,
    action: Actions.LOGIN,
    target: 'User',
    targetId: userId,
  })
}

export async function logProgramRegistration(
  userId: string,
  programId: string,
  programTitle: string
): Promise<void> {
  await logActivity({
    userId,
    action: Actions.PROGRAM_REGISTER,
    target: 'Program',
    targetId: programId,
    details: programTitle,
  })
}

export async function logAdminAction(
  userId: string,
  action: string,
  target: string,
  targetId: string,
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action,
    target,
    targetId,
    details,
  })
}

// Query functions
export async function getRecentLogs(limit = 50) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function getUserLogs(userId: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getLogsByAction(action: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: { action },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}
