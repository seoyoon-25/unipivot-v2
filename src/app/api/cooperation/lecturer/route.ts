import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - 강사요청 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      topic,
      schedules,
      method,
      requirements,
      fee,
      organization,
      contactName,
      contactTitle,
      email,
      phone,
      attachment,
      feeAgreement,
    } = body

    // 필수 필드 검증
    if (!topic || !schedules || !method || !requirements || !organization || !contactName || !email || !phone) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    // 일정 검증
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return NextResponse.json(
        { error: '강연 일정을 최소 1개 이상 입력해주세요' },
        { status: 400 }
      )
    }

    for (const schedule of schedules) {
      if (!schedule.date || !schedule.startTime || !schedule.endTime) {
        return NextResponse.json(
          { error: '모든 강연 일정의 날짜와 시간을 입력해주세요' },
          { status: 400 }
        )
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요' },
        { status: 400 }
      )
    }

    // 수수료 동의 검증
    if (!feeAgreement) {
      return NextResponse.json(
        { error: '연결 수수료 안내에 동의해주세요' },
        { status: 400 }
      )
    }

    // 강사요청 생성
    const lecturerRequest = await prisma.lecturerRequest.create({
      data: {
        topic,
        schedules,
        method: method.toUpperCase(),
        requirements,
        fee: fee || null,
        organization,
        contactName,
        contactTitle: contactTitle || null,
        email,
        phone,
        attachment: attachment || null,
        feeAgreement,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      id: lecturerRequest.id,
      message: '강사요청이 접수되었습니다',
    })
  } catch (error) {
    console.error('Lecturer request error:', error)
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET - 강사요청 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = status ? { status } : {}

    const [requests, total] = await Promise.all([
      prisma.lecturerRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lecturerRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Fetch lecturer requests error:', error)
    return NextResponse.json(
      { error: '목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
