import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT /api/admin/programs/reorder - 프로그램 순서 변경 및 필드 수정
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { programIds, type, edits } = await request.json()

    if (!Array.isArray(programIds) || programIds.length === 0) {
      return NextResponse.json({ error: '프로그램 ID 목록이 필요합니다.' }, { status: 400 })
    }

    const operations: any[] = []

    // 순서대로 displayOrder 업데이트 (DESC 정렬 기준: 첫 번째가 가장 높은 숫자)
    programIds.forEach((id: string, index: number) => {
      const updateData: any = { displayOrder: programIds.length - index }

      // 필드 수정사항이 있으면 함께 업데이트
      if (edits && edits[id]) {
        const edit = edits[id]
        if (edit.title !== undefined) updateData.title = edit.title
        if (edit.status !== undefined) updateData.status = edit.status
        if (edit.type !== undefined) updateData.type = edit.type
      }

      operations.push(
        prisma.program.update({
          where: { id },
          data: updateData
        })
      )
    })

    await prisma.$transaction(operations)

    return NextResponse.json({
      success: true,
      message: `${programIds.length}개 프로그램의 순서가 변경되었습니다.`
    })
  } catch (error) {
    console.error('Error reordering programs:', error)
    return NextResponse.json({ error: '순서 변경 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// GET /api/admin/programs/reorder?type=BOOKCLUB - 타입별 프로그램 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where = type ? { type } : {}

    const programs = await prisma.program.findMany({
      where,
      orderBy: [
        { displayOrder: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        displayOrder: true,
        createdAt: true,
        image: true,
        thumbnailSquare: true,
      }
    })

    // 타입 목록도 함께 반환
    const types = await prisma.program.findMany({
      select: { type: true },
      distinct: ['type']
    })

    return NextResponse.json({
      programs,
      types: types.map(t => t.type)
    })
  } catch (error) {
    console.error('Error fetching programs for reorder:', error)
    return NextResponse.json({ error: '프로그램 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
