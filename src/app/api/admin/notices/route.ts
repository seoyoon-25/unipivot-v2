import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 공지사항 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const where: any = {}
    if (search) {
      where.title = { contains: search }
    }

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notice.count({ where })
    ])

    return NextResponse.json({
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: '공지사항 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 공지사항 생성
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const data = await req.json()

    // 필수 필드 검증
    if (!data.title || !data.content) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 })
    }

    const notice = await prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        isPinned: data.isPinned || false,
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
      }
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json({ error: '공지사항 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
