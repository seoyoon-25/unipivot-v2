import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/reports/[id]/comment - 댓글 작성 (BookReport용)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id: reportId } = await params
    const { content, parentId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 })
    }

    // 현재 사용자의 Member 찾기
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { member: true }
    })

    if (!user?.member) {
      return NextResponse.json({ error: '회원 정보를 찾을 수 없습니다.' }, { status: 400 })
    }

    // BookReport 존재 확인
    const report = await prisma.bookReport.findUnique({
      where: { id: reportId }
    })

    if (!report) {
      return NextResponse.json({ error: '독후감을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 댓글 생성
    const comment = await prisma.bookReportComment.create({
      data: {
        reportId,
        authorId: user.member.id,
        content: content.trim(),
        parentId: parentId || null
      },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
