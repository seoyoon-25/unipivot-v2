import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT - Bulk update application status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id: programId } = await params
    const { ids, status } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '신청 ID를 선택해주세요' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'ACCEPTED', 'ADDITIONAL', 'REJECTED', 'NO_CONTACT']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다' }, { status: 400 })
    }

    // Get program info
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, title: true },
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다' }, { status: 404 })
    }

    // Update applications
    const result = await prisma.$transaction(async (tx) => {
      // Update status
      const updated = await tx.programApplication.updateMany({
        where: {
          id: { in: ids },
          programId,
        },
        data: {
          status,
          confirmedAt: ['ACCEPTED', 'ADDITIONAL'].includes(status) ? new Date() : undefined,
        },
      })

      // If accepted, create participants
      if (['ACCEPTED', 'ADDITIONAL'].includes(status)) {
        const applications = await tx.programApplication.findMany({
          where: { id: { in: ids }, programId, userId: { not: null } },
          select: { userId: true, depositAmount: true },
        })

        for (const app of applications) {
          if (!app.userId) continue

          // Check if already a participant
          const existing = await tx.programParticipant.findUnique({
            where: {
              programId_userId: {
                programId,
                userId: app.userId,
              },
            },
          })

          if (!existing) {
            await tx.programParticipant.create({
              data: {
                programId,
                userId: app.userId,
                depositAmount: app.depositAmount || 0,
                depositStatus: app.depositAmount ? 'UNPAID' : 'NONE',
              },
            })
          }
        }
      }

      // Get applications for notifications
      const applications = await tx.programApplication.findMany({
        where: { id: { in: ids } },
        include: { user: { select: { id: true, name: true } } },
      })

      // Create notifications
      for (const app of applications) {
        let notificationTitle = ''
        let notificationContent = ''

        switch (status) {
          case 'ACCEPTED':
            notificationTitle = '합격을 축하드립니다!'
            notificationContent = `${program.title} 프로그램에 합격하셨습니다. 입금 안내가 곧 발송됩니다.`
            break
          case 'ADDITIONAL':
            notificationTitle = '추가 합격 안내'
            notificationContent = `${program.title} 프로그램에 추가 합격하셨습니다!`
            break
          case 'REJECTED':
            notificationTitle = '신청 결과 안내'
            notificationContent = `아쉽게도 ${program.title} 프로그램에 선발되지 못하였습니다. 다음 기회에 다시 만나뵙기를 바랍니다.`
            break
          case 'NO_CONTACT':
            notificationTitle = '연락 요청'
            notificationContent = `${program.title} 관련 연락 드렸으나 연락이 닿지 않았습니다. 확인 부탁드립니다.`
            break
        }

        if (notificationTitle && app.userId) {
          await tx.notification.create({
            data: {
              userId: app.userId,
              type: 'PROGRAM',
              title: notificationTitle,
              content: notificationContent,
              link: `/my/applications`,
            },
          })
        }
      }

      return updated
    })

    return NextResponse.json({
      success: true,
      count: result.count,
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
