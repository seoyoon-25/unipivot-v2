import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// IP 해시 함수
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

// POST - 설문 응답 제출
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { optionId, textValue, scaleValue, comment } = body

    // 설문 조회
    const survey = await prisma.issueSurvey.findUnique({
      where: { id: params.id }
    })

    if (!survey) {
      return NextResponse.json(
        { error: '설문을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 상태 확인
    if (survey.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '현재 응답할 수 없는 설문입니다' },
        { status: 400 }
      )
    }

    // 기간 확인
    const now = new Date()
    if (survey.startDate && survey.startDate > now) {
      return NextResponse.json(
        { error: '아직 시작되지 않은 설문입니다' },
        { status: 400 }
      )
    }
    if (survey.endDate && survey.endDate < now) {
      return NextResponse.json(
        { error: '종료된 설문입니다' },
        { status: 400 }
      )
    }

    // 응답 유효성 검사
    if (survey.type === 'SINGLE_CHOICE' || survey.type === 'MULTIPLE_CHOICE') {
      if (!optionId) {
        return NextResponse.json(
          { error: '선택지를 선택해주세요' },
          { status: 400 }
        )
      }
    } else if (survey.type === 'TEXT') {
      if (!textValue || textValue.trim().length === 0) {
        return NextResponse.json(
          { error: '답변을 입력해주세요' },
          { status: 400 }
        )
      }
    } else if (survey.type === 'SCALE') {
      if (scaleValue === undefined || scaleValue === null) {
        return NextResponse.json(
          { error: '점수를 선택해주세요' },
          { status: 400 }
        )
      }
    }

    // IP 해시
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    const ipHash = hashIP(ip)

    // 세션 ID
    let sessionId = request.cookies.get('interest_session')?.value
    if (!sessionId && !session?.user?.id) {
      sessionId = crypto.randomUUID()
    }

    // 중복 응답 확인
    if (session?.user?.id) {
      const existing = await prisma.issueSurveyResponse.findUnique({
        where: {
          surveyId_userId: {
            surveyId: params.id,
            userId: session.user.id
          }
        }
      })
      if (existing) {
        return NextResponse.json(
          { error: '이미 응답하셨습니다' },
          { status: 400 }
        )
      }
    } else if (sessionId) {
      const existing = await prisma.issueSurveyResponse.findUnique({
        where: {
          surveyId_sessionId: {
            surveyId: params.id,
            sessionId
          }
        }
      })
      if (existing) {
        return NextResponse.json(
          { error: '이미 응답하셨습니다' },
          { status: 400 }
        )
      }
    }

    // 응답 저장
    const response = await prisma.issueSurveyResponse.create({
      data: {
        surveyId: params.id,
        optionId: optionId || null,
        textValue: textValue?.trim() || null,
        scaleValue: scaleValue || null,
        comment: comment?.trim() || null,
        userId: session?.user?.id || null,
        sessionId: session?.user?.id ? null : sessionId,
        ipHash
      },
      include: {
        option: true
      }
    })

    // 응답 생성
    const res = NextResponse.json({
      success: true,
      response,
      message: '응답이 저장되었습니다'
    })

    // 비회원 세션 쿠키 설정
    if (!session?.user?.id && sessionId) {
      res.cookies.set('interest_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365
      })
    }

    return res
  } catch (error) {
    console.error('Survey response error:', error)
    return NextResponse.json(
      { error: '응답 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
