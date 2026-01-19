import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { matchApplicant, normalizePhone } from '@/lib/services/member-matching'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: programId } = await params
    const body = await request.json()

    // Validate required fields
    const {
      name,
      phone,
      email,
      birthDate,
      birthYear,
      gender,
      organization,
      origin,
      hometown,
      residence,
      motivation,
      selfIntro,
      referralSource,
      referrerName,
      agreedToRules,
      agreedToTerms,
      agreedToPrivacy,
      facePrivacy,
      // Legacy fields
      source,
      referrer,
      privacyAgreed,
    } = body

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: '이름, 연락처, 이메일은 필수입니다' },
        { status: 400 }
      )
    }

    // Get program with settings
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: {
            applications: { where: { status: 'APPROVED' } }
          }
        }
      },
    })

    if (!program) {
      return NextResponse.json(
        { error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Check if recruiting/application is open
    const now = new Date()
    const isOpen = program.applicationOpen ||
      (program.status === 'PUBLISHED' && (!program.recruitEndDate || now <= program.recruitEndDate))

    if (!isOpen) {
      return NextResponse.json(
        { error: '모집이 마감되었습니다' },
        { status: 400 }
      )
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone)

    // Match with existing member
    const matchResult = await matchApplicant({
      name,
      email,
      phone: normalizedPhone,
      birthYear: birthYear || undefined,
      hometown,
    })

    // Check if blocked and auto-reject is enabled
    if (matchResult.alertLevel === 'BLOCKED' && program.autoRejectBlocked) {
      return NextResponse.json(
        { error: '신청이 제한되었습니다. 문의: unipivot@gmail.com' },
        { status: 403 }
      )
    }

    // Check for duplicate application
    const existingApplication = await prisma.programApplication.findFirst({
      where: {
        programId,
        OR: [
          { email },
          { phone: normalizedPhone },
          ...(matchResult.member ? [{ memberId: matchResult.member.id }] : []),
          ...(session?.user?.id ? [{ userId: session.user.id }] : []),
        ],
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 신청하셨습니다' },
        { status: 400 }
      )
    }

    // Determine status
    let status = 'PENDING'
    const isFull = program.maxParticipants && program._count.applications >= program.maxParticipants

    if (isFull) {
      status = 'WAITLIST'
    } else if (matchResult.alertLevel === 'BLOCKED' || matchResult.alertLevel === 'WARNING') {
      status = 'PENDING' // Needs review
    } else if (
      (program.autoApproveVVIP && matchResult.member?.grade === 'VVIP') ||
      (program.autoApproveVIP && matchResult.member?.grade === 'VIP')
    ) {
      status = 'APPROVED' // Auto-approve VIP
    }

    // Create application using transaction
    const application = await prisma.$transaction(async (tx) => {
      // Create the application
      const app = await tx.programApplication.create({
        data: {
          programId,

          // Applicant info
          name,
          email,
          phone: normalizedPhone,
          birthDate: birthDate ? new Date(birthDate) : null,
          birthYear: birthYear || null,
          gender,
          organization,
          origin,
          hometown,
          residence,

          // Application content
          motivation,
          selfIntro,
          referralSource: referralSource || source || null,
          referrerName: referrerName || referrer || null,

          // Agreements
          agreedToRules: agreedToRules || false,
          agreedToTerms: agreedToTerms || false,
          agreedToPrivacy: agreedToPrivacy || privacyAgreed || false,
          privacyAgreed: agreedToPrivacy || privacyAgreed || false,
          facePrivacy: facePrivacy || false,

          // User/Member linking
          userId: session?.user?.id || null,
          memberId: matchResult.member?.id || null,

          // Match results
          matchedMemberId: matchResult.member?.id || null,
          matchedMemberCode: matchResult.member?.memberCode || null,
          memberGrade: matchResult.member?.grade || null,
          memberStatus: matchResult.member?.status || null,
          alertLevel: matchResult.alertLevel || null,
          matchType: matchResult.matchType || null,

          // Status
          status,
          depositAmount: program.depositAmountSetting,
        },
      })

      // Update program application count
      await tx.program.update({
        where: { id: programId },
        data: { applicationCount: { increment: 1 } },
      })

      // Update user phone if logged in and no phone set
      if (session?.user?.id && phone) {
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { phone: true },
        })
        if (!user?.phone) {
          await tx.user.update({
            where: { id: session.user.id },
            data: { phone: normalizedPhone },
          })
        }
      }

      // Create notification for user if logged in
      if (session?.user?.id) {
        await tx.notification.create({
          data: {
            userId: session.user.id,
            type: 'PROGRAM',
            title: '프로그램 신청 완료',
            content: `${program.title} 신청이 접수되었습니다. ${status === 'APPROVED' ? '자동 승인되었습니다!' : '심사 후 결과를 안내드리겠습니다.'}`,
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
      }

      return app
    })

    // Send admin notification for alert cases
    if (matchResult.alertLevel === 'BLOCKED' || matchResult.alertLevel === 'WARNING') {
      await prisma.adminNotification.create({
        data: {
          type: 'ALERT_APPLICATION',
          title: `${matchResult.alertLevel === 'BLOCKED' ? '차단' : '경고'} 회원 신청`,
          message: `${name}님이 ${program.title}에 신청했습니다. 확인이 필요합니다.`,
          data: {
            applicationId: application.id,
            alertLevel: matchResult.alertLevel,
            memberCode: matchResult.member?.memberCode,
            programId,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      status,
      applicationId: application.id,
      isAutoApproved: status === 'APPROVED',
      isWaitlist: status === 'WAITLIST',
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

    const application = await prisma.programApplication.findFirst({
      where: {
        programId,
        OR: [
          { userId: session.user.id },
          { email: session.user.email || '' },
        ],
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        depositPaid: true,
        depositAmount: true,
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
