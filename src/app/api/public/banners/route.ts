import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: 활성화된 공지 배너 조회
export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    const banners = await prisma.announcementBanner.findMany({
      where: {
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
      },
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
        linkUrl: true,
        linkText: true,
        openInNewTab: true,
        showCloseButton: true,
        isSticky: true,
      },
      take: 5
    })

    // Update impression count (fire and forget)
    if (banners.length > 0) {
      prisma.announcementBanner.updateMany({
        where: {
          id: { in: banners.map(b => b.id) }
        },
        data: {
          impressionCount: { increment: 1 }
        }
      }).catch(console.error)
    }

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Error fetching public banners:', error)
    return NextResponse.json({ banners: [] })
  }
}
