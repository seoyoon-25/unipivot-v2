import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 모든 협조요청 섹션 목록 조회 (관리자)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const sections = await prisma.cooperationSection.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching cooperation sections:', error)
    return NextResponse.json(
      { error: '섹션을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 새 섹션 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const data = await request.json()

    // 현재 가장 큰 order 값 찾기
    const maxOrder = await prisma.cooperationSection.aggregate({
      _max: { order: true },
    })

    const section = await prisma.cooperationSection.create({
      data: {
        title: data.title,
        content: data.content,
        image: data.image || null,
        imageAlt: data.imageAlt || null,
        buttonText: data.buttonText || '요청하기',
        buttonLink: data.buttonLink,
        isActive: data.isActive ?? true,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating cooperation section:', error)
    return NextResponse.json(
      { error: '섹션 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
