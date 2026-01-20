import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/books - 책 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const books = await prisma.readBook.findMany({
      orderBy: [{ season: 'desc' }, { title: 'asc' }],
      include: {
        _count: {
          select: { bookReports: true }
        }
      }
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Get books error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/books - 새 책 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const data = await request.json()

    if (!data.title?.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }

    if (!data.season?.trim()) {
      return NextResponse.json({ error: '시즌을 입력해주세요.' }, { status: 400 })
    }

    const book = await prisma.readBook.create({
      data: {
        title: data.title.trim(),
        author: data.author?.trim() || null,
        publisher: data.publisher?.trim() || null,
        pubYear: data.pubYear?.trim() || null,
        image: data.image?.trim() || null,
        season: data.season.trim(),
        sessionCount: data.sessionCount || null,
        participants: data.participants || null,
        category: data.category || null,
        rating: data.rating || null,
        status: data.status || 'COMPLETED'
      }
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Create book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
