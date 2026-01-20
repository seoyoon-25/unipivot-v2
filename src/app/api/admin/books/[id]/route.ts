import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/books/[id] - 책 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params

    const book = await prisma.readBook.findUnique({
      where: { id },
      include: {
        bookReports: {
          include: {
            author: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!book) {
      return NextResponse.json({ error: '책을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Get book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/books/[id] - 책 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    if (!data.title?.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }

    if (!data.season?.trim()) {
      return NextResponse.json({ error: '시즌을 입력해주세요.' }, { status: 400 })
    }

    const book = await prisma.readBook.update({
      where: { id },
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

    return NextResponse.json(book)
  } catch (error) {
    console.error('Update book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/books/[id] - 책 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params

    // 연결된 독후감이 있는지 확인
    const reportsCount = await prisma.bookReport.count({
      where: { bookId: id }
    })

    if (reportsCount > 0) {
      // 독후감의 bookId를 null로 설정 (책만 삭제, 독후감은 유지)
      await prisma.bookReport.updateMany({
        where: { bookId: id },
        data: { bookId: null }
      })
    }

    await prisma.readBook.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
