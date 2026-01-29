import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// SEO 설정 스키마
const seoSettingSchema = z.object({
  pageKey: z.string().min(1, '페이지 키를 입력해주세요'),
  pageName: z.string().min(1, '페이지 이름을 입력해주세요'),
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  canonical: z.string().url().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
  ogImageAlt: z.string().optional(),
  ogType: z.string().default('website'),
  ogUrl: z.string().url().optional(),
  twitterCard: z.string().default('summary_large_image'),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().url().optional(),
  twitterImageAlt: z.string().optional(),
  twitterSite: z.string().optional(),
  twitterCreator: z.string().optional(),
  schemaType: z.string().optional(),
  schemaData: z.string().optional(),
  customHead: z.string().optional(),
  robots: z.string().default('index,follow'),
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

// GET: 모든 SEO 설정 목록 조회
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

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (search) {
      where.OR = [
        { pageKey: { contains: search, mode: 'insensitive' as const } },
        { pageName: { contains: search, mode: 'insensitive' as const } },
        { title: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [settings, total] = await Promise.all([
      prisma.seoSetting.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { pageKey: 'asc' }
        ]
      }),
      prisma.seoSetting.count({ where })
    ])

    return NextResponse.json({
      settings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { error: 'SEO 설정 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 SEO 설정 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = seoSettingSchema.parse(body)

    // pageKey 중복 확인
    const existingSetting = await prisma.seoSetting.findUnique({
      where: { pageKey: validatedData.pageKey }
    })

    if (existingSetting) {
      return NextResponse.json(
        { error: '이미 존재하는 페이지 키입니다.' },
        { status: 400 }
      )
    }

    const setting = await prisma.seoSetting.create({
      data: {
        ...validatedData,
        createdBy: userId,
      }
    })

    return NextResponse.json({ setting }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating SEO setting:', error)
    return NextResponse.json(
      { error: 'SEO 설정 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}