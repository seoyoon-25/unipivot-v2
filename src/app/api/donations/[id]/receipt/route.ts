import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReceiptPDF, issueReceipt } from '@/lib/services/donation-service'

// GET: 영수증 PDF 다운로드
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: donationId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const result = await getReceiptPDF(donationId)

    return new NextResponse(Buffer.from(result.pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
      },
    })
  } catch (error) {
    console.error('Receipt download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '영수증 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 영수증 발급
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: donationId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 확인
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const result = await issueReceipt(donationId)

    return NextResponse.json({
      success: true,
      receiptNumber: result.receiptNumber,
      receiptUrl: result.receiptUrl,
    })
  } catch (error) {
    console.error('Receipt issue error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '영수증 발급 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
