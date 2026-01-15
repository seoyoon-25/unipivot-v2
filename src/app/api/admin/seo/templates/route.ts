import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// SEO 템플릿 스키마
const seoTemplateSchema = z.object({
  templateKey: z.string().min(1, '템플릿 키를 입력해주세요'),
  templateName: z.string().min(1, '템플릿 이름을 입력해주세요'),
  titleTemplate: z.string().optional(),
  descriptionTemplate: z.string().optional(),
  keywordsTemplate: z.string().optional(),
  ogTitleTemplate: z.string().optional(),
  ogDescriptionTemplate: z.string().optional(),
  ogImageTemplate: z.string().optional(),
  twitterTitleTemplate: z.string().optional(),
  twitterDescriptionTemplate: z.string().optional(),
  twitterImageTemplate: z.string().optional(),
  schemaTemplate: z.string().optional(),
  isActive: z.boolean().default(true),
  variables: z.array(z.string()).default([])
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: SEO 템플릿 목록 조회
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
        { templateKey: { contains: search, mode: 'insensitive' } },
        { templateName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [templates, total] = await Promise.all([
      prisma.seoTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { templateKey: 'asc' }
      }),
      prisma.seoTemplate.count({ where })
    ])

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching SEO templates:', error)
    return NextResponse.json(
      { error: 'SEO 템플릿 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 SEO 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = seoTemplateSchema.parse(body)

    // templateKey 중복 확인
    const existingTemplate = await prisma.seoTemplate.findUnique({
      where: { templateKey: validatedData.templateKey }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { error: '이미 존재하는 템플릿 키입니다.' },
        { status: 400 }
      )
    }

    const template = await prisma.seoTemplate.create({
      data: {
        ...validatedData,
        createdBy: userId,
      }
    })

    return NextResponse.json({ template }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating SEO template:', error)
    return NextResponse.json(
      { error: 'SEO 템플릿 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}