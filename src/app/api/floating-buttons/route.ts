import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 현재 활성 플로팅 버튼 목록 조회 (공개 API)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') as 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'CUSTOM' | null
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

    // 활성 버튼 조회
    let buttons = await prisma.floatingButton.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        icon: true,
        color: true,
        hoverColor: true,
        textColor: true,
        linkUrl: true,
        openInNewTab: true,
        position: true,
        offsetX: true,
        offsetY: true,
        size: true,
        showLabel: true,
        animation: true,
        animationDelay: true,
        showOn: true,
        scrollThreshold: true,
        targetPages: true,
        targetRoles: true,
        excludePages: true,
        maxDisplayCount: true
      }
    })

    // 타겟팅 필터링
    buttons = buttons.filter(button => {
      // 페이지 타겟팅 확인
      if (button.targetPages) {
        const targetPages = JSON.parse(button.targetPages as string)
        if (targetPages.length > 0 && !targetPages.includes(currentPage)) {
          return false
        }
      }

      // 페이지 제외 확인
      if (button.excludePages) {
        const excludePages = JSON.parse(button.excludePages as string)
        if (excludePages.includes(currentPage)) {
          return false
        }
      }

      // 권한 타겟팅 확인
      if (button.targetRoles) {
        const targetRoles = JSON.parse(button.targetRoles as string)
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
      const userDismissals = await prisma.floatingButtonDismissal.findMany({
        where: {
          buttonId: { in: buttons.map(b => b.id) },
          userId: session.user.id
        },
        select: { buttonId: true }
      })

      const dismissedButtonIds = userDismissals.map(d => d.buttonId)
      buttons = buttons.filter(button => !dismissedButtonIds.includes(button.id))
    } else {
      // 비로그인 사용자의 경우 세션 기반 해제 기록 확인
      const sessionId = request.headers.get('x-session-id')
      if (sessionId) {
        const sessionDismissals = await prisma.floatingButtonDismissal.findMany({
          where: {
            buttonId: { in: buttons.map(b => b.id) },
            sessionId
          },
          select: { buttonId: true }
        })

        const dismissedButtonIds = sessionDismissals.map(d => d.buttonId)
        buttons = buttons.filter(button => !dismissedButtonIds.includes(button.id))
      }
    }

    // 최대 표시 개수 제한 적용
    const filteredButtons = []
    for (const button of buttons) {
      if (button.maxDisplayCount) {
        const currentCount = await prisma.floatingButtonAnalytics.aggregate({
          where: { buttonId: button.id },
          _sum: { impressions: true }
        })
        if ((currentCount._sum.impressions || 0) >= button.maxDisplayCount) {
          continue
        }
      }
      filteredButtons.push(button)
    }

    // JSON 필드 파싱
    const processedButtons = filteredButtons.map(button => ({
      ...button,
      targetPages: button.targetPages ? JSON.parse(button.targetPages as string) : [],
      targetRoles: button.targetRoles ? JSON.parse(button.targetRoles as string) : [],
      excludePages: button.excludePages ? JSON.parse(button.excludePages as string) : []
    }))

    return NextResponse.json({ buttons: processedButtons })

  } catch (error) {
    console.error('Error fetching active floating buttons:', error)
    return NextResponse.json(
      { error: '플로팅 버튼을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}