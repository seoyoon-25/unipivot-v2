import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: 템플릿 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 일반 사용자는 공개된 템플릿만
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)
    if (!isAdmin) {
      where.isPublic = true
    }

    const templates = await prisma.contentTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { useCount: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json({ error: '템플릿 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// POST: 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, content, thumbnail, isDefault, isPublic } = body

    if (!name || !category || !content) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
    }

    // 기본 템플릿 설정 시 기존 기본 템플릿 해제
    if (isDefault) {
      await prisma.contentTemplate.updateMany({
        where: { category, isDefault: true },
        data: { isDefault: false },
      })
    }

    const template = await prisma.contentTemplate.create({
      data: {
        name,
        description,
        category,
        content,
        thumbnail,
        isDefault: isDefault || false,
        isPublic: isPublic !== false,
        createdBy: session.user.email,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ error: '템플릿 생성에 실패했습니다.' }, { status: 500 })
  }
}
