import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 내 응답 대기 중인 만족도 조사 목록
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 내가 참여한 프로그램 중 만족도 조사가 발송되었고 아직 응답하지 않은 것
    const pendingSurveys = await prisma.satisfactionSurvey.findMany({
      where: {
        status: 'SENT',
        deadline: { gte: new Date() },
        program: {
          applications: {
            some: {
              userId: session.user.id,
              status: 'ACCEPTED',
              surveySubmitted: false,
            },
          },
        },
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { deadline: 'asc' },
    })

    return NextResponse.json({ surveys: pendingSurveys })
  } catch (error) {
    console.error('Get surveys error:', error)
    return NextResponse.json(
      { error: '만족도 조사 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
