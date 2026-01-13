import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { getBankByCode } from '@/lib/constants/banks'

const MAX_ACCOUNTS = 5

// GET: 내 계좌 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const accounts = await prisma.bankAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: '계좌 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// POST: 새 계좌 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { bankCode, accountNumber, accountHolder, isDefault } = body

    // 유효성 검사
    if (!bankCode || !accountNumber || !accountHolder) {
      return NextResponse.json({ error: '필수 정보를 입력해주세요.' }, { status: 400 })
    }

    // 은행 코드 확인
    const bank = getBankByCode(bankCode)
    if (!bank) {
      return NextResponse.json({ error: '유효하지 않은 은행 코드입니다.' }, { status: 400 })
    }

    // 계좌번호 정규화 (숫자만)
    const normalizedAccountNumber = accountNumber.replace(/\D/g, '')

    // 계좌 개수 확인
    const accountCount = await prisma.bankAccount.count({
      where: { userId: session.user.id },
    })

    if (accountCount >= MAX_ACCOUNTS) {
      return NextResponse.json(
        { error: `최대 ${MAX_ACCOUNTS}개까지 등록할 수 있습니다.` },
        { status: 400 }
      )
    }

    // 중복 확인
    const existing = await prisma.bankAccount.findFirst({
      where: {
        userId: session.user.id,
        bankCode,
        accountNumber: normalizedAccountNumber,
      },
    })

    if (existing) {
      return NextResponse.json({ error: '이미 등록된 계좌입니다.' }, { status: 400 })
    }

    // 기본 계좌로 설정하는 경우 기존 기본 계좌 해제
    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    // 첫 번째 계좌인 경우 자동으로 기본 계좌로 설정
    const shouldBeDefault = isDefault || accountCount === 0

    const account = await prisma.bankAccount.create({
      data: {
        userId: session.user.id,
        bankCode,
        bankName: bank.name,
        accountNumber: normalizedAccountNumber,
        accountHolder: accountHolder.trim(),
        isDefault: shouldBeDefault,
      },
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json({ error: '계좌 등록에 실패했습니다.' }, { status: 500 })
  }
}
