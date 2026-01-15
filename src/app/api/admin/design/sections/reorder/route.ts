import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - Reorder sections
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { sectionKeys } = body

    if (!Array.isArray(sectionKeys) || sectionKeys.length === 0) {
      return NextResponse.json({ error: '섹션 키 배열이 필요합니다' }, { status: 400 })
    }

    // Verify all sections exist
    const existingSections = await prisma.siteSection.findMany({
      where: { sectionKey: { in: sectionKeys } },
    })

    if (existingSections.length !== sectionKeys.length) {
      return NextResponse.json({ error: '일부 섹션을 찾을 수 없습니다' }, { status: 400 })
    }

    // Update order for each section
    const updates = await prisma.$transaction(
      sectionKeys.map((sectionKey, index) =>
        prisma.siteSection.update({
          where: { sectionKey },
          data: { order: index + 1 },
        })
      )
    )

    return NextResponse.json({
      success: true,
      updated: updates.length,
      sections: updates
    })
  } catch (error) {
    console.error('Reorder sections error:', error)
    return NextResponse.json(
      { error: '섹션 순서 변경 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}