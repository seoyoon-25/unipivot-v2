import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 디바이스 생성/업데이트 스키마
const deviceSchema = z.object({
  name: z.string().min(1, '디바이스 이름을 입력해주세요'),
  type: z.enum(['mobile', 'tablet', 'desktop']),
  width: z.number().min(100, '너비는 100px 이상이어야 합니다').max(4000, '너비는 4000px 이하여야 합니다'),
  height: z.number().min(100, '높이는 100px 이상이어야 합니다').max(4000, '높이는 4000px 이하여야 합니다'),
  pixelRatio: z.number().min(0.5).max(3).default(1.0),
  userAgent: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().default(0)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 디바이스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    // 필터 조건 구성
    const where: any = {}

    if (type) {
      where.type = type
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const devices = await prisma.previewDevice.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ devices })

  } catch (error) {
    console.error('Error fetching preview devices:', error)
    return NextResponse.json(
      { error: '디바이스 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 디바이스 생성
export async function POST(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = deviceSchema.parse(body)

    // 디바이스 이름 중복 확인
    const existingDevice = await prisma.previewDevice.findUnique({
      where: { name: validatedData.name }
    })

    if (existingDevice) {
      return NextResponse.json(
        { error: '이미 존재하는 디바이스 이름입니다.' },
        { status: 400 }
      )
    }

    // 기본 디바이스 설정 처리
    if (validatedData.isDefault) {
      // 기존 기본 디바이스의 기본 설정 해제
      await prisma.previewDevice.updateMany({
        where: {
          type: validatedData.type,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    const device = await prisma.previewDevice.create({
      data: validatedData
    })

    return NextResponse.json({ device }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating preview device:', error)
    return NextResponse.json(
      { error: '디바이스 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}