import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[가-힣]/g, (match) => {
      // 한글을 로마자로 변환하는 간단한 방법 (실제로는 음절 단위 변환)
      return ''
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // 빈 문자열이면 랜덤 ID 생성
  if (!slug) {
    return `program-${Date.now()}`
  }

  return `${slug}-${Date.now().toString(36)}`
}

// 프로그램 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          status: true,
          image: true,
          thumbnailSquare: true,
          capacity: true,
          feeType: true,
          feeAmount: true,
          isOnline: true,
          recruitStartDate: true,
          recruitEndDate: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          _count: {
            select: {
              applications: true,
              participants: true,
            }
          }
        }
      }),
      prisma.program.count({ where })
    ])

    return NextResponse.json({
      programs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({ error: '프로그램 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 프로그램 생성
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const data = await req.json()

    // 필수 필드 검증
    if (!data.title) {
      return NextResponse.json({ error: '프로그램 제목은 필수입니다.' }, { status: 400 })
    }

    // 슬러그 생성
    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    let counter = 1

    // 슬러그 중복 체크
    while (await prisma.program.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const program = await prisma.program.create({
      data: {
        title: data.title,
        slug,
        type: data.type || 'OTHER',
        description: data.description || null,
        content: data.content || null,
        scheduleContent: data.scheduleContent || null,
        currentBookContent: data.currentBookContent || null,
        capacity: data.capacity || 30,
        fee: data.fee || 0,
        feeType: data.feeType || 'FREE',
        feeAmount: data.feeAmount || 0,
        location: data.location || null,
        isOnline: data.isOnline || false,
        status: data.status || 'DRAFT',
        image: data.image || null,
        thumbnailSquare: data.thumbnailSquare || null,
        recruitStartDate: data.recruitStartDate ? new Date(data.recruitStartDate) : null,
        recruitEndDate: data.recruitEndDate ? new Date(data.recruitEndDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        applicationFormId: data.applicationFormId || null,
      }
    })

    // 회차 정보 생성 (독서모임 등)
    if (data.sessions && Array.isArray(data.sessions) && data.sessions.length > 0) {
      await prisma.programSession.createMany({
        data: data.sessions.map((session: any) => ({
          programId: program.id,
          sessionNo: session.sessionNo,
          title: session.title || null,
          date: session.date ? new Date(session.date) : null,
          startTime: session.startTime || null,
          endTime: session.endTime || null,
          bookTitle: session.bookTitle || null,
          bookAuthor: session.bookAuthor || null,
          bookImage: session.bookImage || null,
          bookRange: session.bookRange || null,
        }))
      })
    }

    return NextResponse.json(program, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json({ error: '프로그램 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
