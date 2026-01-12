import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/programs/[id]/deposit - 보증금 설정 및 현황 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: programId } = await params

    const [depositSetting, participants] = await Promise.all([
      prisma.depositSetting.findUnique({ where: { programId } }),
      prisma.programParticipant.findMany({
        where: { programId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          attendances: true,
          reports: { where: { status: 'SUBMITTED' } }
        }
      })
    ])

    // 정산 현황 계산
    const summary = participants.reduce((acc, p) => {
      acc.totalParticipants++
      acc.totalDeposits += p.depositAmount
      if (p.depositStatus === 'PAID') acc.paidCount++
      if (p.depositStatus === 'RETURNED') acc.returnedAmount += (p.returnAmount || 0)
      if (p.depositStatus === 'FORFEITED') acc.forfeitedAmount += (p.forfeitAmount || 0)
      return acc
    }, {
      totalParticipants: 0,
      totalDeposits: 0,
      paidCount: 0,
      returnedAmount: 0,
      forfeitedAmount: 0
    })

    return NextResponse.json({
      setting: depositSetting,
      participants,
      summary
    })
  } catch (error) {
    console.error('Error fetching deposit info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/programs/[id]/deposit - 보증금 설정 생성/업데이트
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
      isEnabled,
      totalSessions,
      depositAmount,
      conditionType,
      attendanceRate,
      reportRate
    } = body

    const setting = await prisma.depositSetting.upsert({
      where: { programId },
      update: {
        isEnabled: isEnabled ?? true,
        totalSessions: parseInt(totalSessions),
        depositAmount: parseInt(depositAmount),
        conditionType: conditionType || 'ATTENDANCE_ONLY',
        attendanceRate: attendanceRate ? parseInt(attendanceRate) : 80,
        reportRate: reportRate ? parseInt(reportRate) : null,
      },
      create: {
        programId,
        isEnabled: isEnabled ?? true,
        totalSessions: parseInt(totalSessions),
        depositAmount: parseInt(depositAmount),
        conditionType: conditionType || 'ATTENDANCE_ONLY',
        attendanceRate: attendanceRate ? parseInt(attendanceRate) : 80,
        reportRate: reportRate ? parseInt(reportRate) : null,
      }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating deposit setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/programs/[id]/deposit - 보증금 정산
export async function PUT(
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
    const { participantId, returnAmount, forfeitAmount, returnMethod, note } = body

    if (!participantId) {
      return NextResponse.json({ error: 'participantId is required' }, { status: 400 })
    }

    const participant = await prisma.programParticipant.update({
      where: { id: participantId },
      data: {
        returnAmount: returnAmount ? parseInt(returnAmount) : undefined,
        forfeitAmount: forfeitAmount ? parseInt(forfeitAmount) : undefined,
        returnMethod,
        settleNote: note,
        settledAt: new Date(),
        depositStatus: returnAmount > 0 ? 'RETURNED' : forfeitAmount > 0 ? 'FORFEITED' : 'PAID'
      }
    })

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error settling deposit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
