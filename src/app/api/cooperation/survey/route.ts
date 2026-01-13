import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - 설문·인터뷰 요청 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      startDate,
      endDate,
      questionCount,
      estimatedTime,
      serviceFee,
      participantFee,
      requirements,
      requesterType,
      requesterName,
      email,
      phone,
      attachment,
    } = body

    // 필수 필드 검증
    if (!startDate || !endDate || !questionCount || !estimatedTime || !requirements || !requesterType || !requesterName || !email || !phone) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    // 날짜 유효성 검사
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start > end) {
      return NextResponse.json(
        { error: '종료일은 시작일 이후여야 합니다' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요' },
        { status: 400 }
      )
    }

    // 요청구분 검증
    if (!['INDIVIDUAL', 'ORGANIZATION'].includes(requesterType.toUpperCase())) {
      return NextResponse.json(
        { error: '올바른 요청구분을 선택해주세요' },
        { status: 400 }
      )
    }

    // 설문요청 생성
    const surveyRequest = await prisma.surveyRequest.create({
      data: {
        startDate: start,
        endDate: end,
        questionCount: parseInt(questionCount),
        estimatedTime: parseInt(estimatedTime),
        serviceFee: serviceFee ? parseInt(serviceFee) : null,
        participantFee: participantFee ? parseInt(participantFee) : null,
        requirements,
        requesterType: requesterType.toUpperCase(),
        requesterName,
        email,
        phone,
        attachment: attachment || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      id: surveyRequest.id,
      message: '설문·인터뷰 요청이 접수되었습니다',
    })
  } catch (error) {
    console.error('Survey request error:', error)
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET - 설문요청 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = status ? { status } : {}

    const [requests, total] = await Promise.all([
      prisma.surveyRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.surveyRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Fetch survey requests error:', error)
    return NextResponse.json(
      { error: '목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
