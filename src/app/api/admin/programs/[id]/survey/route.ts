import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { getSurveyTemplateByProgramType } from '@/lib/constants/survey-templates'

// GET: 프로그램의 만족도 조사 조회
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

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        surveys: {
          include: {
            _count: { select: { responses: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          where: { status: 'ACCEPTED' },
          select: { id: true },
        },
        depositSetting: true,
      },
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 기본 질문 템플릿
    const defaultQuestions = getSurveyTemplateByProgramType(program.type)

    return NextResponse.json({
      program,
      surveys: program.surveys,
      participantCount: program.applications.length,
      defaultQuestions,
    })
  } catch (error) {
    console.error('Get survey error:', error)
    return NextResponse.json(
      { error: '만족도 조사를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 만족도 조사 생성 및 발송
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, questions, deadlineDays, sendNow } = body

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        applications: {
          where: { status: 'ACCEPTED' },
          include: { user: true },
        },
        depositSetting: true,
      },
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    const deadline = new Date()
    deadline.setDate(deadline.getDate() + (deadlineDays || 7))

    // 만족도 조사 생성
    const survey = await prisma.satisfactionSurvey.create({
      data: {
        programId: id,
        title: title || `${program.title} 만족도 조사`,
        description,
        questions: JSON.stringify(questions),
        deadline,
        targetCount: program.applications.length,
        status: sendNow ? 'SENT' : 'DRAFT',
        sentAt: sendNow ? new Date() : null,
      },
    })

    // TODO: 발송 시 알림톡/이메일 발송 로직 추가

    return NextResponse.json({
      survey,
      message: sendNow
        ? '만족도 조사가 발송되었습니다.'
        : '만족도 조사가 생성되었습니다.',
    })
  } catch (error) {
    console.error('Create survey error:', error)
    return NextResponse.json(
      { error: '만족도 조사 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 만족도 조사 발송
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: programId } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { surveyId, action } = body

    const survey = await prisma.satisfactionSurvey.findUnique({
      where: { id: surveyId },
    })

    if (!survey || survey.programId !== programId) {
      return NextResponse.json({ error: '만족도 조사를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (action === 'send') {
      await prisma.satisfactionSurvey.update({
        where: { id: surveyId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      })

      // TODO: 알림톡/이메일 발송 로직

      return NextResponse.json({ message: '만족도 조사가 발송되었습니다.' })
    }

    if (action === 'close') {
      await prisma.satisfactionSurvey.update({
        where: { id: surveyId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      })

      return NextResponse.json({ message: '만족도 조사가 마감되었습니다.' })
    }

    if (action === 'remind') {
      // 미응답자에게 리마인더 발송
      await prisma.satisfactionSurvey.update({
        where: { id: surveyId },
        data: { reminderSent: true },
      })

      // TODO: 미응답자 알림톡/이메일 발송 로직

      return NextResponse.json({ message: '리마인더가 발송되었습니다.' })
    }

    return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 })
  } catch (error) {
    console.error('Update survey error:', error)
    return NextResponse.json(
      { error: '만족도 조사 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}
