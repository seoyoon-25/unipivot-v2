import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 공지사항 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const notice = await prisma.notice.findUnique({
      where: { id: params.id }
    })

    if (!notice) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(notice)
  } catch (error) {
    console.error('Error fetching notice:', error)
    return NextResponse.json({ error: '공지사항 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 공지사항 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const data = await req.json()

    // 기존 공지사항 확인
    const existingNotice = await prisma.notice.findUnique({
      where: { id: params.id }
    })

    if (!existingNotice) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 필수 필드 검증
    if (!data.title || !data.content) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 })
    }

    const notice = await prisma.notice.update({
      where: { id: params.id },
      data: {
        title: data.title,
        content: data.content,
        isPinned: data.isPinned !== undefined ? data.isPinned : existingNotice.isPinned,
        isPublic: data.isPublic !== undefined ? data.isPublic : existingNotice.isPublic,
      }
    })

    return NextResponse.json(notice)
  } catch (error) {
    console.error('Error updating notice:', error)
    return NextResponse.json({ error: '공지사항 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 공지사항 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 기존 공지사항 확인
    const existingNotice = await prisma.notice.findUnique({
      where: { id: params.id }
    })

    if (!existingNotice) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }

    await prisma.notice.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notice:', error)
    return NextResponse.json({ error: '공지사항 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
