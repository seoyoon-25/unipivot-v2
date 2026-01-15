import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Banner 수정을 위한 스키마 (일부 필드는 선택사항)
const updateBannerSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  content: z.string().optional(),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'MAINTENANCE']).optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  icon: z.string().optional(),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  openInNewTab: z.boolean().optional(),
  position: z.enum(['TOP', 'BOTTOM']).optional(),
  isSticky: z.boolean().optional(),
  showCloseButton: z.boolean().optional(),
  autoDismiss: z.boolean().optional(),
  autoDismissDelay: z.number().min(1).optional(),
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

// GET: 특정 배너 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    const banner = await prisma.announcementBanner.findUnique({
      where: { id },
      include: {
        analytics: {
          orderBy: { date: 'desc' },
          take: 30 // 최근 30일 분석 데이터
        },
        _count: {
          select: {
            userDismissals: true
          }
        }
      }
    })

    if (!banner) {
      return NextResponse.json(
        { error: '배너를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // JSON 필드 파싱
    const response = {
      ...banner,
      targetPages: banner.targetPages ? JSON.parse(banner.targetPages as string) : [],
      targetRoles: banner.targetRoles ? JSON.parse(banner.targetRoles as string) : [],
      excludePages: banner.excludePages ? JSON.parse(banner.excludePages as string) : [],
    }

    return NextResponse.json({ banner: response })

  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: '배너를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 배너 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateBannerSchema.parse(body)

    // 배너 존재 확인
    const existingBanner = await prisma.announcementBanner.findUnique({
      where: { id }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { error: '배너를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 스케줄링 데이터 검증
    if (validatedData.isScheduled) {
      const startDate = validatedData.startDate || existingBanner.startDate
      const endDate = validatedData.endDate || existingBanner.endDate

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

    const updatedBanner = await prisma.announcementBanner.update({
      where: { id },
      data: {
        ...validatedData,
        targetPages: validatedData.targetPages ? JSON.stringify(validatedData.targetPages) : undefined,
        targetRoles: validatedData.targetRoles ? JSON.stringify(validatedData.targetRoles) : undefined,
        excludePages: validatedData.excludePages ? JSON.stringify(validatedData.excludePages) : undefined,
        updatedBy: userId,
      }
    })

    return NextResponse.json({ banner: updatedBanner })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: '배너 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 배너 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    // 배너 존재 확인
    const existingBanner = await prisma.announcementBanner.findUnique({
      where: { id }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { error: '배너를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.announcementBanner.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '배너가 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: '배너 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH: 배너 상태 변경 (활성화/비활성화)
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

    // 배너 존재 확인
    const existingBanner = await prisma.announcementBanner.findUnique({
      where: { id }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { error: '배너를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let isActive: boolean
    switch (action) {
      case 'toggle':
        isActive = !existingBanner.isActive
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

    const updatedBanner = await prisma.announcementBanner.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
      }
    })

    return NextResponse.json({
      banner: updatedBanner,
      message: `배너가 ${isActive ? '활성화' : '비활성화'}되었습니다.`
    })

  } catch (error) {
    console.error('Error patching banner:', error)
    return NextResponse.json(
      { error: '배너 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}
