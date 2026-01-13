import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { calculateRefund, type RefundPolicyCriteria } from '@/lib/utils/deposit-calculator'
import { sendRefundCompleteNotification, getAvailableProvider } from '@/lib/services/messaging-service'

// GET: 보증금 반환 대상자 목록
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

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        depositSetting: true,
        applications: {
          where: { status: 'ACCEPTED' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            surveyResponse: {
              include: {
                bankAccount: true,
              },
            },
          },
        },
      },
    })

    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 참가자별 출석/독후감 통계 조회
    const participants = await prisma.programParticipant.findMany({
      where: { programId: id },
      include: {
        attendances: true,
        reports: { where: { status: 'SUBMITTED' } },
      },
    })

    const participantMap = new Map(participants.map((p) => [p.userId, p]))

    // 각 신청자의 반환 정보 계산
    const refundList = program.applications.map((app) => {
      const participant = participantMap.get(app.userId)
      const depositSetting = program.depositSetting

      const totalSessions = depositSetting?.totalSessions || 0
      const attendedSessions =
        participant?.attendances.filter((a) => a.status === 'PRESENT').length || 0
      const submittedReports = participant?.reports.length || 0

      let refundCalc = null
      if (depositSetting) {
        refundCalc = calculateRefund({
          depositAmount: app.depositAmount || depositSetting.depositAmount,
          refundPolicyType: depositSetting.conditionType as 'ONE_TIME' | 'ATTENDANCE_ONLY' | 'ATTENDANCE_AND_REPORT',
          refundPolicy: depositSetting.refundPolicy
            ? JSON.parse(depositSetting.refundPolicy)
            : [],
          totalSessions,
          attendedSessions,
          submittedReports,
          surveySubmitted: app.surveySubmitted,
          surveyRequired: depositSetting.surveyRequired,
        })
      }

      // 계좌 정보
      let bankInfo = null
      if (app.surveyResponse) {
        if (app.surveyResponse.bankAccount) {
          bankInfo = {
            bankName: app.surveyResponse.bankAccount.bankName,
            accountNumber: app.surveyResponse.bankAccount.accountNumber,
            accountHolder: app.surveyResponse.bankAccount.accountHolder,
          }
        } else if (app.surveyResponse.newBankCode) {
          bankInfo = {
            bankName: app.surveyResponse.newBankName,
            accountNumber: app.surveyResponse.newAccountNumber,
            accountHolder: app.surveyResponse.newAccountHolder,
          }
        }
      }

      return {
        id: app.id,
        user: app.user,
        depositAmount: app.depositAmount || depositSetting?.depositAmount || 0,
        depositStatus: app.depositStatus,
        surveySubmitted: app.surveySubmitted,
        refundChoice: app.surveyResponse?.refundChoice || null,
        stats: {
          totalSessions,
          attendedSessions,
          submittedReports,
          attendanceRate:
            totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0,
          reportRate:
            totalSessions > 0 ? Math.round((submittedReports / totalSessions) * 100) : 0,
        },
        refundCalc,
        bankInfo,
        refundedAmount: app.refundedAmount,
        refundedAt: app.refundedAt,
        donatedAmount: app.donatedAmount,
        donatedAt: app.donatedAt,
      }
    })

    // 요약 통계
    const summary = {
      total: refundList.length,
      surveyResponded: refundList.filter((r) => r.surveySubmitted).length,
      refundPending: refundList.filter(
        (r) => r.depositStatus === 'REFUND_PENDING' && r.refundChoice === 'REFUND'
      ).length,
      refundCompleted: refundList.filter((r) => r.depositStatus === 'REFUNDED').length,
      donated: refundList.filter((r) => r.refundChoice === 'DONATE').length,
      forfeited: refundList.filter((r) => !r.refundCalc?.eligible).length,
      totalRefundAmount: refundList
        .filter((r) => r.refundChoice === 'REFUND' && r.refundCalc?.eligible)
        .reduce((sum, r) => sum + (r.refundCalc?.refundAmount || 0), 0),
      totalDonatedAmount: refundList
        .filter((r) => r.refundChoice === 'DONATE')
        .reduce((sum, r) => sum + (r.refundCalc?.refundAmount || 0), 0),
    }

    return NextResponse.json({
      program: {
        id: program.id,
        title: program.title,
        depositSetting: program.depositSetting,
      },
      refundList,
      summary,
    })
  } catch (error) {
    console.error('Get refund list error:', error)
    return NextResponse.json(
      { error: '반환 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 반환 완료 처리
export async function POST(
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
    const { applicationIds, action } = body

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: '대상자를 선택해주세요.' }, { status: 400 })
    }

    if (action === 'complete_refund') {
      // 프로그램 정보 조회
      const program = await prisma.program.findUnique({
        where: { id },
        select: { title: true },
      })

      // 반환 완료 처리
      await prisma.programApplication.updateMany({
        where: {
          id: { in: applicationIds },
          programId: id,
          depositStatus: 'REFUND_PENDING',
        },
        data: {
          depositStatus: 'REFUNDED',
          refundedAt: new Date(),
        },
      })

      // 각 신청자의 반환 금액 업데이트 및 알림 대상 수집
      const notificationRecipients: Array<{
        userId: string
        name: string
        phone: string
        refundAmount: number
      }> = []

      for (const appId of applicationIds) {
        const app = await prisma.programApplication.findUnique({
          where: { id: appId },
          include: {
            user: { select: { id: true, name: true, phone: true } },
            program: { include: { depositSetting: true } },
          },
        })

        if (app) {
          const refundCalc = app.refundCalculation
            ? JSON.parse(app.refundCalculation)
            : null
          const refundAmount = refundCalc?.refundAmount || app.refundableAmount || 0

          await prisma.programApplication.update({
            where: { id: appId },
            data: {
              refundedAmount: refundAmount,
            },
          })

          // 알림 대상 추가
          if (app.user.phone) {
            notificationRecipients.push({
              userId: app.user.id,
              name: app.user.name || '회원',
              phone: app.user.phone,
              refundAmount,
            })
          }
        }
      }

      // 반환 완료 알림 발송
      let notificationResult = null
      if (notificationRecipients.length > 0 && program) {
        // 반환 금액별로 그룹화하여 발송
        const groupedByAmount = notificationRecipients.reduce(
          (acc, r) => {
            const key = r.refundAmount
            if (!acc[key]) acc[key] = []
            acc[key].push(r)
            return acc
          },
          {} as Record<number, typeof notificationRecipients>
        )

        const results = []
        for (const [amount, recipients] of Object.entries(groupedByAmount)) {
          const result = await sendRefundCompleteNotification(
            program.title,
            Number(amount),
            recipients
          )
          results.push(result)
        }

        notificationResult = {
          sent: results.reduce((sum, r) => sum + r.sent, 0),
          failed: results.reduce((sum, r) => sum + r.failed, 0),
        }
      }

      return NextResponse.json({
        message: `${applicationIds.length}명의 반환이 완료 처리되었습니다.`,
        notification: notificationResult,
        provider: getAvailableProvider(),
      })
    }

    return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 })
  } catch (error) {
    console.error('Process refund error:', error)
    return NextResponse.json(
      { error: '반환 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}
