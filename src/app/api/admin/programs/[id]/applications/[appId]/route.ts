import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id: programId, appId } = await params

    const application = await prisma.programApplication.findFirst({
      where: { id: appId, programId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: '신청을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT - Update single application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id: programId, appId } = await params
    const body = await request.json()

    const application = await prisma.programApplication.findFirst({
      where: { id: appId, programId },
    })

    if (!application) {
      return NextResponse.json({ error: '신청을 찾을 수 없습니다' }, { status: 404 })
    }

    // Build update data
    const updateData: any = {}

    if (body.status !== undefined) {
      updateData.status = body.status
      if (['ACCEPTED', 'ADDITIONAL'].includes(body.status)) {
        updateData.confirmedAt = new Date()
      }
    }

    if (body.depositPaid !== undefined) {
      updateData.depositPaid = body.depositPaid
    }

    if (body.depositAmount !== undefined) {
      updateData.depositAmount = body.depositAmount
    }

    if (body.depositPaidAt !== undefined) {
      updateData.depositPaidAt = body.depositPaidAt ? new Date(body.depositPaidAt) : null
    }

    if (body.depositNote !== undefined) {
      updateData.depositNote = body.depositNote
    }

    if (body.note !== undefined) {
      updateData.note = body.note
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.programApplication.update({
        where: { id: appId },
        data: updateData,
      })

      // If deposit marked as paid, update participant if exists
      if (body.depositPaid && body.depositAmount) {
        await tx.programParticipant.updateMany({
          where: {
            programId,
            userId: application.userId,
          },
          data: {
            depositAmount: body.depositAmount,
            depositPaidAt: new Date(),
            depositStatus: 'PAID',
          },
        })
      }

      return app
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: '수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - Delete application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id: programId, appId } = await params

    const application = await prisma.programApplication.findFirst({
      where: { id: appId, programId },
    })

    if (!application) {
      return NextResponse.json({ error: '신청을 찾을 수 없습니다' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // Delete application
      await tx.programApplication.delete({
        where: { id: appId },
      })

      // Update application count
      await tx.program.update({
        where: { id: programId },
        data: { applicationCount: { decrement: 1 } },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
