import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// slug로 프로그램 조회 (공개 API)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const program = await prisma.program.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        status: true,
      }
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error fetching program by slug:', error)
    return NextResponse.json({ error: '프로그램 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
