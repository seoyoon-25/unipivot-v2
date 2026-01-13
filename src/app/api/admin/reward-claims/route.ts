import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 사례비 신청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('surveyId')
    const status = searchParams.get('status')
    const flagged = searchParams.get('flagged')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // 필터 조건
    const where: any = {}

    if (surveyId) {
      where.surveyId = surveyId
    }

    if (status) {
      where.status = status
    }

    if (flagged === 'true') {
      where.flagged = true
    }

    // 총 개수
    const total = await prisma.rewardClaim.count({ where })

    // 목록 조회
    const claims = await prisma.rewardClaim.findMany({
      where,
      include: {
        survey: {
          select: {
            id: true,
            title: true,
            rewardAmount: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { flagged: 'desc' }, // 플래그된 것 먼저
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // 통계
    const stats = await prisma.rewardClaim.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        amount: true,
      },
    })

    const flaggedCount = await prisma.rewardClaim.count({
      where: { flagged: true, status: 'PENDING' },
    })

    return NextResponse.json({
      claims,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        byStatus: stats,
        flaggedPending: flaggedCount,
      },
    })
  } catch (error) {
    console.error('Get reward claims error:', error)
    return NextResponse.json(
      { error: '사례비 신청 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 일괄 처리
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { action, claimIds, reason } = body

    if (!action || !claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json(
        { error: '처리할 신청 건을 선택해주세요.' },
        { status: 400 }
      )
    }

    const now = new Date()
    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData = {
          status: 'APPROVED',
          approvedAt: now,
          approvedBy: session.user.id,
        }
        break

      case 'reject':
        updateData = {
          status: 'REJECTED',
          rejectedReason: reason || '관리자에 의해 거절됨',
        }
        break

      case 'pay':
        updateData = {
          status: 'PAID',
          paidAt: now,
          paidBy: session.user.id,
        }
        break

      case 'unflag':
        updateData = {
          flagged: false,
          flagReason: null,
        }
        break

      default:
        return NextResponse.json({ error: '유효하지 않은 액션입니다.' }, { status: 400 })
    }

    // 일괄 업데이트
    const result = await prisma.rewardClaim.updateMany({
      where: {
        id: { in: claimIds },
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: `${result.count}건이 처리되었습니다.`,
      count: result.count,
    })
  } catch (error) {
    console.error('Bulk process reward claims error:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
