import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/sessions/[id] - 회차 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params

    const programSession = await prisma.programSession.findUnique({
      where: { id },
      include: {
        program: {
          select: { id: true, title: true }
        }
      }
    })

    if (!programSession) {
      return NextResponse.json({ error: '회차를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(programSession)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
