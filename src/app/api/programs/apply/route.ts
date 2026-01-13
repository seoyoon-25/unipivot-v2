import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/programs/apply - 프로그램 신청
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { programId } = await request.json()

    // Check if program exists and is open
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        _count: { select: { registrations: true } }
      }
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (program.status !== 'OPEN') {
      return NextResponse.json({ error: '현재 모집 중인 프로그램이 아닙니다.' }, { status: 400 })
    }

    if (program._count.registrations >= program.capacity) {
      return NextResponse.json({ error: '정원이 마감되었습니다.' }, { status: 400 })
    }

    // Check if already applied
    const existing = await prisma.registration.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: '이미 신청한 프로그램입니다.' }, { status: 400 })
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId: session.user.id,
        programId,
        status: 'PENDING'
      }
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error applying to program:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/programs/apply - 프로그램 신청 취소
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { programId } = await request.json()

    // Find and delete registration
    const registration = await prisma.registration.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId
        }
      }
    })

    if (!registration) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (registration.status === 'APPROVED') {
      return NextResponse.json({ error: '승인된 신청은 취소할 수 없습니다.' }, { status: 400 })
    }

    await prisma.registration.delete({
      where: { id: registration.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
