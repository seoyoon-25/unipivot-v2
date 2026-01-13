import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const { name, email, phone, origin } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: '이름과 이메일은 필수입니다.' },
        { status: 400 }
      )
    }

    // Check if survey exists and is recruiting
    const survey = await prisma.labSurvey.findUnique({
      where: { id },
    })

    if (!survey) {
      return NextResponse.json(
        { error: '설문조사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (survey.status !== 'RECRUITING') {
      return NextResponse.json(
        { error: '현재 모집 중이 아닙니다.' },
        { status: 400 }
      )
    }

    if (survey.currentCount >= survey.targetCount) {
      return NextResponse.json(
        { error: '모집이 완료되었습니다.' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingParticipation = await prisma.researchParticipation.findFirst({
      where: {
        surveyId: id,
        email,
      },
    })

    if (existingParticipation) {
      return NextResponse.json(
        { error: '이미 신청한 이메일입니다.' },
        { status: 400 }
      )
    }

    // Create participation
    const participation = await prisma.researchParticipation.create({
      data: {
        surveyId: id,
        name,
        email,
        phone,
        origin,
        status: 'APPLIED',
        rewardAmount: survey.rewardAmount,
      },
    })

    // Update survey current count
    await prisma.labSurvey.update({
      where: { id },
      data: {
        currentCount: { increment: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      id: participation.id,
      message: '참가 신청이 완료되었습니다.',
    })
  } catch (error) {
    console.error('Error applying to survey:', error)
    return NextResponse.json(
      { error: '신청 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
