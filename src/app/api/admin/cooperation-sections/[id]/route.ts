import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - 특정 섹션 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id } = await params
    const section = await prisma.cooperationSection.findUnique({
      where: { id },
    })

    if (!section) {
      return NextResponse.json({ error: '섹션을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error fetching cooperation section:', error)
    return NextResponse.json(
      { error: '섹션을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT - 섹션 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    const section = await prisma.cooperationSection.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
        imageAlt: data.imageAlt,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
        isActive: data.isActive,
        order: data.order,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating cooperation section:', error)
    return NextResponse.json(
      { error: '섹션 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - 섹션 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id } = await params

    await prisma.cooperationSection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cooperation section:', error)
    return NextResponse.json(
      { error: '섹션 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
