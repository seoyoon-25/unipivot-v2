import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const source = searchParams.get('source')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (source) {
      where.source = source
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { authors: { contains: search, mode: 'insensitive' } },
        { keywords: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [trends, total] = await Promise.all([
      prisma.researchTrend.findMany({
        where,
        orderBy: { publishedDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.researchTrend.count({ where }),
    ])

    return NextResponse.json({
      trends,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json(
      { error: '연구동향을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
