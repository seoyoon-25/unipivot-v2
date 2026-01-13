import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get user's liked programs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const likes = await prisma.programLike.findMany({
      where: { userId: session.user.id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            image: true,
            thumbnailSquare: true,
            feeType: true,
            feeAmount: true,
            fee: true,
            status: true,
            recruitStartDate: true,
            recruitEndDate: true,
            startDate: true,
            endDate: true,
            likeCount: true,
            applicationCount: true,
            capacity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      likes: likes.map((like) => ({
        id: like.id,
        createdAt: like.createdAt,
        program: like.program,
      })),
    })
  } catch (error) {
    console.error('Get likes error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
