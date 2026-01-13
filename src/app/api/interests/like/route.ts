import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// POST - 좋아요 토글
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { interestId, keywordId, type } = body // type: 'interest' | 'keyword'

    if (!interestId && !keywordId) {
      return NextResponse.json(
        { error: '대상을 지정해주세요' },
        { status: 400 }
      )
    }

    // 세션 ID 가져오기 (비회원용)
    let sessionId = request.cookies.get('interest_session')?.value
    if (!session?.user && !sessionId) {
      sessionId = crypto.randomUUID()
    }

    const userId = session?.user?.id || null

    if (type === 'keyword' && keywordId) {
      // 키워드 공감
      const existing = await prisma.interestKeywordLike.findFirst({
        where: {
          keywordId,
          OR: [
            { userId: userId || undefined },
            { sessionId: sessionId || undefined }
          ]
        }
      })

      if (existing) {
        // 좋아요 취소
        await prisma.interestKeywordLike.delete({
          where: { id: existing.id }
        })
        await prisma.interestKeyword.update({
          where: { id: keywordId },
          data: { likeCount: { decrement: 1 } }
        })

        return NextResponse.json({ liked: false, message: '공감이 취소되었습니다' })
      } else {
        // 좋아요 추가
        await prisma.interestKeywordLike.create({
          data: {
            keywordId,
            userId,
            sessionId: userId ? null : sessionId,
          }
        })
        await prisma.interestKeyword.update({
          where: { id: keywordId },
          data: { likeCount: { increment: 1 } }
        })

        const response = NextResponse.json({ liked: true, message: '공감했습니다' })

        // 세션 쿠키 설정
        if (!session?.user && sessionId) {
          response.cookies.set('interest_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
          })
        }

        return response
      }
    } else if (interestId) {
      // 관심사 좋아요
      const existing = await prisma.interestLike.findFirst({
        where: {
          interestId,
          OR: [
            { userId: userId || undefined },
            { sessionId: sessionId || undefined }
          ]
        }
      })

      if (existing) {
        // 좋아요 취소
        await prisma.interestLike.delete({
          where: { id: existing.id }
        })
        await prisma.interest.update({
          where: { id: interestId },
          data: { likeCount: { decrement: 1 } }
        })

        return NextResponse.json({ liked: false, message: '좋아요가 취소되었습니다' })
      } else {
        // 좋아요 추가
        await prisma.interestLike.create({
          data: {
            interestId,
            userId,
            sessionId: userId ? null : sessionId,
          }
        })
        await prisma.interest.update({
          where: { id: interestId },
          data: { likeCount: { increment: 1 } }
        })

        const response = NextResponse.json({ liked: true, message: '좋아요했습니다' })

        if (!session?.user && sessionId) {
          response.cookies.set('interest_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
          })
        }

        return response
      }
    }

    return NextResponse.json(
      { error: '올바른 요청이 아닙니다' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
