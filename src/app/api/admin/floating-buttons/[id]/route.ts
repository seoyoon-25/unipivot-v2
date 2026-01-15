import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// FloatingButton 수정을 위한 스키마 (일부 필드는 선택사항)
const updateFloatingButtonSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  hoverColor: z.string().optional(),
  textColor: z.string().optional(),
  linkUrl: z.string().url('올바른 URL을 입력해주세요').optional(),
  openInNewTab: z.boolean().optional(),
  position: z.enum(['BOTTOM_RIGHT', 'BOTTOM_LEFT', 'TOP_RIGHT', 'TOP_LEFT', 'CUSTOM']).optional(),
  offsetX: z.number().optional(),
  offsetY: z.number().optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  showLabel: z.boolean().optional(),
  animation: z.enum(['NONE', 'PULSE', 'BOUNCE', 'SHAKE']).optional(),
  animationDelay: z.number().optional(),
  showOn: z.enum(['ALL', 'DESKTOP', 'MOBILE', 'TABLET']).optional(),
  scrollThreshold: z.number().min(0).optional(),
  isScheduled: z.boolean().optional(),
  startDate: z.string().transform((str) => str ? new Date(str) : null).optional(),
  endDate: z.string().transform((str) => str ? new Date(str) : null).optional(),
  targetPages: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  excludePages: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
  maxDisplayCount: z.number().min(1).optional(),
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

// GET: 특정 플로팅 버튼 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    const button = await prisma.floatingButton.findUnique({
      where: { id },
      include: {
        analytics: {
          orderBy: { date: 'desc' },
          take: 30 // 최근 30일 분석 데이터
        }
      }
    })

    if (!button) {
      return NextResponse.json(
        { error: '플로팅 버튼을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // JSON 필드 파싱
    const response = {
      ...button,
      targetPages: button.targetPages ? JSON.parse(button.targetPages as string) : [],
      targetRoles: button.targetRoles ? JSON.parse(button.targetRoles as string) : [],
      excludePages: button.excludePages ? JSON.parse(button.excludePages as string) : [],
    }

    return NextResponse.json({ button: response })

  } catch (error) {
    console.error('Error fetching floating button:', error)
    return NextResponse.json(
      { error: '플로팅 버튼을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 플로팅 버튼 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateFloatingButtonSchema.parse(body)

    // 버튼 존재 확인
    const existingButton = await prisma.floatingButton.findUnique({
      where: { id }
    })

    if (!existingButton) {
      return NextResponse.json(
        { error: '플로팅 버튼을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 스케줄링 데이터 검증
    if (validatedData.isScheduled) {
      const startDate = validatedData.startDate || existingButton.startDate
      const endDate = validatedData.endDate || existingButton.endDate

      if (!startDate) {
        return NextResponse.json(
          { error: '스케줄링을 사용하려면 시작일을 설정해주세요.' },
          { status: 400 }
        )
      }
      if (endDate && startDate > endDate) {
        return NextResponse.json(
          { error: '시작일은 종료일보다 이전이어야 합니다.' },
          { status: 400 }
        )
      }
    }

    const updatedButton = await prisma.floatingButton.update({
      where: { id },
      data: {
        ...validatedData,
        targetPages: validatedData.targetPages ? JSON.stringify(validatedData.targetPages) : undefined,
        targetRoles: validatedData.targetRoles ? JSON.stringify(validatedData.targetRoles) : undefined,
        excludePages: validatedData.excludePages ? JSON.stringify(validatedData.excludePages) : undefined,
        updatedBy: userId,
      }
    })

    return NextResponse.json({ button: updatedButton })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating floating button:', error)
    return NextResponse.json(
      { error: '플로팅 버튼 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 플로팅 버튼 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    // 버튼 존재 확인
    const existingButton = await prisma.floatingButton.findUnique({
      where: { id }
    })

    if (!existingButton) {
      return NextResponse.json(
        { error: '플로팅 버튼을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.floatingButton.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '플로팅 버튼이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Error deleting floating button:', error)
    return NextResponse.json(
      { error: '플로팅 버튼 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH: 플로팅 버튼 상태 변경 (활성화/비활성화)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (!['toggle', 'activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { error: '올바르지 않은 액션입니다.' },
        { status: 400 }
      )
    }

    // 버튼 존재 확인
    const existingButton = await prisma.floatingButton.findUnique({
      where: { id }
    })

    if (!existingButton) {
      return NextResponse.json(
        { error: '플로팅 버튼을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let isActive: boolean
    switch (action) {
      case 'toggle':
        isActive = !existingButton.isActive
        break
      case 'activate':
        isActive = true
        break
      case 'deactivate':
        isActive = false
        break
      default:
        throw new Error('Invalid action')
    }

    const updatedButton = await prisma.floatingButton.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
      }
    })

    return NextResponse.json({
      button: updatedButton,
      message: `플로팅 버튼이 ${isActive ? '활성화' : '비활성화'}되었습니다.`
    })

  } catch (error) {
    console.error('Error patching floating button:', error)
    return NextResponse.json(
      { error: '플로팅 버튼 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}