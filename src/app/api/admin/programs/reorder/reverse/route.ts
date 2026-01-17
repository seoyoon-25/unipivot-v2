import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/admin/programs/reorder/reverse - 프로그램 순서 뒤집기
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { type } = await request.json().catch(() => ({}))

    // 현재 프로그램 목록 조회 (displayOrder 오름차순)
    const where = type ? { type } : {}
    const programs = await prisma.program.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        displayOrder: true,
      }
    })

    if (programs.length === 0) {
      return NextResponse.json({
        success: true,
        message: '뒤집을 프로그램이 없습니다.'
      })
    }

    // 순서 뒤집기: 첫 번째 프로그램이 마지막 순서로, 마지막 프로그램이 첫 번째 순서로
    const totalCount = programs.length
    const updates = programs.map((program, index) =>
      prisma.program.update({
        where: { id: program.id },
        data: { displayOrder: totalCount - index }
      })
    )

    await prisma.$transaction(updates)

    return NextResponse.json({
      success: true,
      message: `${programs.length}개 프로그램의 순서가 뒤집어졌습니다.`
    })
  } catch (error) {
    console.error('Error reversing program order:', error)
    return NextResponse.json({ error: '순서 뒤집기 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
