import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { headers } from 'next/headers'
import { sendAdminNotification } from '@/lib/services/notification-sender'

// 에러 메시지 (모호하게 - 부정 탐지 힌트를 주지 않음)
const GENERIC_ERROR = '요청을 처리할 수 없습니다. 고객센터로 문의해주세요.'
const ALREADY_CLAIMED = '이미 참여하셨습니다.'

interface ClaimRequest {
  realName: string
  phoneNumber: string
  bankCode: string
  bankName: string
  accountNumber: string
}

// IP 주소 추출
function getClientIP(request: NextRequest): string {
  const headersList = headers()
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return '0.0.0.0'
}

// 위험도 점수 계산
async function calculateRiskScore(
  surveyId: string,
  userId: string,
  ipAddress: string,
  accountNumber: string,
  phoneNumber: string
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = []
  let score = 0

  // 1. 같은 계좌로 다른 연구에서 다른 사용자가 신청한 경우
  const sameAccountDifferentUser = await prisma.rewardClaim.findFirst({
    where: {
      accountNumber,
      userId: { not: userId },
    },
  })
  if (sameAccountDifferentUser) {
    score += 40
    reasons.push(`동일 계좌 다른 사용자 신청 이력 (surveyId: ${sameAccountDifferentUser.surveyId})`)
  }

  // 2. 1시간 내 같은 IP에서 5개 이상 신청
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const ipClaimsLastHour = await prisma.rewardClaim.count({
    where: {
      ipAddress,
      createdAt: { gte: oneHourAgo },
    },
  })
  if (ipClaimsLastHour >= 5) {
    score += 30
    reasons.push(`1시간 내 동일 IP에서 ${ipClaimsLastHour}건 신청`)
  }

  // 3. 같은 전화번호로 다른 사용자가 신청한 경우
  const samePhoneDifferentUser = await prisma.rewardClaim.findFirst({
    where: {
      phoneNumber,
      userId: { not: userId },
    },
  })
  if (samePhoneDifferentUser) {
    score += 30
    reasons.push(`동일 전화번호 다른 사용자 신청 이력`)
  }

  return { score, reasons }
}

// POST: 사례비 신청
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: surveyId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const userId = session.user.id
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || null

    // 연구 조회
    const survey = await prisma.labSurvey.findUnique({
      where: { id: surveyId },
    })

    if (!survey) {
      return NextResponse.json({ error: '연구를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (survey.status !== 'COMPLETED' && survey.status !== 'CLOSED') {
      return NextResponse.json({ error: '아직 사례비 신청 기간이 아닙니다.' }, { status: 400 })
    }

    if (!survey.rewardAmount || survey.rewardAmount <= 0) {
      return NextResponse.json({ error: '사례비가 설정되지 않은 연구입니다.' }, { status: 400 })
    }

    // 요청 데이터 파싱
    const body: ClaimRequest = await request.json()
    const { realName, phoneNumber, bankCode, bankName, accountNumber } = body

    // 유효성 검사
    if (!realName || !phoneNumber || !bankCode || !bankName || !accountNumber) {
      return NextResponse.json({ error: '필수 정보를 모두 입력해주세요.' }, { status: 400 })
    }

    // 전화번호 정규화 (하이픈 제거)
    const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '')
    // 계좌번호 정규화 (하이픈 제거)
    const normalizedAccount = accountNumber.replace(/[^0-9]/g, '')

    // ═══════════════════════════════════════════════════════════════
    // Layer 1: IP Rate Limiting
    // 같은 연구 + 같은 IP에서 24시간 내 2건 이상이면 차단
    // ═══════════════════════════════════════════════════════════════
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const ipClaimsForSurvey = await prisma.rewardClaim.count({
      where: {
        surveyId,
        ipAddress,
        createdAt: { gte: oneDayAgo },
      },
    })

    if (ipClaimsForSurvey >= 2) {
      console.log(`[RewardClaim] IP Rate Limit: surveyId=${surveyId}, ip=${ipAddress}, count=${ipClaimsForSurvey}`)
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 429 })
    }

    // ═══════════════════════════════════════════════════════════════
    // Layer 2: User Account Check
    // 같은 연구 + 같은 사용자면 차단
    // ═══════════════════════════════════════════════════════════════
    const existingUserClaim = await prisma.rewardClaim.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
    })

    if (existingUserClaim) {
      return NextResponse.json({ error: ALREADY_CLAIMED }, { status: 409 })
    }

    // ═══════════════════════════════════════════════════════════════
    // Layer 3: Financial Identity Check
    // 같은 연구에서 같은 계좌번호 또는 같은 전화번호면 차단
    // ═══════════════════════════════════════════════════════════════
    const sameFinancialIdentity = await prisma.rewardClaim.findFirst({
      where: {
        surveyId,
        OR: [
          { accountNumber: normalizedAccount },
          { phoneNumber: normalizedPhone },
        ],
      },
    })

    if (sameFinancialIdentity) {
      console.log(`[RewardClaim] Financial Identity Block: surveyId=${surveyId}, userId=${userId}, matchedClaimId=${sameFinancialIdentity.id}`)
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 409 })
    }

    // ═══════════════════════════════════════════════════════════════
    // Risk Score Calculation (플래그 여부 결정)
    // ═══════════════════════════════════════════════════════════════
    const { score: riskScore, reasons: flagReasons } = await calculateRiskScore(
      surveyId,
      userId,
      ipAddress,
      normalizedAccount,
      normalizedPhone
    )

    const shouldFlag = riskScore >= 30

    // ═══════════════════════════════════════════════════════════════
    // Create Reward Claim
    // ═══════════════════════════════════════════════════════════════
    const rewardClaim = await prisma.rewardClaim.create({
      data: {
        surveyId,
        userId,
        realName,
        phoneNumber: normalizedPhone,
        bankCode,
        bankName,
        accountNumber: normalizedAccount,
        amount: survey.rewardAmount,
        ipAddress,
        userAgent,
        flagged: shouldFlag,
        flagReason: shouldFlag ? flagReasons.join('; ') : null,
        riskScore,
      },
    })

    // 플래그된 경우 관리자에게 알림
    if (shouldFlag) {
      console.log(`[RewardClaim] FLAGGED: id=${rewardClaim.id}, riskScore=${riskScore}, reasons=${flagReasons.join('; ')}`)
      // 관리자 알림 발송
      await sendAdminNotification({
        type: 'REWARD_CLAIM_FLAGGED',
        title: '⚠️ 의심스러운 사례비 신청',
        message: `연구 "${survey.title}" 사례비 신청에서 부정 의심 항목이 감지되었습니다.\n\n위험 점수: ${riskScore}\n사유: ${flagReasons.join(', ')}\n\n신청자: ${realName} (${normalizedPhone})`,
        data: {
          claimId: rewardClaim.id,
          surveyId,
          surveyTitle: survey.title,
          userId,
          riskScore,
          flagReasons,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: '사례비 신청이 완료되었습니다. 관리자 승인 후 지급됩니다.',
      claimId: rewardClaim.id,
      amount: rewardClaim.amount,
    })
  } catch (error) {
    console.error('Reward claim error:', error)
    return NextResponse.json(
      { error: '사례비 신청 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET: 내 신청 현황 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: surveyId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const claim = await prisma.rewardClaim.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        status: true,
        amount: true,
        bankName: true,
        accountNumber: true,
        realName: true,
        createdAt: true,
        paidAt: true,
      },
    })

    if (!claim) {
      return NextResponse.json({ hasClaim: false })
    }

    // 계좌번호 마스킹
    const maskedAccount = claim.accountNumber.slice(0, 4) + '****' + claim.accountNumber.slice(-4)

    return NextResponse.json({
      hasClaim: true,
      claim: {
        ...claim,
        accountNumber: maskedAccount,
      },
    })
  } catch (error) {
    console.error('Get claim error:', error)
    return NextResponse.json(
      { error: '신청 현황 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
