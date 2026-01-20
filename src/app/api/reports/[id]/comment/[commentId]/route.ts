import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE /api/reports/[id]/comment/[commentId] - 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id: reportId, commentId } = await params

    // 현재 사용자의 Member 찾기
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { member: true }
    })

    if (!user?.member) {
      return NextResponse.json({ error: '회원 정보를 찾을 수 없습니다.' }, { status: 400 })
    }

    // 댓글 존재 확인 및 권한 체크
    const comment = await prisma.bookReportComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 본인 댓글만 삭제 가능
    if (comment.authorId !== user.member.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
    }

    // 댓글 삭제 (대댓글 있으면 함께 삭제)
    await prisma.bookReportComment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
