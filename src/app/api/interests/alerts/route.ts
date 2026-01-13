import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 알림 신청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const keywordId = searchParams.get('keywordId')

    // 로그인한 사용자의 알림 목록
    if (session?.user) {
      const where: any = { userId: session.user.id }
      if (keywordId) where.keywordId = keywordId

      const alerts = await prisma.interestAlert.findMany({
        where,
        include: {
          keyword: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ alerts })
    }

    // 비로그인 사용자는 이메일로 조회할 수 없음
    return NextResponse.json({ alerts: [] })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 알림 신청
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { keywordId, email, name } = body

    if (!keywordId) {
      return NextResponse.json(
        { error: '키워드를 지정해주세요' },
        { status: 400 }
      )
    }

    // 이메일 검증
    const emailToUse = email || session?.user?.email
    if (!emailToUse) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailToUse)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다' },
        { status: 400 }
      )
    }

    // 키워드 존재 확인
    const keyword = await prisma.interestKeyword.findUnique({
      where: { id: keywordId },
    })

    if (!keyword) {
      return NextResponse.json(
        { error: '키워드를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 중복 확인
    const existing = await prisma.interestAlert.findUnique({
      where: {
        keywordId_email: {
          keywordId,
          email: emailToUse,
        },
      },
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: '이미 알림을 신청한 키워드입니다' },
          { status: 400 }
        )
      }

      // 비활성화된 알림이면 다시 활성화
      const updated = await prisma.interestAlert.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          name: name || existing.name,
          userId: session?.user?.id || existing.userId,
        },
      })

      return NextResponse.json({
        success: true,
        alert: updated,
        message: '알림이 다시 활성화되었습니다',
      })
    }

    // 새 알림 생성
    const alert = await prisma.interestAlert.create({
      data: {
        keywordId,
        email: emailToUse,
        name: name || session?.user?.name || null,
        userId: session?.user?.id || null,
        isActive: true,
      },
      include: {
        keyword: true,
      },
    })

    return NextResponse.json({
      success: true,
      alert,
      message: '알림이 신청되었습니다. 관련 프로그램이 열리면 알려드릴게요!',
    })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: '알림 신청 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - 알림 취소
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')
    const keywordId = searchParams.get('keywordId')
    const email = searchParams.get('email')

    if (!alertId && !keywordId) {
      return NextResponse.json(
        { error: '알림 ID 또는 키워드를 지정해주세요' },
        { status: 400 }
      )
    }

    let alert

    if (alertId) {
      alert = await prisma.interestAlert.findUnique({
        where: { id: alertId },
      })
    } else if (keywordId && email) {
      alert = await prisma.interestAlert.findUnique({
        where: {
          keywordId_email: {
            keywordId,
            email,
          },
        },
      })
    }

    if (!alert) {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 권한 확인 (본인만 취소 가능)
    if (session?.user?.id && alert.userId !== session.user.id) {
      // 관리자가 아닌 경우
      if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: '권한이 없습니다' },
          { status: 403 }
        )
      }
    }

    // 비활성화 (소프트 삭제)
    await prisma.interestAlert.update({
      where: { id: alert.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: '알림이 취소되었습니다',
    })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json(
      { error: '알림 취소 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
