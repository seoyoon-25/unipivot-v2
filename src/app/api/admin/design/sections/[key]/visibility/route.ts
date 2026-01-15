import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH - Toggle section visibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { key } = params
    const body = await request.json()
    const { isVisible } = body

    if (typeof isVisible !== 'boolean') {
      return NextResponse.json({ error: '유효한 표시 상태가 필요합니다' }, { status: 400 })
    }

    // Find existing section
    const existingSection = await prisma.siteSection.findUnique({
      where: { sectionKey: key },
    })

    if (!existingSection) {
      return NextResponse.json({ error: '섹션을 찾을 수 없습니다' }, { status: 404 })
    }

    // Update visibility
    const updatedSection = await prisma.siteSection.update({
      where: { sectionKey: key },
      data: { isVisible },
    })

    return NextResponse.json({
      section: updatedSection,
      message: `섹션이 ${isVisible ? '표시' : '숨김'}로 설정되었습니다`
    })
  } catch (error) {
    console.error('Toggle section visibility error:', error)
    return NextResponse.json(
      { error: '섹션 표시 설정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}