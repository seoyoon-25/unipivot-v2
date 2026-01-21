import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/reports - 세션 독후감 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const type = searchParams.get('type') || 'session' // 'session' 또는 'program'

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId가 필요합니다.' }, { status: 400 })
    }

    if (type === 'session') {
      // SessionReport 조회 (템플릿 기반)
      const report = await prisma.sessionReport.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId: session.user.id,
          },
        },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })
      return NextResponse.json(report)
    } else {
      // ProgramReport 조회 (기존 방식)
      const participant = await prisma.programParticipant.findFirst({
        where: {
          userId: session.user.id,
          program: {
            sessions: { some: { id: sessionId } },
          },
        },
      })

      if (!participant) {
        return NextResponse.json(null)
      }

      const report = await prisma.programReport.findUnique({
        where: {
          sessionId_participantId: {
            sessionId,
            participantId: participant.id,
          },
        },
      })
      return NextResponse.json(report)
    }
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/reports - 독후감 작성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    // 템플릿 기반 독후감 (SessionReport)
    if (body.templateId !== undefined) {
      const { sessionId, templateId, content, status } = body

      if (!sessionId || !content) {
        return NextResponse.json(
          { error: 'sessionId와 content가 필요합니다.' },
          { status: 400 }
        )
      }

      // 세션 존재 확인
      const programSession = await prisma.programSession.findUnique({
        where: { id: sessionId },
      })

      if (!programSession) {
        return NextResponse.json({ error: '세션을 찾을 수 없습니다.' }, { status: 404 })
      }

      // SessionReport upsert
      const report = await prisma.sessionReport.upsert({
        where: {
          sessionId_userId: {
            sessionId,
            userId: session.user.id,
          },
        },
        update: {
          templateId: templateId || null,
          content,
          status: status || 'DRAFT',
          submittedAt: status === 'SUBMITTED' ? new Date() : null,
          updatedAt: new Date(),
        },
        create: {
          sessionId,
          userId: session.user.id,
          templateId: templateId || null,
          content,
          status: status || 'DRAFT',
          submittedAt: status === 'SUBMITTED' ? new Date() : null,
        },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })

      return NextResponse.json(report)
    }

    // 기존 방식 (ProgramReport)
    const { sessionId, participantId, title, content, photoUrl, question, visibility, charCount, status } = body

    // Verify participant belongs to user
    const participant = await prisma.programParticipant.findUnique({
      where: { id: participantId },
      include: {
        program: { select: { id: true } }
      }
    })

    if (!participant || participant.userId !== session.user.id) {
      return NextResponse.json({ error: '참가자 정보가 일치하지 않습니다.' }, { status: 403 })
    }

    // Check if already exists
    const existing = await prisma.programReport.findUnique({
      where: {
        sessionId_participantId: {
          sessionId,
          participantId
        }
      }
    })

    if (existing) {
      // Update existing
      const report = await prisma.programReport.update({
        where: { id: existing.id },
        data: {
          title,
          content,
          photoUrl: photoUrl || null,
          question: question || null,
          visibility,
          charCount,
          status,
          submittedAt: status === 'SUBMITTED' ? new Date() : existing.submittedAt
        }
      })
      return NextResponse.json(report)
    }

    // Create new
    const report = await prisma.programReport.create({
      data: {
        sessionId,
        participantId,
        userId: session.user.id,
        programId: participant.program.id,
        title,
        content,
        photoUrl: photoUrl || null,
        question: question || null,
        visibility,
        charCount,
        status,
        submittedAt: status === 'SUBMITTED' ? new Date() : null
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
