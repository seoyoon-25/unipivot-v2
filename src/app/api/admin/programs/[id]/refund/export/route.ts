import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 반환 대상자 엑셀 다운로드
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
          where: {
            status: 'ACCEPTED',
            depositStatus: 'REFUND_PENDING',
            surveySubmitted: true,
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
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

    // CSV 데이터 생성
    const headers = [
      '번호',
      '이름',
      '이메일',
      '연락처',
      '반환금액',
      '은행명',
      '계좌번호',
      '예금주',
      '비고',
    ]

    const rows = program.applications
      .filter((app) => app.surveyResponse?.refundChoice === 'REFUND')
      .map((app, index) => {
        let bankName = ''
        let accountNumber = ''
        let accountHolder = ''

        if (app.surveyResponse?.bankAccount) {
          bankName = app.surveyResponse.bankAccount.bankName
          accountNumber = app.surveyResponse.bankAccount.accountNumber
          accountHolder = app.surveyResponse.bankAccount.accountHolder
        } else if (app.surveyResponse?.newBankName) {
          bankName = app.surveyResponse.newBankName
          accountNumber = app.surveyResponse.newAccountNumber || ''
          accountHolder = app.surveyResponse.newAccountHolder || ''
        }

        const refundAmount = app.refundableAmount || app.depositAmount || 0

        return [
          index + 1,
          app.user.name || '',
          app.user.email || '',
          app.user.phone || '',
          refundAmount,
          bankName,
          accountNumber,
          accountHolder,
          '',
        ]
      })

    // CSV 문자열 생성 (BOM 포함 - 엑셀에서 한글 인식)
    const BOM = '\uFEFF'
    const csvContent =
      BOM +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join(
        '\n'
      )

    // 파일명 생성
    const date = new Date().toISOString().split('T')[0]
    const filename = `${program.title}_반환목록_${date}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    console.error('Export refund list error:', error)
    return NextResponse.json(
      { error: '내보내기에 실패했습니다.' },
      { status: 500 }
    )
  }
}
