import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 관심사 통계 및 관리 데이터
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'

    if (type === 'dashboard') {
      // 대시보드 통계
      const [
        totalKeywords,
        totalInterests,
        totalAlerts,
        monthlyInterests,
        topKeywords,
        recentInterests,
        pendingAlerts,
      ] = await Promise.all([
        prisma.interestKeyword.count(),
        prisma.interest.count(),
        prisma.interestAlert.count({ where: { isActive: true } }),
        prisma.interest.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(1)), // 이번달 1일부터
            },
          },
        }),
        prisma.interestKeyword.findMany({
          orderBy: { monthlyCount: 'desc' },
          take: 10,
          select: {
            id: true,
            keyword: true,
            category: true,
            totalCount: true,
            monthlyCount: true,
            likeCount: true,
            isFixed: true,
            isRecommended: true,
          },
        }),
        prisma.interest.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            keyword: true,
            user: { select: { name: true, email: true } },
          },
        }),
        prisma.interestAlert.count({
          where: {
            isActive: true,
            notifiedAt: null,
          },
        }),
      ])

      return NextResponse.json({
        stats: {
          totalKeywords,
          totalInterests,
          totalAlerts,
          monthlyInterests,
          pendingAlerts,
        },
        topKeywords,
        recentInterests,
      })
    }

    if (type === 'keywords') {
      // 키워드 관리 목록
      const keywords = await prisma.interestKeyword.findMany({
        orderBy: [{ isFixed: 'desc' }, { monthlyCount: 'desc' }],
        include: {
          _count: {
            select: {
              interests: true,
              alerts: true,
            },
          },
        },
      })

      return NextResponse.json({ keywords })
    }

    if (type === 'alerts') {
      // 알림 신청 목록
      const alerts = await prisma.interestAlert.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          keyword: true,
          user: { select: { name: true, email: true } },
        },
      })

      return NextResponse.json({ alerts })
    }

    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
  } catch (error) {
    console.error('Admin interests error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 키워드 생성/관리
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { action, keywordId, data } = body

    if (action === 'create') {
      // 새 키워드 생성
      const keyword = await prisma.interestKeyword.create({
        data: {
          keyword: data.keyword,
          category: data.category || null,
          isFixed: data.isFixed || false,
          isRecommended: data.isRecommended || false,
        },
      })
      return NextResponse.json({ success: true, keyword })
    }

    if (action === 'update' && keywordId) {
      // 키워드 수정
      const keyword = await prisma.interestKeyword.update({
        where: { id: keywordId },
        data: {
          keyword: data.keyword,
          category: data.category,
          isFixed: data.isFixed,
          isRecommended: data.isRecommended,
          isHidden: data.isHidden,
          relatedProgramIds: data.relatedProgramIds,
        },
      })
      return NextResponse.json({ success: true, keyword })
    }

    if (action === 'hide' && keywordId) {
      // 키워드 숨김
      await prisma.interestKeyword.update({
        where: { id: keywordId },
        data: { isHidden: true },
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'resetMonthly') {
      // 월간 통계 초기화
      await prisma.interestKeyword.updateMany({
        data: { monthlyCount: 0 },
      })
      return NextResponse.json({ success: true, message: '월간 통계가 초기화되었습니다' })
    }

    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
  } catch (error) {
    console.error('Admin interests action error:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - 키워드 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const keywordId = searchParams.get('id')

    if (!keywordId) {
      return NextResponse.json({ error: '키워드 ID가 필요합니다' }, { status: 400 })
    }

    // 고정 키워드는 삭제 불가
    const keyword = await prisma.interestKeyword.findUnique({
      where: { id: keywordId },
    })

    if (keyword?.isFixed) {
      return NextResponse.json(
        { error: '고정 키워드는 삭제할 수 없습니다' },
        { status: 400 }
      )
    }

    // 관련 데이터도 함께 삭제 (cascade로 처리됨)
    await prisma.interestKeyword.delete({
      where: { id: keywordId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete keyword error:', error)
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
