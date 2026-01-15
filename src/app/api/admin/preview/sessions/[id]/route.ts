import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// 세션 업데이트 스키마
const updateSessionSchema = z.object({
  title: z.string().min(1, '세션 제목을 입력해주세요').optional(),
  description: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  password: z.string().optional().nullable(),
  allowEdit: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 특정 미리보기 세션 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    const session = await prisma.previewSession.findFirst({
      where: {
        id,
        userId // 본인이 만든 세션만 조회
      },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        changes: {
          orderBy: { timestamp: 'desc' },
          take: 20
        },
        _count: {
          select: { snapshots: true, changes: true }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비밀번호 필드 제거 후 반환
    const { password, ...sessionWithoutPassword } = session

    return NextResponse.json({ session: sessionWithoutPassword })

  } catch (error) {
    console.error('Error fetching preview session:', error)
    return NextResponse.json(
      { error: '미리보기 세션을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 미리보기 세션 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateSessionSchema.parse(body)

    // 세션 존재 및 소유권 확인
    const existingSession = await prisma.previewSession.findFirst({
      where: { id, userId }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비밀번호 처리
    let hashedPassword = existingSession.password
    if (validatedData.password !== undefined) {
      if (validatedData.password === null || validatedData.password === '') {
        hashedPassword = null
      } else {
        hashedPassword = await bcrypt.hash(validatedData.password, 12)
      }
    }

    const updatedSession = await prisma.previewSession.update({
      where: { id },
      data: {
        ...validatedData,
        password: hashedPassword,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
      }
    })

    // 비밀번호 필드 제거 후 반환
    const { password, ...sessionWithoutPassword } = updatedSession

    return NextResponse.json({ session: sessionWithoutPassword })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating preview session:', error)
    return NextResponse.json(
      { error: '미리보기 세션 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 미리보기 세션 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    // 세션 존재 및 소유권 확인
    const existingSession = await prisma.previewSession.findFirst({
      where: { id, userId }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.previewSession.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '미리보기 세션이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Error deleting preview session:', error)
    return NextResponse.json(
      { error: '미리보기 세션 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}