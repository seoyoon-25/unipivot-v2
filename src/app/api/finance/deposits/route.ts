import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/deposits - 전체 보증금 현황 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 보증금이 있는 참여자 조회
    const participants = await prisma.programParticipant.findMany({
      where: {
        depositAmount: { gt: 0 }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        program: {
          select: { id: true, title: true }
        }
      },
      orderBy: [
        { depositStatus: 'asc' },
        { depositPaidAt: 'desc' }
      ]
    })

    // 요약 계산
    const summary = participants.reduce((acc, p) => {
      acc.totalDeposits++

      if (p.depositStatus === 'PAID') {
        acc.paidCount++
        acc.totalPaid += p.depositAmount
        acc.pendingCount++ // 납부했지만 미정산
      }
      if (p.depositStatus === 'RETURNED') {
        acc.returnedCount++
        acc.totalReturned += p.returnAmount || 0
      }
      if (p.depositStatus === 'FORFEITED') {
        acc.forfeitedCount++
        acc.totalForfeited += p.forfeitAmount || 0
      }

      return acc
    }, {
      totalDeposits: 0,
      paidCount: 0,
      returnedCount: 0,
      forfeitedCount: 0,
      pendingCount: 0,
      totalPaid: 0,
      totalReturned: 0,
      totalForfeited: 0
    })

    // 정산 대기는 PAID 상태인 것만
    summary.pendingCount = participants.filter(p => p.depositStatus === 'PAID').length

    return NextResponse.json({
      participants,
      summary
    })
  } catch (error) {
    console.error('Error fetching deposits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
