import prisma from '@/lib/db'

interface CreateNotificationInput {
  userId: string
  type: string
  title: string
  content?: string
  link?: string
  programId?: string
  sessionId?: string
}

export async function createNotification(input: CreateNotificationInput) {
  // Check user notification settings
  const settings = await prisma.notificationSettings.findUnique({
    where: { userId: input.userId },
  })

  if (settings) {
    // Check announcement setting
    if (input.type === 'ANNOUNCEMENT' && !settings.announcement) return null
    // Check session reminder setting
    if (input.type === 'SESSION_REMINDER' && !settings.sessionReminder) return null
    // Check new session setting
    if (input.type === 'NEW_SESSION' && !settings.newSession) return null
    // Check report comment setting
    if (input.type === 'REPORT_COMMENT' && !settings.reportComment) return null
  }

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      content: input.content,
      link: input.link,
      programId: input.programId,
      sessionId: input.sessionId,
    },
  })
}

export async function createBulkNotifications(
  userIds: string[],
  data: Omit<CreateNotificationInput, 'userId'>
) {
  // Filter users by settings
  const settingsMap = new Map<string, { announcement: boolean; newSession: boolean }>()

  const allSettings = await prisma.notificationSettings.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, announcement: true, newSession: true },
  })

  for (const s of allSettings) {
    settingsMap.set(s.userId, s)
  }

  const filteredUserIds = userIds.filter((uid) => {
    const s = settingsMap.get(uid)
    if (!s) return true // No settings = all enabled by default
    if (data.type === 'ANNOUNCEMENT' && !s.announcement) return false
    if (data.type === 'NEW_SESSION' && !s.newSession) return false
    return true
  })

  if (filteredUserIds.length === 0) return { count: 0 }

  // Batch insert to avoid excessive DB load
  const BATCH_SIZE = 100
  let totalCount = 0

  for (let i = 0; i < filteredUserIds.length; i += BATCH_SIZE) {
    const batch = filteredUserIds.slice(i, i + BATCH_SIZE)
    const result = await prisma.notification.createMany({
      data: batch.map((userId) => ({
        userId,
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link,
        programId: data.programId,
        sessionId: data.sessionId,
      })),
    })
    totalCount += result.count
  }

  return { count: totalCount }
}

export async function notifyNewSession(
  programId: string,
  sessionId: string,
  sessionTitle: string
) {
  // Find all participants of the program
  const participants = await prisma.programParticipant.findMany({
    where: { programId, status: 'APPROVED' },
    select: { userId: true },
  })

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { title: true },
  })

  if (!program || participants.length === 0) return { count: 0 }

  return createBulkNotifications(
    participants.map((p) => p.userId),
    {
      type: 'NEW_SESSION',
      title: `새 세션: ${sessionTitle}`,
      content: `${program.title} 프로그램에 새 세션이 등록되었습니다.`,
      link: `/club/programs/${programId}/sessions/${sessionId}`,
      programId,
      sessionId,
    }
  )
}
