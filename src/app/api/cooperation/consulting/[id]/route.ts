import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT - 자문요청 상태/메모 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { status, adminNote } = body

    const updated = await prisma.consultingRequest.update({
      where: { id: params.id },
      data: {
        status,
        adminNote,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update consulting request error:', error)
    return NextResponse.json(
      { error: '수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET - 자문요청 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const consulting = await prisma.consultingRequest.findUnique({
      where: { id: params.id },
    })

    if (!consulting) {
      return NextResponse.json({ error: '요청을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(consulting)
  } catch (error) {
    console.error('Get consulting request error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - 자문요청 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    await prisma.consultingRequest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete consulting request error:', error)
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
