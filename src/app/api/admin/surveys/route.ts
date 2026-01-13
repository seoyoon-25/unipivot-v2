import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 전체 만족도 조사 목록
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const surveys = await prisma.satisfactionSurvey.findMany({
      include: {
        program: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // DRAFT, SENT, CLOSED 순
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ surveys })
  } catch (error) {
    console.error('Get surveys error:', error)
    return NextResponse.json(
      { error: '만족도 조사 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
