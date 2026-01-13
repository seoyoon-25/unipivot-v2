import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 보증금 설정 조회
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

    const depositSetting = await prisma.depositSetting.findUnique({
      where: { programId: id },
    })

    return NextResponse.json({ depositSetting })
  } catch (error) {
    console.error('Get deposit settings error:', error)
    return NextResponse.json(
      { error: '보증금 설정을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 보증금 설정 저장
export async function PUT(
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
    const {
      isEnabled,
      depositAmount,
      conditionType,
      refundPolicy,
      depositPerSession,
      perSessionAmount,
      surveyRequired,
      surveyDeadlineDays,
      totalSessions,
    } = body

    // 프로그램 존재 확인
    const program = await prisma.program.findUnique({
      where: { id },
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 기존 설정 확인
    const existingSetting = await prisma.depositSetting.findUnique({
      where: { programId: id },
    })

    const data = {
      isEnabled,
      depositAmount,
      conditionType,
      refundPolicy,
      depositPerSession,
      perSessionAmount: depositPerSession ? perSessionAmount : null,
      surveyRequired,
      surveyDeadlineDays,
      totalSessions,
    }

    let depositSetting

    if (existingSetting) {
      // 업데이트
      depositSetting = await prisma.depositSetting.update({
        where: { programId: id },
        data,
      })
    } else {
      // 생성
      depositSetting = await prisma.depositSetting.create({
        data: {
          ...data,
          programId: id,
          attendanceRate: 80, // 기본값
        },
      })
    }

    return NextResponse.json({ depositSetting })
  } catch (error) {
    console.error('Save deposit settings error:', error)
    return NextResponse.json(
      { error: '보증금 설정 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}
