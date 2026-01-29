import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - 활성화된 이슈 설문 목록 조회 (공개용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'ACTIVE'

    const now = new Date()

    const surveys = await prisma.issueSurvey.findMany({
      where: {
        status,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // 응답 수 포함하여 반환
    const surveysWithStats = surveys.map(survey => ({
      ...survey,
      responseCount: survey._count.responses,
      _count: undefined
    }))

    return NextResponse.json({
      surveys: surveysWithStats,
      total: surveysWithStats.length
    })
  } catch (error) {
    console.error('Get issue surveys error:', error)
    return NextResponse.json(
      { error: '설문 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
