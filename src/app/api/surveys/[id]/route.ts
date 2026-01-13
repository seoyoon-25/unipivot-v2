import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { calculateRefund, type RefundPolicyCriteria } from '@/lib/utils/deposit-calculator'

// GET: 만족도 조사 상세 (회원용)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const survey = await prisma.satisfactionSurvey.findUnique({
      where: { id },
      include: {
        program: {
          include: {
            depositSetting: true,
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: '만족도 조사를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 해당 사용자의 신청 정보 조회
    const application = await prisma.programApplication.findUnique({
      where: {
        programId_userId: {
          programId: survey.programId,
          userId: session.user.id,
        },
      },
    })

    if (!application || application.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: '이 프로그램에 참여하지 않았습니다.' },
        { status: 403 }
      )
    }

    // 이미 응답했는지 확인
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: { applicationId: application.id },
    })

    if (existingResponse) {
      return NextResponse.json({
        survey,
        application,
        alreadySubmitted: true,
        response: existingResponse,
      })
    }

    // 출석/독후감 통계 조회
    const participant = await prisma.programParticipant.findUnique({
      where: {
        programId_userId: {
          programId: survey.programId,
          userId: session.user.id,
        },
      },
      include: {
        attendances: true,
        reports: {
          where: { status: 'SUBMITTED' },
        },
      },
    })

    const totalSessions = survey.program.depositSetting?.totalSessions || 0
    const attendedSessions =
      participant?.attendances.filter((a) => a.status === 'PRESENT').length || 0
    const submittedReports = participant?.reports.length || 0

    // 반환 금액 계산
    let refundCalculation = null
    if (survey.program.depositSetting) {
      const ds = survey.program.depositSetting
      refundCalculation = calculateRefund({
        depositAmount: application.depositAmount || ds.depositAmount,
        refundPolicyType: ds.conditionType as 'ONE_TIME' | 'ATTENDANCE_ONLY' | 'ATTENDANCE_AND_REPORT',
        refundPolicy: ds.refundPolicy
          ? JSON.parse(ds.refundPolicy)
          : [],
        totalSessions,
        attendedSessions,
        submittedReports,
        surveySubmitted: true, // 응답 중이므로 true로 계산
        surveyRequired: ds.surveyRequired,
      })
    }

    // 회원 계좌 목록 조회
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({
      survey,
      application,
      alreadySubmitted: false,
      stats: {
        totalSessions,
        attendedSessions,
        submittedReports,
        attendanceRate: totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0,
        reportRate: totalSessions > 0 ? Math.round((submittedReports / totalSessions) * 100) : 0,
      },
      refundCalculation,
      bankAccounts,
    })
  } catch (error) {
    console.error('Get survey error:', error)
    return NextResponse.json(
      { error: '만족도 조사를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 만족도 조사 응답 제출
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const {
      answers,
      refundChoice,
      bankAccountId,
      newBankCode,
      newBankName,
      newAccountNumber,
      newAccountHolder,
      saveNewAccount,
      donationMessage,
      isAnonymous,
      receiptRequested,
    } = body

    // 만족도 조사 조회
    const survey = await prisma.satisfactionSurvey.findUnique({
      where: { id },
      include: {
        program: {
          include: { depositSetting: true },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: '만족도 조사를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (survey.status !== 'SENT') {
      return NextResponse.json({ error: '응답할 수 없는 상태입니다.' }, { status: 400 })
    }

    if (new Date() > survey.deadline) {
      return NextResponse.json({ error: '응답 기한이 지났습니다.' }, { status: 400 })
    }

    // 신청 정보 조회
    const application = await prisma.programApplication.findUnique({
      where: {
        programId_userId: {
          programId: survey.programId,
          userId: session.user.id,
        },
      },
    })

    if (!application || application.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: '이 프로그램에 참여하지 않았습니다.' },
        { status: 403 }
      )
    }

    // 이미 응답했는지 확인
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: { applicationId: application.id },
    })

    if (existingResponse) {
      return NextResponse.json({ error: '이미 응답하셨습니다.' }, { status: 400 })
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 새 계좌 저장 (옵션)
      let savedBankAccountId = bankAccountId
      if (saveNewAccount && newBankCode && newAccountNumber && newAccountHolder) {
        const newAccount = await tx.bankAccount.create({
          data: {
            userId: session.user.id,
            bankCode: newBankCode,
            bankName: newBankName || newBankCode,
            accountNumber: newAccountNumber.replace(/\D/g, ''),
            accountHolder: newAccountHolder,
          },
        })
        savedBankAccountId = newAccount.id
      }

      // 응답 생성
      const response = await tx.surveyResponse.create({
        data: {
          surveyId: id,
          applicationId: application.id,
          userId: session.user.id,
          answers: JSON.stringify(answers),
          refundChoice: refundChoice || 'REFUND',
          bankAccountId: refundChoice === 'REFUND' ? savedBankAccountId : null,
          newBankCode: refundChoice === 'REFUND' && !savedBankAccountId ? newBankCode : null,
          newBankName: refundChoice === 'REFUND' && !savedBankAccountId ? newBankName : null,
          newAccountNumber:
            refundChoice === 'REFUND' && !savedBankAccountId ? newAccountNumber : null,
          newAccountHolder:
            refundChoice === 'REFUND' && !savedBankAccountId ? newAccountHolder : null,
          saveNewAccount: saveNewAccount || false,
          donationMessage: refundChoice === 'DONATE' ? donationMessage : null,
          isAnonymous: refundChoice === 'DONATE' ? (isAnonymous || false) : false,
          receiptRequested: refundChoice === 'DONATE' ? (receiptRequested || false) : false,
        },
      })

      // 신청 정보 업데이트
      await tx.programApplication.update({
        where: { id: application.id },
        data: {
          surveySubmitted: true,
          surveySubmittedAt: new Date(),
          depositStatus: refundChoice === 'DONATE' ? 'DONATED' : 'REFUND_PENDING',
        },
      })

      // 만족도 조사 응답 수 업데이트
      await tx.satisfactionSurvey.update({
        where: { id },
        data: {
          responseCount: { increment: 1 },
        },
      })

      return response
    })

    return NextResponse.json({
      success: true,
      response: result,
      message:
        refundChoice === 'DONATE'
          ? '후원해 주셔서 감사합니다!'
          : '응답이 제출되었습니다. 보증금은 검토 후 반환됩니다.',
    })
  } catch (error) {
    console.error('Submit survey response error:', error)
    return NextResponse.json(
      { error: '응답 제출에 실패했습니다.' },
      { status: 500 }
    )
  }
}
