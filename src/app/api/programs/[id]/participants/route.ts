import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/programs/[id]/participants - 프로그램 참가자 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const participants = await prisma.programParticipant.findMany({
      where: { programId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, image: true }
        },
        attendances: {
          include: { session: true }
        },
        reports: true,
      },
      orderBy: { joinedAt: 'asc' },
    })

    // 통계 계산
    const stats = participants.map(p => {
      const totalSessions = p.attendances.length
      const presentCount = p.attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
      const reportCount = p.reports.filter(r => r.status === 'SUBMITTED').length

      return {
        ...p,
        stats: {
          totalSessions,
          presentCount,
          attendanceRate: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
          reportCount,
          reportRate: totalSessions > 0 ? Math.round((reportCount / totalSessions) * 100) : 0,
        }
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/programs/[id]/participants - 참가자 추가
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
    const { userId, depositAmount } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 중복 체크
    const existing = await prisma.programParticipant.findUnique({
      where: { programId_userId: { programId, userId } }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already a participant' }, { status: 400 })
    }

    const participant = await prisma.programParticipant.create({
      data: {
        programId,
        userId,
        depositAmount: depositAmount || 0,
        depositStatus: depositAmount ? 'UNPAID' : 'NONE',
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error('Error adding participant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
