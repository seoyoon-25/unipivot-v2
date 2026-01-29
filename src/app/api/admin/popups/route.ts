import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 팝업 생성 스키마
const createPopupSchema = z.object({
  title: z.string().min(1, '팝업 제목을 입력해주세요'),
  content: z.string().optional(),
  templateId: z.string().optional(),
  customCss: z.string().optional(),

  // 트리거 설정
  trigger: z.enum(['pageload', 'scroll', 'time', 'exit', 'click', 'manual']).default('pageload'),
  triggerValue: z.string().optional(),
  triggerSelector: z.string().optional(),

  // 표시 조건
  showOn: z.enum(['all', 'desktop', 'mobile', 'tablet']).default('all'),
  targetPages: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  excludePages: z.array(z.string()).optional(),

  // 사용자 조건
  newVisitorOnly: z.boolean().default(false),
  returningVisitorOnly: z.boolean().default(false),
  minVisitCount: z.number().optional(),

  // 지역/언어 조건
  targetCountries: z.array(z.string()).optional(),
  targetLanguages: z.array(z.string()).optional(),

  // 시간 조건
  showAfterDate: z.string().datetime().optional(),
  showUntilDate: z.string().datetime().optional(),
  showTimeSlots: z.array(z.string()).optional(),

  // 빈도 제한
  showOncePerSession: z.boolean().default(false),
  showOncePerUser: z.boolean().default(false),
  maxDisplayPerDay: z.number().optional(),
  delayBetweenShows: z.number().optional(),

  // 닫기 설정
  showCloseButton: z.boolean().default(true),
  closeOnOverlay: z.boolean().default(false),
  closeOnEscape: z.boolean().default(true),
  autoClose: z.boolean().default(false),
  autoCloseDelay: z.number().optional(),

  // 액션 버튼
  primaryButton: z.object({
    text: z.string(),
    action: z.string(),
    url: z.string().optional(),
    style: z.string().optional()
  }).optional(),
  secondaryButton: z.object({
    text: z.string(),
    action: z.string(),
    url: z.string().optional(),
    style: z.string().optional()
  }).optional(),

  isActive: z.boolean().default(true),
  priority: z.number().default(0)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 팝업 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const trigger = searchParams.get('trigger')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (trigger) {
      where.trigger = trigger
    }

    const [popups, total] = await Promise.all([
      prisma.popup.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          template: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          _count: {
            select: {
              analytics: true,
              dismissals: true,
              interactions: true
            }
          }
        }
      }),
      prisma.popup.count({ where })
    ])

    return NextResponse.json({
      popups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching popups:', error)
    return NextResponse.json(
      { error: '팝업 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 팝업 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPopupSchema.parse(body)

    const popup = await prisma.popup.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        templateId: validatedData.templateId,
        customCss: validatedData.customCss,
        trigger: validatedData.trigger,
        triggerValue: validatedData.triggerValue,
        triggerSelector: validatedData.triggerSelector,
        showOn: validatedData.showOn,
        targetPages: validatedData.targetPages ? JSON.stringify(validatedData.targetPages) : null,
        targetRoles: validatedData.targetRoles ? JSON.stringify(validatedData.targetRoles) : null,
        excludePages: validatedData.excludePages ? JSON.stringify(validatedData.excludePages) : null,
        newVisitorOnly: validatedData.newVisitorOnly,
        returningVisitorOnly: validatedData.returningVisitorOnly,
        minVisitCount: validatedData.minVisitCount,
        targetCountries: validatedData.targetCountries ? JSON.stringify(validatedData.targetCountries) : null,
        targetLanguages: validatedData.targetLanguages ? JSON.stringify(validatedData.targetLanguages) : null,
        showAfterDate: validatedData.showAfterDate ? new Date(validatedData.showAfterDate) : null,
        showUntilDate: validatedData.showUntilDate ? new Date(validatedData.showUntilDate) : null,
        showTimeSlots: validatedData.showTimeSlots ? JSON.stringify(validatedData.showTimeSlots) : null,
        showOncePerSession: validatedData.showOncePerSession,
        showOncePerUser: validatedData.showOncePerUser,
        maxDisplayPerDay: validatedData.maxDisplayPerDay,
        delayBetweenShows: validatedData.delayBetweenShows,
        showCloseButton: validatedData.showCloseButton,
        closeOnOverlay: validatedData.closeOnOverlay,
        closeOnEscape: validatedData.closeOnEscape,
        autoClose: validatedData.autoClose,
        autoCloseDelay: validatedData.autoCloseDelay,
        primaryButton: validatedData.primaryButton ? JSON.stringify(validatedData.primaryButton) : null,
        secondaryButton: validatedData.secondaryButton ? JSON.stringify(validatedData.secondaryButton) : null,
        isActive: validatedData.isActive,
        priority: validatedData.priority,
        createdBy: userId
      }
    })

    return NextResponse.json({ popup }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating popup:', error)
    return NextResponse.json(
      { error: '팝업 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}