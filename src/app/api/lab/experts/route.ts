import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isPublic: true,
      isActive: true,
    }

    if (category) {
      where.categories = {
        contains: category,
        mode: 'insensitive' as const,
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { title: { contains: search, mode: 'insensitive' as const } },
        { organization: { contains: search, mode: 'insensitive' as const } },
        { specialties: { contains: search, mode: 'insensitive' as const } },
        { keywords: { contains: search, mode: 'insensitive' as const } },
        { lectureTopics: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    // Fetch experts with pagination
    const [experts, total] = await Promise.all([
      prisma.expertProfile.findMany({
        where,
        select: {
          id: true,
          name: true,
          photo: true,
          title: true,
          organization: true,
          categories: true,
          specialties: true,
          lectureTopics: true,
          lectureFeeMin: true,
          lectureFeeMax: true,
          lectureCount: true,
          consultingCount: true,
          isVerified: true,
          bio: true,
        },
        orderBy: [
          { isVerified: 'desc' },
          { lectureCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.expertProfile.count({ where }),
    ])

    return NextResponse.json({
      experts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching experts:', error)
    return NextResponse.json(
      { error: '전문가 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
