import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - Toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: programId } = await params
    const userId = session.user.id

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.programLike.findUnique({
      where: {
        programId_userId: {
          programId,
          userId,
        },
      },
    })

    let liked: boolean
    let likeCount: number

    if (existingLike) {
      // Unlike
      await prisma.programLike.delete({
        where: { id: existingLike.id },
      })

      // Decrement like count
      const updated = await prisma.program.update({
        where: { id: programId },
        data: { likeCount: { decrement: 1 } },
      })

      liked = false
      likeCount = Math.max(0, updated.likeCount)
    } else {
      // Like
      await prisma.programLike.create({
        data: {
          programId,
          userId,
        },
      })

      // Increment like count
      const updated = await prisma.program.update({
        where: { id: programId },
        data: { likeCount: { increment: 1 } },
      })

      liked = true
      likeCount = updated.likeCount
    }

    return NextResponse.json({ liked, likeCount })
  } catch (error) {
    console.error('Like toggle error:', error)
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET - Check if current user has liked the program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: programId } = await params

    // Get program with like count
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { likeCount: true },
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다' }, { status: 404 })
    }

    let liked = false
    if (session?.user?.id) {
      const existingLike = await prisma.programLike.findUnique({
        where: {
          programId_userId: {
            programId,
            userId: session.user.id,
          },
        },
      })
      liked = !!existingLike
    }

    return NextResponse.json({
      liked,
      likeCount: program.likeCount,
    })
  } catch (error) {
    console.error('Get like status error:', error)
    return NextResponse.json(
      { error: '좋아요 상태를 확인하는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
