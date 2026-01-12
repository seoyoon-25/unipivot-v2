import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/programs/[id]/reports - 독후감/보고서 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: programId } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const visibility = searchParams.get('visibility')

    const where: Record<string, unknown> = { programId }
    if (sessionId) where.sessionId = sessionId
    if (visibility) where.visibility = visibility

    // 일반 사용자는 공개된 것만 또는 자신의 것만
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN') {
      where.OR = [
        { visibility: 'PUBLIC' },
        { userId: session.user?.id }
      ]
    }

    const reports = await prisma.programReport.findMany({
      where,
      include: {
        session: true,
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, likes: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/programs/[id]/reports - 독후감 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: programId } = await params
    const body = await request.json()
    const { sessionId, title, content, photoUrl, question, visibility } = body

    if (!sessionId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 참가자 확인
    const participant = await prisma.programParticipant.findFirst({
      where: { programId, userId: session.user.id }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 400 })
    }

    // 이미 작성했는지 확인
    const existing = await prisma.programReport.findUnique({
      where: {
        sessionId_participantId: { sessionId, participantId: participant.id }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    }

    const report = await prisma.programReport.create({
      data: {
        sessionId,
        participantId: participant.id,
        userId: session.user.id,
        programId,
        title,
        content,
        charCount: content.length,
        photoUrl,
        question,
        visibility: visibility || 'PARTICIPANTS',
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        session: true,
        user: { select: { id: true, name: true, image: true } }
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
