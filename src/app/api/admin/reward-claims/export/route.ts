import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 은행 대량이체용 엑셀 다운로드
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('surveyId')
    const status = searchParams.get('status') || 'APPROVED'

    // 필터 조건
    const where: any = { status }

    if (surveyId) {
      where.surveyId = surveyId
    }

    // 승인된 신청 건 조회
    const claims = await prisma.rewardClaim.findMany({
      where,
      include: {
        survey: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    if (claims.length === 0) {
      return NextResponse.json({ error: '다운로드할 데이터가 없습니다.' }, { status: 404 })
    }

    // CSV 생성 (은행 대량이체 형식)
    const headers = [
      '순번',
      '은행코드',
      '은행명',
      '계좌번호',
      '예금주',
      '금액',
      '전화번호',
      '이메일',
      '연구명',
      '신청일',
      '신청ID',
    ]

    const rows = claims.map((claim, index) => [
      index + 1,
      claim.bankCode,
      claim.bankName,
      claim.accountNumber,
      claim.realName,
      claim.amount,
      claim.phoneNumber,
      claim.user.email || '',
      claim.survey.title,
      new Date(claim.createdAt).toLocaleDateString('ko-KR'),
      claim.id,
    ])

    // BOM + CSV (Excel에서 한글 깨짐 방지)
    const BOM = '\uFEFF'
    const csvContent =
      BOM +
      headers.join(',') +
      '\n' +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    // 파일명
    const date = new Date().toISOString().split('T')[0]
    const filename = `reward_claims_${status.toLowerCase()}_${date}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export reward claims error:', error)
    return NextResponse.json(
      { error: '엑셀 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
