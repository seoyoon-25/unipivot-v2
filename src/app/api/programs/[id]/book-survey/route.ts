import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get book survey status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: programId } = await params

    const application = await prisma.programApplication.findFirst({
      where: {
        programId,
        userId: session.user.id,
        status: { in: ['ACCEPTED', 'ADDITIONAL'] },
      },
      select: {
        id: true,
        bookReceiveType: true,
        ebookProvider: true,
        ebookProviderOther: true,
        bookSurveyCompletedAt: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: '합격된 신청 내역이 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Get book survey error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT - Submit book survey
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: programId } = await params
    const body = await request.json()
    const { bookReceiveType, ebookProvider, ebookProviderOther } = body

    if (!bookReceiveType) {
      return NextResponse.json(
        { error: '책 수령 방식을 선택해주세요' },
        { status: 400 }
      )
    }

    const validTypes = ['PAPER', 'EBOOK', 'OWN']
    if (!validTypes.includes(bookReceiveType)) {
      return NextResponse.json(
        { error: '올바른 수령 방식을 선택해주세요' },
        { status: 400 }
      )
    }

    if (bookReceiveType === 'EBOOK' && !ebookProvider) {
      return NextResponse.json(
        { error: 'ebook 제공업체를 선택해주세요' },
        { status: 400 }
      )
    }

    const application = await prisma.programApplication.findFirst({
      where: {
        programId,
        userId: session.user.id,
        status: { in: ['ACCEPTED', 'ADDITIONAL'] },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: '합격된 신청 내역이 없습니다' },
        { status: 404 }
      )
    }

    const updated = await prisma.programApplication.update({
      where: { id: application.id },
      data: {
        bookReceiveType,
        ebookProvider: bookReceiveType === 'EBOOK' ? ebookProvider : null,
        ebookProviderOther:
          bookReceiveType === 'EBOOK' && ebookProvider === 'OTHER'
            ? ebookProviderOther
            : null,
        bookSurveyCompletedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      bookReceiveType: updated.bookReceiveType,
    })
  } catch (error) {
    console.error('Submit book survey error:', error)
    return NextResponse.json(
      { error: '저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
