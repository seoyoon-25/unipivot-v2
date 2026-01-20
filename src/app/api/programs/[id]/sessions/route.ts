import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import crypto from 'crypto'

// GET /api/programs/[id]/sessions - 프로그램 세션 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sessions = await prisma.programSession.findMany({
      where: { programId: id },
      include: {
        _count: {
          select: {
            attendances: true,
            reports: true,
          }
        }
      },
      orderBy: { sessionNo: 'asc' },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/programs/[id]/sessions - 세션 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: programId } = await params
    const body = await request.json()
    const {
      sessionNo,
      date,
      startTime,
      endTime,
      title,
      bookTitle,
      bookRange,
      location,
      description,
      reportDeadline,
    } = body

    if (!sessionNo || !date) {
      return NextResponse.json({ error: 'sessionNo and date are required' }, { status: 400 })
    }

    // QR 코드 생성
    const qrCode = crypto.randomBytes(16).toString('hex')

    const newSession = await prisma.programSession.create({
      data: {
        programId,
        sessionNo: parseInt(sessionNo),
        date: new Date(date),
        startTime,
        endTime,
        title,
        bookTitle,
        bookRange,
        location,
        description,
        qrCode,
        reportDeadline: reportDeadline ? new Date(reportDeadline) : null,
      },
    })

    // 모든 참가자에게 출석 레코드 생성
    const participants = await prisma.programParticipant.findMany({
      where: { programId, status: 'ACTIVE' }
    })

    if (participants.length > 0) {
      // SQLite doesn't support skipDuplicates, so we create records individually
      for (const p of participants) {
        const existing = await prisma.programAttendance.findFirst({
          where: { sessionId: newSession.id, participantId: p.id }
        })
        if (!existing) {
          await prisma.programAttendance.create({
            data: {
              sessionId: newSession.id,
              participantId: p.id,
              status: 'ABSENT',
            }
          })
        }
      }
    }

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
