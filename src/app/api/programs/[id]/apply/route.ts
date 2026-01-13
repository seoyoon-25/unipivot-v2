import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: programId } = await params
    const body = await request.json()

    // Validate required fields
    const { name, phone, email, hometown, residence, motivation, source, referrer, facePrivacy, privacyAgreed } = body

    if (!name || !phone || !email || !hometown || !residence || !motivation || !source) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    if (source === 'REFERRAL' && !referrer) {
      return NextResponse.json(
        { error: '추천인 이름을 입력해주세요' },
        { status: 400 }
      )
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { error: '개인정보 수집에 동의해주세요' },
        { status: 400 }
      )
    }

    // Check if program exists and is recruiting
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        title: true,
        status: true,
        recruitStartDate: true,
        recruitEndDate: true,
        capacity: true,
        applicationCount: true,
      },
    })

    if (!program) {
      return NextResponse.json(
        { error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Check recruiting status
    const now = new Date()
    if (program.recruitEndDate && now > program.recruitEndDate) {
      return NextResponse.json(
        { error: '모집이 마감되었습니다' },
        { status: 400 }
      )
    }

    // Check if already applied
    const existingApplication = await prisma.programApplication.findUnique({
      where: {
        programId_userId: {
          programId,
          userId: session.user.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 신청하셨습니다' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.$transaction(async (tx) => {
      // Create the application
      const app = await tx.programApplication.create({
        data: {
          programId,
          userId: session.user.id,
          status: 'PENDING',
          email,
          hometown,
          residence,
          motivation,
          source,
          referrer: source === 'REFERRAL' ? referrer : null,
          facePrivacy: facePrivacy || false,
          privacyAgreed,
        },
      })

      // Update program application count
      await tx.program.update({
        where: { id: programId },
        data: { applicationCount: { increment: 1 } },
      })

      // Update user phone if provided
      if (phone) {
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { phone: true },
        })
        if (!user?.phone) {
          await tx.user.update({
            where: { id: session.user.id },
            data: { phone },
          })
        }
      }

      // Create notification for user
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'PROGRAM',
          title: '프로그램 신청 완료',
          content: `${program.title} 신청이 접수되었습니다. 심사 후 결과를 안내드리겠습니다.`,
          link: `/my/applications`,
        },
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'PROGRAM_APPLICATION',
          target: program.title,
          targetId: programId,
        },
      })

      return app
    })

    return NextResponse.json({
      success: true,
      applicationId: application.id,
    })
  } catch (error) {
    console.error('Application error:', error)
    return NextResponse.json(
      { error: '신청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET - Check application status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: programId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ hasApplied: false })
    }

    const application = await prisma.programApplication.findUnique({
      where: {
        programId_userId: {
          programId,
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
      },
    })

    return NextResponse.json({
      hasApplied: !!application,
      application,
    })
  } catch (error) {
    console.error('Check application error:', error)
    return NextResponse.json(
      { error: '신청 상태 확인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
