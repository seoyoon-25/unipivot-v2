import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 팝업 템플릿 생성 스키마
const createTemplateSchema = z.object({
  name: z.string().min(1, '템플릿 이름을 입력해주세요'),
  category: z.enum(['modal', 'slide', 'overlay', 'notification']).default('modal'),

  // 디자인 설정
  width: z.number().min(200).max(1200).default(600),
  height: z.number().min(150).max(800).default(400),
  borderRadius: z.number().min(0).max(50).default(12),
  shadow: z.enum(['none', 'small', 'medium', 'large']).default('large'),

  // 색상 설정
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#ffffff'),
  borderColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#e2e8f0'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#1e293b'),

  // 애니메이션 설정
  animation: z.enum(['fade', 'slide', 'zoom', 'bounce']).default('fade'),
  duration: z.number().min(100).max(2000).default(300),

  // 배경 설정
  overlayColor: z.string().default('rgba(0,0,0,0.5)'),
  blurBackground: z.boolean().default(false),

  isDefault: z.boolean().default(false)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 팝업 템플릿 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) {
      where.category = category
    }

    const templates = await prisma.popupTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { popups: true }
        }
      }
    })

    return NextResponse.json({ templates })

  } catch (error) {
    console.error('Error fetching popup templates:', error)
    return NextResponse.json(
      { error: '팝업 템플릿 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 팝업 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    // 기본 템플릿 설정 처리
    if (validatedData.isDefault) {
      // 같은 카테고리의 기존 기본 템플릿 해제
      await prisma.popupTemplate.updateMany({
        where: {
          category: validatedData.category,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    const template = await prisma.popupTemplate.create({
      data: validatedData
    })

    return NextResponse.json({ template }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating popup template:', error)
    return NextResponse.json(
      { error: '팝업 템플릿 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}