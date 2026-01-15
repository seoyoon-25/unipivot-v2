import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { trackSiteSectionChange, compareObjects } from '@/lib/change-tracker'

// GET - Get specific section by key
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { key } = params

    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: key },
    })

    if (!section) {
      return NextResponse.json({ error: '섹션을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ section })
  } catch (error) {
    console.error('Get section error:', error)
    return NextResponse.json(
      { error: '섹션 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT - Update specific section
export async function PUT(
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
    const { content, sectionName, isVisible, order } = body

    // Find existing section
    const existingSection = await prisma.siteSection.findUnique({
      where: { sectionKey: key },
    })

    if (!existingSection) {
      return NextResponse.json({ error: '섹션을 찾을 수 없습니다' }, { status: 404 })
    }

    // IP 주소 수집
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    const userAgent = request.headers.get('user-agent')

    // 기존 데이터 복사 (변경 추적용)
    const previousSnapshot = {
      id: existingSection.id,
      sectionKey: existingSection.sectionKey,
      sectionName: existingSection.sectionName,
      content: existingSection.content,
      isVisible: existingSection.isVisible,
      order: existingSection.order
    }

    // Update section
    const updatedSection = await prisma.siteSection.update({
      where: { sectionKey: key },
      data: {
        ...(content !== undefined && { content }),
        ...(sectionName !== undefined && { sectionName }),
        ...(isVisible !== undefined && { isVisible }),
        ...(order !== undefined && { order }),
      },
    })

    // 새로운 데이터 스냅샷
    const newSnapshot = {
      id: updatedSection.id,
      sectionKey: updatedSection.sectionKey,
      sectionName: updatedSection.sectionName,
      content: updatedSection.content,
      isVisible: updatedSection.isVisible,
      order: updatedSection.order
    }

    // 변경 사항 추적
    try {
      const changes = compareObjects(previousSnapshot, newSnapshot)
      if (changes.length > 0) {
        await trackSiteSectionChange(
          'UPDATE',
          updatedSection.id,
          session.user.id,
          newSnapshot,
          previousSnapshot,
          {
            description: `${existingSection.sectionName} 섹션 업데이트 (${changes.length}개 필드 변경)`,
            ipAddress,
            userAgent: userAgent || undefined
          }
        )
      }
    } catch (trackingError) {
      console.error('Error tracking section change:', trackingError)
      // 추적 오류는 업데이트 작업을 방해하지 않음
    }

    return NextResponse.json({ section: updatedSection })
  } catch (error) {
    console.error('Update section error:', error)
    return NextResponse.json(
      { error: '섹션 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}