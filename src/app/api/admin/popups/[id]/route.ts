import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 팝업 수정 스키마
const updatePopupSchema = z.object({
  title: z.string().min(1, '팝업 제목을 입력해주세요').optional(),
  content: z.string().optional(),
  templateId: z.string().nullable().optional(),
  customCss: z.string().optional(),

  // 트리거 설정
  trigger: z.enum(['pageload', 'scroll', 'time', 'exit', 'click', 'manual']).optional(),
  triggerValue: z.string().nullable().optional(),
  triggerSelector: z.string().nullable().optional(),

  // 표시 조건
  showOn: z.enum(['all', 'desktop', 'mobile', 'tablet']).optional(),
  targetPages: z.array(z.string()).nullable().optional(),
  targetRoles: z.array(z.string()).nullable().optional(),
  excludePages: z.array(z.string()).nullable().optional(),

  // 사용자 조건
  newVisitorOnly: z.boolean().optional(),
  returningVisitorOnly: z.boolean().optional(),
  minVisitCount: z.number().nullable().optional(),

  // 지역/언어 조건
  targetCountries: z.array(z.string()).nullable().optional(),
  targetLanguages: z.array(z.string()).nullable().optional(),

  // 시간 조건
  showAfterDate: z.string().datetime().nullable().optional(),
  showUntilDate: z.string().datetime().nullable().optional(),
  showTimeSlots: z.array(z.string()).nullable().optional(),

  // 빈도 제한
  showOncePerSession: z.boolean().optional(),
  showOncePerUser: z.boolean().optional(),
  maxDisplayPerDay: z.number().nullable().optional(),
  delayBetweenShows: z.number().nullable().optional(),

  // 닫기 설정
  showCloseButton: z.boolean().optional(),
  closeOnOverlay: z.boolean().optional(),
  closeOnEscape: z.boolean().optional(),
  autoClose: z.boolean().optional(),
  autoCloseDelay: z.number().nullable().optional(),

  // 액션 버튼
  primaryButton: z.object({
    text: z.string(),
    action: z.string(),
    url: z.string().optional(),
    style: z.string().optional()
  }).nullable().optional(),
  secondaryButton: z.object({
    text: z.string(),
    action: z.string(),
    url: z.string().optional(),
    style: z.string().optional()
  }).nullable().optional(),

  isActive: z.boolean().optional(),
  priority: z.number().optional()
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 특정 팝업 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    const popup = await prisma.popup.findUnique({
      where: { id },
      include: {
        template: true,
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        },
        _count: {
          select: {
            dismissals: true,
            interactions: true
          }
        }
      }
    })

    if (!popup) {
      return NextResponse.json(
        { error: '팝업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ popup })

  } catch (error) {
    console.error('Error fetching popup:', error)
    return NextResponse.json(
      { error: '팝업 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 팝업 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updatePopupSchema.parse(body)

    // 팝업 존재 확인
    const existingPopup = await prisma.popup.findUnique({
      where: { id }
    })

    if (!existingPopup) {
      return NextResponse.json(
        { error: '팝업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 업데이트 데이터 구성
    const updateData: any = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.content !== undefined) updateData.content = validatedData.content
    if (validatedData.templateId !== undefined) updateData.templateId = validatedData.templateId
    if (validatedData.customCss !== undefined) updateData.customCss = validatedData.customCss
    if (validatedData.trigger !== undefined) updateData.trigger = validatedData.trigger
    if (validatedData.triggerValue !== undefined) updateData.triggerValue = validatedData.triggerValue
    if (validatedData.triggerSelector !== undefined) updateData.triggerSelector = validatedData.triggerSelector
    if (validatedData.showOn !== undefined) updateData.showOn = validatedData.showOn

    if (validatedData.targetPages !== undefined) {
      updateData.targetPages = validatedData.targetPages ? JSON.stringify(validatedData.targetPages) : null
    }
    if (validatedData.targetRoles !== undefined) {
      updateData.targetRoles = validatedData.targetRoles ? JSON.stringify(validatedData.targetRoles) : null
    }
    if (validatedData.excludePages !== undefined) {
      updateData.excludePages = validatedData.excludePages ? JSON.stringify(validatedData.excludePages) : null
    }

    if (validatedData.newVisitorOnly !== undefined) updateData.newVisitorOnly = validatedData.newVisitorOnly
    if (validatedData.returningVisitorOnly !== undefined) updateData.returningVisitorOnly = validatedData.returningVisitorOnly
    if (validatedData.minVisitCount !== undefined) updateData.minVisitCount = validatedData.minVisitCount

    if (validatedData.targetCountries !== undefined) {
      updateData.targetCountries = validatedData.targetCountries ? JSON.stringify(validatedData.targetCountries) : null
    }
    if (validatedData.targetLanguages !== undefined) {
      updateData.targetLanguages = validatedData.targetLanguages ? JSON.stringify(validatedData.targetLanguages) : null
    }

    if (validatedData.showAfterDate !== undefined) {
      updateData.showAfterDate = validatedData.showAfterDate ? new Date(validatedData.showAfterDate) : null
    }
    if (validatedData.showUntilDate !== undefined) {
      updateData.showUntilDate = validatedData.showUntilDate ? new Date(validatedData.showUntilDate) : null
    }
    if (validatedData.showTimeSlots !== undefined) {
      updateData.showTimeSlots = validatedData.showTimeSlots ? JSON.stringify(validatedData.showTimeSlots) : null
    }

    if (validatedData.showOncePerSession !== undefined) updateData.showOncePerSession = validatedData.showOncePerSession
    if (validatedData.showOncePerUser !== undefined) updateData.showOncePerUser = validatedData.showOncePerUser
    if (validatedData.maxDisplayPerDay !== undefined) updateData.maxDisplayPerDay = validatedData.maxDisplayPerDay
    if (validatedData.delayBetweenShows !== undefined) updateData.delayBetweenShows = validatedData.delayBetweenShows
    if (validatedData.showCloseButton !== undefined) updateData.showCloseButton = validatedData.showCloseButton
    if (validatedData.closeOnOverlay !== undefined) updateData.closeOnOverlay = validatedData.closeOnOverlay
    if (validatedData.closeOnEscape !== undefined) updateData.closeOnEscape = validatedData.closeOnEscape
    if (validatedData.autoClose !== undefined) updateData.autoClose = validatedData.autoClose
    if (validatedData.autoCloseDelay !== undefined) updateData.autoCloseDelay = validatedData.autoCloseDelay

    if (validatedData.primaryButton !== undefined) {
      updateData.primaryButton = validatedData.primaryButton ? JSON.stringify(validatedData.primaryButton) : null
    }
    if (validatedData.secondaryButton !== undefined) {
      updateData.secondaryButton = validatedData.secondaryButton ? JSON.stringify(validatedData.secondaryButton) : null
    }

    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority

    const popup = await prisma.popup.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ popup })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating popup:', error)
    return NextResponse.json(
      { error: '팝업 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 팝업 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    // 팝업 존재 확인
    const existingPopup = await prisma.popup.findUnique({
      where: { id }
    })

    if (!existingPopup) {
      return NextResponse.json(
        { error: '팝업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 관련 데이터 삭제 (트랜잭션)
    await prisma.$transaction([
      // 분석 데이터 삭제
      prisma.popupAnalytics.deleteMany({
        where: { popupId: id }
      }),
      // 상호작용 데이터 삭제
      prisma.popupInteraction.deleteMany({
        where: { popupId: id }
      }),
      // 해제 기록 삭제
      prisma.popupDismissal.deleteMany({
        where: { popupId: id }
      }),
      // 팝업 삭제
      prisma.popup.delete({
        where: { id }
      })
    ])

    return NextResponse.json({ message: '팝업이 삭제되었습니다.' })

  } catch (error) {
    console.error('Error deleting popup:', error)
    return NextResponse.json(
      { error: '팝업 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH: 팝업 상태 토글
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive 값이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    const popup = await prisma.popup.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({ popup })

  } catch (error) {
    console.error('Error toggling popup status:', error)
    return NextResponse.json(
      { error: '팝업 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}
