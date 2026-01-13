import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/reports - 독후감 작성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
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
