import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // SURVEY, INTERVIEW
    const status = searchParams.get('status') // RECRUITING, CLOSED, etc
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {
      isPublic: true,
    }

    // Only show recruiting or closed (completed) surveys by default
    if (status) {
      where.status = status
    } else {
      where.status = { in: ['RECRUITING', 'CLOSED', 'COMPLETED'] }
    }

    if (type) {
      where.type = type
    }

    const [surveys, total] = await Promise.all([
      prisma.labSurvey.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          targetCount: true,
          currentCount: true,
          targetOrigin: true,
          estimatedTime: true,
          rewardType: true,
          rewardAmount: true,
          startDate: true,
          endDate: true,
          status: true,
          requesterOrg: true,
        },
        orderBy: [
          { status: 'asc' }, // RECRUITING first
          { endDate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.labSurvey.count({ where }),
    ])

    return NextResponse.json({
      surveys,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json(
      { error: '설문조사 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
