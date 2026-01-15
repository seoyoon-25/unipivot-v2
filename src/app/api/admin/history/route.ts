import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 변경 이력 조회 스키마
const getHistorySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
  userId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 변경 이력 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const validatedParams = getHistorySchema.parse(Object.fromEntries(searchParams))

    const page = parseInt(validatedParams.page || '1')
    const limit = parseInt(validatedParams.limit || '50')
    const offset = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (validatedParams.entityType) {
      where.entityType = validatedParams.entityType
    }

    if (validatedParams.entityId) {
      where.entityId = validatedParams.entityId
    }

    if (validatedParams.action) {
      where.action = validatedParams.action
    }

    if (validatedParams.userId) {
      where.userId = validatedParams.userId
    }

    if (validatedParams.startDate || validatedParams.endDate) {
      where.createdAt = {}
      if (validatedParams.startDate) {
        where.createdAt.gte = new Date(validatedParams.startDate)
      }
      if (validatedParams.endDate) {
        where.createdAt.lte = new Date(validatedParams.endDate)
      }
    }

    // 변경 이력 조회
    const [history, totalCount] = await Promise.all([
      prisma.changeHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          rollbacks: {
            select: {
              id: true,
              rollbackType: true,
              rolledBackAt: true,
              userId: true
            }
          }
        }
      }),
      prisma.changeHistory.count({ where })
    ])

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      history,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 파라미터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error fetching change history:', error)
    return NextResponse.json(
      { error: '변경 이력을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 변경 이력 기록 (내부 API용)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    // 변경 이력 기록 생성 스키마
    const createHistorySchema = z.object({
      entityType: z.string(),
      entityId: z.string(),
      action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
      fieldName: z.string().optional(),
      previousValue: z.any().optional(),
      newValue: z.any().optional(),
      fullSnapshot: z.any(),
      description: z.string().optional(),
      isAutoSave: z.boolean().default(false)
    })

    const validatedData = createHistorySchema.parse(body)

    // IP 주소 수집
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'

    // 변경 이력 생성
    const history = await prisma.changeHistory.create({
      data: {
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        action: validatedData.action,
        fieldName: validatedData.fieldName,
        previousValue: validatedData.previousValue,
        newValue: validatedData.newValue,
        fullSnapshot: validatedData.fullSnapshot,
        userId: session.user.id,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent'),
        description: validatedData.description,
        isAutoSave: validatedData.isAutoSave
      }
    })

    return NextResponse.json({ history }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating change history:', error)
    return NextResponse.json(
      { error: '변경 이력 기록에 실패했습니다.' },
      { status: 500 }
    )
  }
}