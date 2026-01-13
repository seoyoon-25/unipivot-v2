import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - 활성화된 협조요청 섹션 목록 조회
export async function GET() {
  try {
    const sections = await prisma.cooperationSection.findMany({
      where: { isActive: true },
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
