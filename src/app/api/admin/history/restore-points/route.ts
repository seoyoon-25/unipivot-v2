import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 복원 지점 생성 스키마
const createRestorePointSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100),
  description: z.string().optional(),
  isAutomatic: z.boolean().default(false)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// 전체 사이트 스냅샷 생성
async function createSiteSnapshot() {
  const [
    sections,
    settings,
    banners,
    floatingButtons,
    seoSettings,
    popups,
    popupTemplates
  ] = await Promise.all([
    prisma.siteSection.findMany(),
    prisma.siteSettings.findMany(),
    prisma.announcementBanner.findMany(),
    prisma.floatingButton.findMany(),
    prisma.seoSetting.findMany(),
    prisma.popup.findMany({ include: { template: true } }),
    prisma.popupTemplate.findMany()
  ])

  return {
    timestamp: new Date().toISOString(),
    sections,
    settings,
    banners,
    floatingButtons,
    seoSettings,
    popups,
    popupTemplates
  }
}

// GET: 복원 지점 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const [restorePoints, totalCount] = await Promise.all([
      prisma.restorePoint.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          description: true,
          userId: true,
          isAutomatic: true,
          createdAt: true
        }
      }),
      prisma.restorePoint.count()
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      restorePoints,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching restore points:', error)
    return NextResponse.json(
      { error: '복원 지점 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 복원 지점 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createRestorePointSchema.parse(body)

    // 전체 사이트 스냅샷 생성
    const snapshot = await createSiteSnapshot()

    // 복원 지점 생성
    const restorePoint = await prisma.restorePoint.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        snapshot: JSON.stringify(snapshot),
        userId: userId!,
        isAutomatic: validatedData.isAutomatic
      }
    })

    return NextResponse.json({ restorePoint }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating restore point:', error)
    return NextResponse.json(
      { error: '복원 지점 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}