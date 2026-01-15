import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 동적 렌더링 강제 (request.url, searchParams 사용)
export const dynamic = 'force-dynamic'

// GET: 활성화된 팝업 목록 조회 (클라이언트용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '/'
    const device = searchParams.get('device') || 'desktop'
    const userAgent = request.headers.get('user-agent') || ''

    // 현재 시간
    const now = new Date()

    // 활성화된 팝업 조회
    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        OR: [
          { showAfterDate: null },
          { showAfterDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { showUntilDate: null },
              { showUntilDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            width: true,
            height: true,
            borderRadius: true,
            shadow: true,
            backgroundColor: true,
            borderColor: true,
            textColor: true,
            animation: true,
            duration: true,
            overlayColor: true,
            blurBackground: true
          }
        }
      }
    })

    // 페이지 및 디바이스 필터링
    const filteredPopups = popups.filter(popup => {
      // 페이지 타겟팅 확인
      if (popup.targetPages) {
        const targetPages = JSON.parse(popup.targetPages)
        if (targetPages.length > 0 && !targetPages.includes(page)) {
          return false
        }
      }

      // 제외 페이지 확인
      if (popup.excludePages) {
        const excludePages = JSON.parse(popup.excludePages)
        if (excludePages.includes(page)) {
          return false
        }
      }

      // 디바이스 필터링
      if (popup.showOn !== 'all') {
        if (popup.showOn === 'mobile' && !device.includes('mobile')) {
          return false
        }
        if (popup.showOn === 'tablet' && !device.includes('tablet')) {
          return false
        }
        if (popup.showOn === 'desktop' && (device.includes('mobile') || device.includes('tablet'))) {
          return false
        }
      }

      return true
    })

    // 시간대 필터링
    const timeFilteredPopups = filteredPopups.filter(popup => {
      if (!popup.showTimeSlots) return true

      try {
        const timeSlots = JSON.parse(popup.showTimeSlots)
        if (timeSlots.length === 0) return true

        const currentHour = now.getHours()
        return timeSlots.some((slot: string) => {
          const [start, end] = slot.split('-').map(Number)
          return currentHour >= start && currentHour < end
        })
      } catch {
        return true
      }
    })

    // 클라이언트에게 반환할 데이터 정리
    const clientPopups = timeFilteredPopups.map(popup => ({
      id: popup.id,
      title: popup.title,
      content: popup.content,
      trigger: popup.trigger,
      triggerValue: popup.triggerValue,
      triggerSelector: popup.triggerSelector,
      showCloseButton: popup.showCloseButton,
      closeOnOverlay: popup.closeOnOverlay,
      closeOnEscape: popup.closeOnEscape,
      autoClose: popup.autoClose,
      autoCloseDelay: popup.autoCloseDelay,
      primaryButton: popup.primaryButton ? JSON.parse(popup.primaryButton) : null,
      secondaryButton: popup.secondaryButton ? JSON.parse(popup.secondaryButton) : null,
      template: popup.template,
      customCss: popup.customCss,
      priority: popup.priority,
      showOncePerSession: popup.showOncePerSession,
      showOncePerUser: popup.showOncePerUser,
      maxDisplayPerDay: popup.maxDisplayPerDay,
      delayBetweenShows: popup.delayBetweenShows
    }))

    return NextResponse.json({
      popups: clientPopups,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Error fetching active popups:', error)
    return NextResponse.json(
      { error: '활성 팝업을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}