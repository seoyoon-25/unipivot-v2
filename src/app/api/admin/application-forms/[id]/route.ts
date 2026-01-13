import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get single form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id } = await params

    const form = await prisma.applicationForm.findUnique({
      where: { id },
      include: {
        programs: {
          select: { id: true, title: true },
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: '양식을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Get form error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT - Update form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const form = await prisma.applicationForm.findUnique({
      where: { id },
    })

    if (!form) {
      return NextResponse.json({ error: '양식을 찾을 수 없습니다' }, { status: 404 })
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.fields !== undefined) {
      updateData.fields = typeof body.fields === 'string' ? body.fields : JSON.stringify(body.fields)
    }

    const updated = await prisma.applicationForm.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update form error:', error)
    return NextResponse.json(
      { error: '수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id } = await params

    const form = await prisma.applicationForm.findUnique({
      where: { id },
      include: {
        _count: { select: { programs: true } },
      },
    })

    if (!form) {
      return NextResponse.json({ error: '양식을 찾을 수 없습니다' }, { status: 404 })
    }

    if (form.isDefault) {
      return NextResponse.json(
        { error: '기본 양식은 삭제할 수 없습니다' },
        { status: 400 }
      )
    }

    if (form._count.programs > 0) {
      return NextResponse.json(
        { error: '사용 중인 양식은 삭제할 수 없습니다' },
        { status: 400 }
      )
    }

    await prisma.applicationForm.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete form error:', error)
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
