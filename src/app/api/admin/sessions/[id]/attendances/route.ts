import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 회차별 출석 현황 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id

    // 세션(회차) 정보 조회
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

    // 참가자 목록과 출석 정보 조회
    const participants = await prisma.programParticipant.findMany({
      where: {
        programId: programSession.programId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        attendances: {
          where: { sessionId },
        },
      },
      orderBy: {
        user: { name: 'asc' },
      },
    })

    // 출석 현황 매핑
    const attendances = participants.map((participant) => {
      const attendance = participant.attendances[0]
      return {
        id: attendance?.id || `pending-${participant.id}`,
        participantId: participant.id,
        userId: participant.user.id,
        participantName: participant.user.name || '이름 없음',
        participantEmail: participant.user.email,
        status: attendance?.status || 'ABSENT',
        checkedAt: attendance?.checkedAt || null,
        checkMethod: attendance?.checkMethod || null,
      }
    })

    // 통계 계산
    const stats = {
      total: attendances.length,
      present: attendances.filter((a) => a.status === 'PRESENT').length,
      late: attendances.filter((a) => a.status === 'LATE').length,
      absent: attendances.filter((a) => a.status === 'ABSENT').length,
      excused: attendances.filter((a) => a.status === 'EXCUSED').length,
      attendanceRate: attendances.length > 0
        ? Math.round(
            ((attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length) /
              attendances.length) *
              100
          )
        : 0,
    }

    return NextResponse.json({
      session: {
        id: programSession.id,
        sessionNo: programSession.sessionNo,
        title: programSession.title,
        date: programSession.date,
        program: programSession.program,
      },
      attendances,
      stats,
    })
  } catch (error) {
    console.error('출석 현황 조회 오류:', error)
    return NextResponse.json({ error: '출석 현황 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// PUT: 출석 상태 변경 (수동 처리)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id
    const body = await request.json()
    const { participantId, status, note } = body

    if (!participantId || !status) {
      return NextResponse.json(
        { error: 'participantId와 status가 필요합니다.' },
        { status: 400 }
      )
    }

    // 유효한 상태값 확인
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      )
    }

    // 출석 정보 업데이트/생성
    const attendance = await prisma.programAttendance.upsert({
      where: {
        sessionId_participantId: {
          sessionId,
          participantId,
        },
      },
      update: {
        status,
        checkedAt: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
        checkMethod: 'MANUAL',
        note,
      },
      create: {
        sessionId,
        participantId,
        status,
        checkedAt: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
        checkMethod: 'MANUAL',
        note,
      },
    })

    return NextResponse.json({
      success: true,
      attendance,
    })
  } catch (error) {
    console.error('출석 상태 변경 오류:', error)
    return NextResponse.json({ error: '출석 상태 변경 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
