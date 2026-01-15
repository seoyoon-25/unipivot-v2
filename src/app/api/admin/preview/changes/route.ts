import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 변경사항 기록 스키마
const recordChangeSchema = z.object({
  sessionId: z.string().cuid(),
  changeType: z.enum(['sections', 'banners', 'floating_buttons', 'seo']),
  action: z.enum(['create', 'update', 'delete', 'reorder']),
  targetId: z.string(),
  targetType: z.string(),
  before: z.any().optional(),
  after: z.any().optional()
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 변경사항 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const changeType = searchParams.get('changeType')
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 세션 소유권 확인
    const session = await prisma.previewSession.findFirst({
      where: { id: sessionId, userId }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = { sessionId }

    if (changeType) {
      where.changeType = changeType
    }

    if (action) {
      where.action = action
    }

    const [changes, total] = await Promise.all([
      prisma.previewChange.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.previewChange.count({ where })
    ])

    return NextResponse.json({
      changes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching preview changes:', error)
    return NextResponse.json(
      { error: '변경사항 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 변경사항 기록
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = recordChangeSchema.parse(body)

    // 세션 소유권 확인
    const session = await prisma.previewSession.findFirst({
      where: { id: validatedData.sessionId, userId }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 요청 메타데이터 수집
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    const userAgent = request.headers.get('user-agent')

    const change = await prisma.previewChange.create({
      data: {
        sessionId: validatedData.sessionId,
        changeType: validatedData.changeType,
        action: validatedData.action,
        targetId: validatedData.targetId,
        targetType: validatedData.targetType,
        before: validatedData.before,
        after: validatedData.after,
        userId: userId!,
        ipAddress: ip,
        userAgent
      }
    })

    return NextResponse.json({ change }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error recording preview change:', error)
    return NextResponse.json(
      { error: '변경사항 기록에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 변경사항 기록 삭제 (세션 정리용)
export async function DELETE(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const olderThan = searchParams.get('olderThan') // ISO 날짜 문자열

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 세션 소유권 확인
    const session = await prisma.previewSession.findFirst({
      where: { id: sessionId, userId }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const where: any = { sessionId }

    if (olderThan) {
      where.timestamp = {
        lt: new Date(olderThan)
      }
    }

    const deletedCount = await prisma.previewChange.deleteMany({
      where
    })

    return NextResponse.json({
      message: `${deletedCount.count}개의 변경사항이 삭제되었습니다.`,
      deletedCount: deletedCount.count
    })

  } catch (error) {
    console.error('Error deleting preview changes:', error)
    return NextResponse.json(
      { error: '변경사항 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}