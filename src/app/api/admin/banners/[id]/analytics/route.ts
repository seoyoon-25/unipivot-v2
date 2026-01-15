import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 배너 분석 데이터 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 배너 존재 확인
    const banner = await prisma.announcementBanner.findUnique({
      where: { id },
      select: { id: true, title: true }
    })

    if (!banner) {
      return NextResponse.json(
        { error: '배너를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 날짜 범위 설정
    const endDateObj = endDate ? new Date(endDate) : new Date()
    const startDateObj = startDate
      ? new Date(startDate)
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // 일별 분석 데이터 조회
    const analytics = await prisma.bannerAnalytics.findMany({
      where: {
        bannerId: id,
        date: {
          gte: startDateObj,
          lte: endDateObj
        }
      },
      orderBy: { date: 'asc' }
    })

    // 전체 통계
    const totalStats = await prisma.bannerAnalytics.aggregate({
      where: {
        bannerId: id,
        date: {
          gte: startDateObj,
          lte: endDateObj
        }
      },
      _sum: {
        impressions: true,
        clicks: true,
        dismissals: true,
        uniqueUsers: true
      }
    })

    // 최근 해제 기록 (최근 100개)
    const recentDismissals = await prisma.bannerDismissal.findMany({
      where: { bannerId: id },
      orderBy: { dismissedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        userId: true,
        sessionId: true,
        dismissedAt: true
      }
    })

    // 클릭률(CTR) 및 해제율 계산
    const totalImpressions = totalStats._sum.impressions || 0
    const totalClicks = totalStats._sum.clicks || 0
    const totalDismissals = totalStats._sum.dismissals || 0

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const dismissalRate = totalImpressions > 0 ? (totalDismissals / totalImpressions) * 100 : 0

    return NextResponse.json({
      banner: {
        id: banner.id,
        title: banner.title
      },
      dateRange: {
        startDate: startDateObj,
        endDate: endDateObj,
        days
      },
      summary: {
        totalImpressions,
        totalClicks,
        totalDismissals,
        uniqueUsers: totalStats._sum.uniqueUsers || 0,
        ctr: Math.round(ctr * 100) / 100, // 소수점 둘째 자리
        dismissalRate: Math.round(dismissalRate * 100) / 100
      },
      dailyAnalytics: analytics,
      recentDismissals
    })

  } catch (error) {
    console.error('Error fetching banner analytics:', error)
    return NextResponse.json(
      { error: '배너 분석 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}