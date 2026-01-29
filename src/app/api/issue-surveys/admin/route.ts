import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 관리자 권한 확인
async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { error: '관리자 권한이 필요합니다', status: 403 }
  }

  return { userId: session.user.id }
}

// GET - 모든 설문 목록 (관리자용)
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [surveys, total] = await Promise.all([
      prisma.issueSurvey.findMany({
        where,
        include: {
          options: {
            orderBy: { order: 'asc' },
            include: {
              _count: { select: { responses: true } }
            }
          },
          _count: { select: { responses: true } }
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.issueSurvey.count({ where })
    ])

    const surveysWithStats = surveys.map(survey => ({
      ...survey,
      responseCount: survey._count.responses,
      options: survey.options.map(opt => ({
        ...opt,
        responseCount: opt._count.responses,
        _count: undefined
      })),
      _count: undefined
    }))

    return NextResponse.json({
      surveys: surveysWithStats,
      total,
      hasMore: offset + surveys.length < total
    })
  } catch (error) {
    console.error('Admin get surveys error:', error)
    return NextResponse.json(
      { error: '설문 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 설문 생성/수정
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const {
      id,
      title,
      description,
      type = 'SINGLE_CHOICE',
      status = 'DRAFT',
      startDate,
      endDate,
      isAnonymous = true,
      isPinned = false,
      order = 0,
      options = []
    } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: '설문 제목을 입력해주세요' },
        { status: 400 }
      )
    }

    if ((type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') && options.length < 2) {
      return NextResponse.json(
        { error: '선택형 설문은 최소 2개의 선택지가 필요합니다' },
        { status: 400 }
      )
    }

    let survey

    if (id) {
      // 수정
      survey = await prisma.issueSurvey.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          type,
          status,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          isAnonymous,
          isPinned,
          order
        }
      })

      // 기존 옵션 삭제 후 재생성 (선택형인 경우)
      if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
        await prisma.issueSurveyOption.deleteMany({
          where: { surveyId: id }
        })

        await prisma.issueSurveyOption.createMany({
          data: options.map((opt: any, index: number) => ({
            surveyId: id,
            text: opt.text.trim(),
            order: opt.order ?? index,
            color: opt.color || null
          }))
        })
      }
    } else {
      // 생성
      survey = await prisma.issueSurvey.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          type,
          status,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          isAnonymous,
          isPinned,
          order,
          createdBy: auth.userId,
          options: (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') ? {
            create: options.map((opt: any, index: number) => ({
              text: opt.text.trim(),
              order: opt.order ?? index,
              color: opt.color || null
            }))
          } : undefined
        },
        include: {
          options: { orderBy: { order: 'asc' } }
        }
      })
    }

    // 최종 결과 조회
    const result = await prisma.issueSurvey.findUnique({
      where: { id: survey.id },
      include: {
        options: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } }
      }
    })

    return NextResponse.json({
      success: true,
      survey: {
        ...result,
        responseCount: result?._count.responses || 0,
        _count: undefined
      },
      message: id ? '설문이 수정되었습니다' : '설문이 생성되었습니다'
    })
  } catch (error) {
    console.error('Admin save survey error:', error)
    return NextResponse.json(
      { error: '설문 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - 설문 삭제
export async function DELETE(request: NextRequest) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '설문 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 응답이 있는지 확인
    const survey = await prisma.issueSurvey.findUnique({
      where: { id },
      include: { _count: { select: { responses: true } } }
    })

    if (!survey) {
      return NextResponse.json(
        { error: '설문을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (survey._count.responses > 0) {
      // 응답이 있으면 상태만 변경
      await prisma.issueSurvey.update({
        where: { id },
        data: { status: 'CLOSED' }
      })
      return NextResponse.json({
        success: true,
        message: '응답이 있어 설문을 종료 처리했습니다'
      })
    }

    // 응답이 없으면 완전 삭제
    await prisma.issueSurvey.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '설문이 삭제되었습니다'
    })
  } catch (error) {
    console.error('Admin delete survey error:', error)
    return NextResponse.json(
      { error: '설문 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
