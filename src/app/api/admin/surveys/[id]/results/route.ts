import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 만족도 조사 결과 통계
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 조사 정보 조회
    const survey = await prisma.satisfactionSurvey.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: '조사를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 질문 파싱
    const questions = survey.questions ? JSON.parse(survey.questions) : []

    // 응답 데이터 파싱
    const parsedResponses = survey.responses.map((response) => ({
      id: response.id,
      userId: response.userId,
      userName: response.user?.name || null,
      answers: response.answers ? JSON.parse(response.answers) : {},
      refundChoice: response.refundChoice,
      createdAt: response.submittedAt.toISOString(),
    }))

    // 질문별 통계 계산
    const questionStats = questions.map((question: any) => {
      const stat: any = {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalResponses: 0,
      }

      const questionResponses = parsedResponses
        .filter((r) => r.answers[question.id] !== undefined && r.answers[question.id] !== null)
        .map((r) => r.answers[question.id])

      stat.totalResponses = questionResponses.length

      if (question.type === 'rating') {
        // 평점 통계
        const ratings = questionResponses.map((r) => Number(r)).filter((r) => !isNaN(r))
        stat.average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
        stat.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        ratings.forEach((rating) => {
          if (rating >= 1 && rating <= 5) {
            stat.distribution[rating]++
          }
        })
      } else if (question.type === 'single' || question.type === 'multiple') {
        // 선택형 통계
        stat.optionCounts = {}
        question.options?.forEach((option: string) => {
          stat.optionCounts[option] = 0
        })

        questionResponses.forEach((response) => {
          if (Array.isArray(response)) {
            response.forEach((opt: string) => {
              if (stat.optionCounts[opt] !== undefined) {
                stat.optionCounts[opt]++
              }
            })
          } else if (typeof response === 'string') {
            if (stat.optionCounts[response] !== undefined) {
              stat.optionCounts[response]++
            }
          }
        })
      } else if (question.type === 'text') {
        // 주관식 응답
        stat.textResponses = questionResponses
          .filter((r) => r && String(r).trim())
          .slice(0, 50) // 최대 50개만
          .map((text, i) => ({
            text: String(text),
            respondent: parsedResponses[i]?.userName || undefined,
          }))
      }

      return stat
    })

    // 전체 통계
    const ratingQuestions = questionStats.filter((q: any) => q.type === 'rating')
    const averageRating =
      ratingQuestions.length > 0
        ? ratingQuestions.reduce((sum: number, q: any) => sum + (q.average || 0), 0) /
          ratingQuestions.length
        : 0

    const refundCount = parsedResponses.filter((r) => r.refundChoice === 'REFUND').length
    const donateCount = parsedResponses.filter((r) => r.refundChoice === 'DONATE').length

    const stats = {
      responseRate:
        survey.targetCount > 0
          ? Math.round((survey.responseCount / survey.targetCount) * 100)
          : 0,
      averageRating,
      completedCount: survey.responseCount,
      pendingCount: survey.targetCount - survey.responseCount,
      refundCount,
      donateCount,
    }

    return NextResponse.json({
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        deadline: survey.deadline.toISOString(),
        targetCount: survey.targetCount,
        responseCount: survey.responseCount,
        sentAt: survey.sentAt?.toISOString() || null,
        createdAt: survey.createdAt.toISOString(),
        program: survey.program,
      },
      questions,
      stats,
      questionStats,
      responses: parsedResponses,
    })
  } catch (error) {
    console.error('Get survey results error:', error)
    return NextResponse.json(
      { error: '조사 결과를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
