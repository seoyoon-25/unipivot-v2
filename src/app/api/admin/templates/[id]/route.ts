import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: 단일 템플릿 조회 + 사용 횟수 증가
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const template = await prisma.contentTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json({ error: '템플릿을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 사용 횟수 증가 (조회 시)
    const { searchParams } = new URL(request.url)
    if (searchParams.get('use') === 'true') {
      await prisma.contentTemplate.update({
        where: { id: params.id },
        data: { useCount: { increment: 1 } },
      })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json({ error: '템플릿을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// PUT: 템플릿 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, content, thumbnail, isDefault, isPublic } = body

    const existingTemplate = await prisma.contentTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: '템플릿을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 기본 템플릿 설정 시 기존 기본 템플릿 해제
    if (isDefault && !existingTemplate.isDefault) {
      await prisma.contentTemplate.updateMany({
        where: {
          category: category || existingTemplate.category,
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    const template = await prisma.contentTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description,
        category,
        content,
        thumbnail,
        isDefault,
        isPublic,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json({ error: '템플릿 수정에 실패했습니다.' }, { status: 500 })
  }
}

// DELETE: 템플릿 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    await prisma.contentTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: '템플릿이 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json({ error: '템플릿 삭제에 실패했습니다.' }, { status: 500 })
  }
}
