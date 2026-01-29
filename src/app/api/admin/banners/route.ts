import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Banner 생성/수정을 위한 스키마
const bannerSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().optional(),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'MAINTENANCE']).default('INFO'),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  icon: z.string().optional(),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  openInNewTab: z.boolean().default(false),
  position: z.enum(['TOP', 'BOTTOM']).default('TOP'),
  isSticky: z.boolean().default(false),
  showCloseButton: z.boolean().default(true),
  autoDismiss: z.boolean().default(false),
  autoDismissDelay: z.number().min(1).optional(),
  isScheduled: z.boolean().default(false),
  startDate: z.string().transform((str) => str ? new Date(str) : null).optional(),
  endDate: z.string().transform((str) => str ? new Date(str) : null).optional(),
  targetPages: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  excludePages: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  priority: z.number().default(0),
  maxDisplayCount: z.number().min(1).optional(),
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 모든 배너 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const status = searchParams.get('status') // active, inactive, scheduled
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (type && type !== 'all') {
      where.type = type
    }

    if (status) {
      if (status === 'active') {
        where.isActive = true
        where.OR = [
          { isScheduled: false },
          {
            isScheduled: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          }
        ]
      } else if (status === 'inactive') {
        where.isActive = false
      } else if (status === 'scheduled') {
        where.isScheduled = true
        where.startDate = { gt: new Date() }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    const [banners, total] = await Promise.all([
      prisma.announcementBanner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.announcementBanner.count({ where })
    ])

    return NextResponse.json({
      banners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: '배너 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 배너 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = bannerSchema.parse(body)

    // 스케줄링 데이터 검증
    if (validatedData.isScheduled) {
      if (!validatedData.startDate) {
        return NextResponse.json(
          { error: '스케줄링을 사용하려면 시작일을 설정해주세요.' },
          { status: 400 }
        )
      }
      if (validatedData.endDate && validatedData.startDate > validatedData.endDate) {
        return NextResponse.json(
          { error: '시작일은 종료일보다 이전이어야 합니다.' },
          { status: 400 }
        )
      }
    }

    const banner = await prisma.announcementBanner.create({
      data: {
        ...validatedData,
        targetPages: validatedData.targetPages ? JSON.stringify(validatedData.targetPages) : null,
        targetRoles: validatedData.targetRoles ? JSON.stringify(validatedData.targetRoles) : null,
        excludePages: validatedData.excludePages ? JSON.stringify(validatedData.excludePages) : null,
        createdBy: userId,
      }
    })

    return NextResponse.json({ banner }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: '배너 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
