import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// POST: QR 토큰 생성 (관리자만)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { sessionId, validMinutes = 30 } = body

    if (!sessionId) {
      return NextResponse.json({ error: '회차 ID가 필요합니다.' }, { status: 400 })
    }

    // 세션(회차) 존재 확인
    const programSession = await prisma.programSession.findUnique({
      where: { id: sessionId },
      include: {
        program: {
          select: { id: true, title: true },
        },
      },
    })

    if (!programSession) {
      return NextResponse.json({ error: '회차를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 기존 활성 토큰 비활성화
    await prisma.attendanceQR.updateMany({
      where: { sessionId, isActive: true },
      data: { isActive: false },
    })

    // 새 토큰 생성
    const token = crypto.randomUUID()
    const now = new Date()
    const validUntil = new Date(now.getTime() + validMinutes * 60 * 1000)

    const qr = await prisma.attendanceQR.create({
      data: {
        sessionId,
        token,
        validFrom: now,
        validUntil,
        createdBy: session.user.id,
      },
      include: {
        session: {
          include: {
            program: {
              select: { id: true, title: true },
            },
          },
        },
      },
    })

    // QR 코드 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bestcome.org'
    const checkInUrl = `${baseUrl}/attendance/check?token=${token}`

    return NextResponse.json({
      success: true,
      qr: {
        id: qr.id,
        token: qr.token,
        validFrom: qr.validFrom,
        validUntil: qr.validUntil,
        sessionId: qr.sessionId,
        program: qr.session.program,
        sessionNo: qr.session.sessionNo,
        sessionTitle: qr.session.title,
        sessionDate: qr.session.date,
      },
      checkInUrl,
      validFrom: now,
      validUntil,
    })
  } catch (error) {
    console.error('QR 생성 오류:', error)
    return NextResponse.json({ error: 'QR 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// GET: 현재 활성 QR 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: '회차 ID가 필요합니다.' }, { status: 400 })
    }

    const qr = await prisma.attendanceQR.findFirst({
      where: {
        sessionId,
        isActive: true,
        validUntil: { gte: new Date() },
      },
      include: {
        session: {
          include: {
            program: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!qr) {
      return NextResponse.json({ qr: null })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bestcome.org'
    const checkInUrl = `${baseUrl}/attendance/check?token=${qr.token}`

    return NextResponse.json({
      qr: {
        id: qr.id,
        token: qr.token,
        validFrom: qr.validFrom,
        validUntil: qr.validUntil,
        sessionId: qr.sessionId,
        program: qr.session.program,
        sessionNo: qr.session.sessionNo,
        sessionTitle: qr.session.title,
        sessionDate: qr.session.date,
      },
      checkInUrl,
    })
  } catch (error) {
    console.error('QR 조회 오류:', error)
    return NextResponse.json({ error: 'QR 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
