import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Get public site configuration
export async function GET() {
  try {
    // Get visible sections only
    const sections = await prisma.siteSection.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
      select: {
        sectionKey: true,
        sectionName: true,
        content: true,
        order: true
      }
    })

    // Get site settings
    const settings = await prisma.siteSettings.findMany({
      select: {
        key: true,
        value: true,
        category: true
      }
    })

    // Convert settings to key-value map
    const settingsMap: Record<string, any> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    // Convert sections to key-value map for easier access
    const sectionsMap: Record<string, any> = {}
    sections.forEach((s) => {
      sectionsMap[s.sectionKey] = {
        name: s.sectionName,
        content: s.content,
        order: s.order
      }
    })

    return NextResponse.json({
      sections: sectionsMap,
      settings: settingsMap,
      sectionOrder: sections.map(s => s.sectionKey)
    })
  } catch (error) {
    console.error('Get public site config error:', error)
    return NextResponse.json(
      { error: '사이트 구성 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// Cache for 5 minutes
export const revalidate = 300