import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 설문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = request.cookies.get('interest_session')?.value

    const survey = await prisma.issueSurvey.findUnique({
      where: { id: params.id },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { responses: true }
            }
          }
        },
        _count: {
          select: { responses: true }
        }
      }
    })

    if (!survey) {
      return NextResponse.json(
        { error: '설문을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 사용자의 기존 응답 확인
    let userResponse = null
    if (session?.user?.id) {
      userResponse = await prisma.issueSurveyResponse.findUnique({
        where: {
          surveyId_userId: {
            surveyId: params.id,
            userId: session.user.id
          }
        }
      })
    } else if (sessionId) {
      userResponse = await prisma.issueSurveyResponse.findUnique({
        where: {
          surveyId_sessionId: {
            surveyId: params.id,
            sessionId
          }
        }
      })
    }

    // 옵션별 응답 수 계산
    const optionsWithCount = survey.options.map(opt => ({
      ...opt,
      responseCount: opt._count.responses,
      _count: undefined
    }))

    // 코멘트가 있는 응답 목록 조회 (최신 20개)
    const responses = await prisma.issueSurveyResponse.findMany({
      where: {
        surveyId: params.id,
        comment: { not: null }
      },
      include: {
        user: {
          select: { name: true }
        },
        option: {
          select: { text: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      survey: {
        ...survey,
        options: optionsWithCount,
        responseCount: survey._count.responses,
        responses: responses.map(r => ({
          id: r.id,
          optionId: r.optionId,
          comment: r.comment,
          createdAt: r.createdAt,
          likeCount: r.likeCount,
          user: r.user,
          option: r.option
        })),
        hasResponded: !!userResponse,
        userResponse: userResponse ? { optionId: userResponse.optionId } : null,
        _count: undefined
      }
    })
  } catch (error) {
    console.error('Get survey detail error:', error)
    return NextResponse.json(
      { error: '설문 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
