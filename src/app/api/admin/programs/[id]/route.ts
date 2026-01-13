import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 프로그램 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const program = await prisma.program.findUnique({
      where: { id: params.id },
      include: {
        sessions: {
          orderBy: { sessionNo: 'asc' }
        },
        applicationForm: true,
        depositSetting: true,
        _count: {
          select: {
            applications: true,
            participants: true,
            likes: true,
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json({ error: '프로그램 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 프로그램 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const data = await req.json()

    // 기존 프로그램 확인
    const existingProgram = await prisma.program.findUnique({
      where: { id: params.id }
    })

    if (!existingProgram) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 프로그램 업데이트
    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description || null,
        content: data.content || null,
        scheduleContent: data.scheduleContent || null,
        currentBookContent: data.currentBookContent || null,
        capacity: data.capacity,
        feeType: data.feeType,
        feeAmount: data.feeAmount,
        location: data.location || null,
        isOnline: data.isOnline,
        status: data.status,
        image: data.image || null,
        thumbnailSquare: data.thumbnailSquare || null,
        recruitStartDate: data.recruitStartDate ? new Date(data.recruitStartDate) : null,
        recruitEndDate: data.recruitEndDate ? new Date(data.recruitEndDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    })

    // 회차 정보 업데이트 (기존 삭제 후 재생성)
    if (data.sessions !== undefined) {
      // 기존 세션 삭제
      await prisma.programSession.deleteMany({
        where: { programId: params.id }
      })

      // 새 세션 생성
      if (Array.isArray(data.sessions) && data.sessions.length > 0) {
        await prisma.programSession.createMany({
          data: data.sessions.map((session: any) => ({
            programId: params.id,
            sessionNo: session.sessionNo,
            title: session.title || null,
            date: session.date ? new Date(session.date) : null,
            startTime: session.startTime || null,
            endTime: session.endTime || null,
            bookTitle: session.bookTitle || null,
            bookAuthor: session.bookAuthor || null,
            bookImage: session.bookImage || null,
            bookRange: session.bookRange || null,
          }))
        })
      }
    }

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json({ error: '프로그램 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 프로그램 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 기존 프로그램 확인
    const existingProgram = await prisma.program.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!existingProgram) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 신청이 있는 경우 삭제 불가
    if (existingProgram._count.applications > 0) {
      return NextResponse.json({
        error: '신청이 있는 프로그램은 삭제할 수 없습니다. 상태를 변경해주세요.'
      }, { status: 400 })
    }

    // 프로그램 삭제 (관련 세션도 cascade로 삭제됨)
    await prisma.program.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json({ error: '프로그램 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
