import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// IP 해시 함수
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

// POST - 응답 공감/좋아요
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = request.cookies.get('interest_session')?.value

    // IP 해시 (공감 중복 방지용)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    const ipHash = hashIP(ip)

    // 응답 존재 확인
    const response = await prisma.issueSurveyResponse.findUnique({
      where: { id: params.responseId }
    })

    if (!response) {
      return NextResponse.json(
        { error: '응답을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 자신의 응답에는 공감 불가
    if (session?.user?.id && response.userId === session.user.id) {
      return NextResponse.json(
        { error: '자신의 응답에는 공감할 수 없습니다' },
        { status: 400 }
      )
    }

    // 좋아요 수 증가
    const updated = await prisma.issueSurveyResponse.update({
      where: { id: params.responseId },
      data: {
        likeCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      likeCount: updated.likeCount
    })
  } catch (error) {
    console.error('Like response error:', error)
    return NextResponse.json(
      { error: '공감 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
