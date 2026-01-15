import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

// 현재 활성 배너 목록 조회 (공개 API)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') as 'TOP' | 'BOTTOM' | null
    const currentPage = searchParams.get('page') || '/'

    // 현재 날짜/시간
    const now = new Date()

    // 기본 필터 조건
    const where: any = {
      isActive: true,
      OR: [
        { isScheduled: false },
        {
          isScheduled: true,
          startDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      ]
    }

    // 위치 필터
    if (position) {
      where.position = position
    }

    // 활성 배너 조회
    let banners = await prisma.announcementBanner.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        backgroundColor: true,
        textColor: true,
        icon: true,
        linkUrl: true,
        linkText: true,
        openInNewTab: true,
        position: true,
        isSticky: true,
        showCloseButton: true,
        autoDismiss: true,
        autoDismissDelay: true,
        targetPages: true,
        targetRoles: true,
        excludePages: true,
        maxDisplayCount: true
      }
    })

    // 타겟팅 필터링
    banners = banners.filter(banner => {
      // 페이지 타겟팅 확인
      if (banner.targetPages) {
        const targetPages = JSON.parse(banner.targetPages as string)
        if (targetPages.length > 0 && !targetPages.includes(currentPage)) {
          return false
        }
      }

      // 페이지 제외 확인
      if (banner.excludePages) {
        const excludePages = JSON.parse(banner.excludePages as string)
        if (excludePages.includes(currentPage)) {
          return false
        }
      }

      // 권한 타겟팅 확인
      if (banner.targetRoles) {
        const targetRoles = JSON.parse(banner.targetRoles as string)
        if (targetRoles.length > 0) {
          if (!session?.user || !targetRoles.includes(session.user.role)) {
            return false
          }
        }
      }

      return true
    })

    // 사용자별 해제 기록 확인
    if (session?.user) {
      const userDismissals = await prisma.bannerDismissal.findMany({
        where: {
          bannerId: { in: banners.map(b => b.id) },
          userId: session.user.id
        },
        select: { bannerId: true }
      })

      const dismissedBannerIds = userDismissals.map(d => d.bannerId)
      banners = banners.filter(banner => !dismissedBannerIds.includes(banner.id))
    } else {
      // 비로그인 사용자의 경우 세션 기반 해제 기록 확인 (구현 시 필요)
      const sessionId = request.headers.get('x-session-id')
      if (sessionId) {
        const sessionDismissals = await prisma.bannerDismissal.findMany({
          where: {
            bannerId: { in: banners.map(b => b.id) },
            sessionId
          },
          select: { bannerId: true }
        })

        const dismissedBannerIds = sessionDismissals.map(d => d.bannerId)
        banners = banners.filter(banner => !dismissedBannerIds.includes(banner.id))
      }
    }

    // 최대 표시 개수 제한 적용
    banners = banners.filter(async (banner) => {
      if (banner.maxDisplayCount) {
        const currentCount = await prisma.bannerAnalytics.aggregate({
          where: { bannerId: banner.id },
          _sum: { impressions: true }
        })
        return (currentCount._sum.impressions || 0) < banner.maxDisplayCount
      }
      return true
    })

    // JSON 필드 파싱
    const processedBanners = banners.map(banner => ({
      ...banner,
      targetPages: banner.targetPages ? JSON.parse(banner.targetPages as string) : [],
      targetRoles: banner.targetRoles ? JSON.parse(banner.targetRoles as string) : [],
      excludePages: banner.excludePages ? JSON.parse(banner.excludePages as string) : []
    }))

    return NextResponse.json({ banners: processedBanners })

  } catch (error) {
    console.error('Error fetching active banners:', error)
    return NextResponse.json(
      { error: '배너를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}