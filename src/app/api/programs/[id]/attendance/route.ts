import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/programs/[id]/attendance - 출석 현황 조회
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

    const where: Record<string, unknown> = {
      session: { programId }
    }
    if (sessionId) where.sessionId = sessionId

    const attendances = await prisma.programAttendance.findMany({
      where,
      include: {
        session: true,
        participant: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } }
          }
        }
      },
      orderBy: [
        { session: { sessionNo: 'asc' } },
        { participant: { user: { name: 'asc' } } }
      ]
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/programs/[id]/attendance - 출석 체크 (QR or 수동)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: programId } = await params
    const body = await request.json()
    const { sessionId, qrCode, participantId, status } = body

    // QR 코드로 출석 체크
    if (qrCode) {
      const programSession = await prisma.programSession.findFirst({
        where: { programId, qrCode }
      })

      if (!programSession) {
        return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 })
      }

      // QR 만료 체크
      if (programSession.qrExpiresAt && programSession.qrExpiresAt < new Date()) {
        return NextResponse.json({ error: 'QR code expired' }, { status: 400 })
      }

      // 현재 사용자의 참가자 정보 찾기
      const participant = await prisma.programParticipant.findFirst({
        where: { programId, userId: session.user?.id }
      })

      if (!participant) {
        return NextResponse.json({ error: 'Not a participant' }, { status: 400 })
      }

      // 출석 업데이트
      const attendance = await prisma.programAttendance.upsert({
        where: {
          sessionId_participantId: {
            sessionId: programSession.id,
            participantId: participant.id
          }
        },
        update: {
          status: 'PRESENT',
          checkedAt: new Date(),
          checkMethod: 'QR'
        },
        create: {
          sessionId: programSession.id,
          participantId: participant.id,
          status: 'PRESENT',
          checkedAt: new Date(),
          checkMethod: 'QR'
        }
      })

      return NextResponse.json(attendance)
    }

    // 수동 출석 체크 (관리자)
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!sessionId || !participantId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const attendance = await prisma.programAttendance.upsert({
      where: {
        sessionId_participantId: { sessionId, participantId }
      },
      update: {
        status,
        checkedAt: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
        checkMethod: 'MANUAL'
      },
      create: {
        sessionId,
        participantId,
        status,
        checkedAt: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
        checkMethod: 'MANUAL'
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
