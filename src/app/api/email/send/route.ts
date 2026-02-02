import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'
import { sendEmail, sessionReminderTemplate } from '@/lib/email'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!dbUser || !['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const body = await request.json()
  const { type, sessionId } = body

  if (type === 'session_reminder' && sessionId) {
    const programSession = await prisma.programSession.findUnique({
      where: { id: sessionId },
      include: {
        program: {
          include: {
            participants: {
              include: { user: { select: { email: true, name: true } } },
            },
          },
        },
      },
    })

    if (!programSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const results = await Promise.allSettled(
      programSession.program.participants.map(async (p) => {
        const html = sessionReminderTemplate({
          userName: p.user.name || '회원',
          programTitle: programSession.program.title,
          sessionNo: programSession.sessionNo,
          date: programSession.date,
          location: programSession.location || undefined,
        })

        return sendEmail({
          to: p.user.email,
          subject: `[유니클럽] ${programSession.program.title} ${programSession.sessionNo}회차 모임 안내`,
          html,
        })
      })
    )

    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value).length
    return NextResponse.json({ sent: successCount, total: results.length })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
