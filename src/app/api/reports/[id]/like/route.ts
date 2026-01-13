import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/reports/[id]/like - 좋아요 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params

    // Check if already liked
    const existing = await prisma.reportLike.findUnique({
      where: {
        reportId_userId: {
          reportId: id,
          userId: session.user.id
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: '이미 좋아요를 누르셨습니다.' }, { status: 400 })
    }

    // Create like
    await prisma.reportLike.create({
      data: {
        reportId: id,
        userId: session.user.id
      }
    })

    // Update count
    await prisma.programReport.update({
      where: { id },
      data: { likeCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error liking report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/reports/[id]/like - 좋아요 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params

    // Delete like
    await prisma.reportLike.delete({
      where: {
        reportId_userId: {
          reportId: id,
          userId: session.user.id
        }
      }
    })

    // Update count
    await prisma.programReport.update({
      where: { id },
      data: { likeCount: { decrement: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unliking report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
