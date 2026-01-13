import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - 자문요청 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      startDate,
      endDate,
      duration,
      method,
      fee,
      requirements,
      organization,
      contactName,
      email,
      phone,
      attachment,
    } = body

    // 필수 필드 검증
    if (!startDate || !endDate || !duration || !method || !requirements || !organization || !contactName || !email || !phone) {
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

    // 자문요청 생성
    const consultingRequest = await prisma.consultingRequest.create({
      data: {
        startDate: start,
        endDate: end,
        duration: parseInt(duration),
        method: method.toUpperCase(),
        fee: fee ? parseInt(fee) : null,
        requirements,
        organization,
        contactName,
        email,
        phone,
        attachment: attachment || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      id: consultingRequest.id,
      message: '자문요청이 접수되었습니다',
    })
  } catch (error) {
    console.error('Consulting request error:', error)
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET - 자문요청 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = status ? { status } : {}

    const [requests, total] = await Promise.all([
      prisma.consultingRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.consultingRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Fetch consulting requests error:', error)
    return NextResponse.json(
      { error: '목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
