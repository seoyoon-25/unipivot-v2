import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: programId, sessionId } = await params

    const session = await prisma.programSession.findFirst({
      where: {
        id: sessionId,
        programId,
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            reportStructure: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: '세션 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
