import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { getBankByCode } from '@/lib/constants/banks'

// GET: 계좌 상세 조회
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

    const account = await prisma.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!account) {
      return NextResponse.json({ error: '계좌를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Get account error:', error)
    return NextResponse.json({ error: '계좌 정보를 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// PUT: 계좌 수정
export async function PUT(
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
    const { bankCode, accountNumber, accountHolder, isDefault } = body

    // 계좌 소유권 확인
    const existing = await prisma.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: '계좌를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 업데이트할 데이터 준비
    const updateData: Record<string, unknown> = {}

    if (bankCode) {
      const bank = getBankByCode(bankCode)
      if (!bank) {
        return NextResponse.json({ error: '유효하지 않은 은행 코드입니다.' }, { status: 400 })
      }
      updateData.bankCode = bankCode
      updateData.bankName = bank.name
    }

    if (accountNumber) {
      updateData.accountNumber = accountNumber.replace(/\D/g, '')
    }

    if (accountHolder) {
      updateData.accountHolder = accountHolder.trim()
    }

    // 기본 계좌 설정
    if (isDefault === true && !existing.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
      updateData.isDefault = true
    }

    const account = await prisma.bankAccount.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: '계좌 수정에 실패했습니다.' }, { status: 500 })
  }
}

// DELETE: 계좌 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 계좌 소유권 확인
    const account = await prisma.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!account) {
      return NextResponse.json({ error: '계좌를 찾을 수 없습니다.' }, { status: 404 })
    }

    await prisma.bankAccount.delete({
      where: { id },
    })

    // 삭제된 계좌가 기본 계좌였으면 다른 계좌를 기본으로 설정
    if (account.isDefault) {
      const firstAccount = await prisma.bankAccount.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
      })

      if (firstAccount) {
        await prisma.bankAccount.update({
          where: { id: firstAccount.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: '계좌 삭제에 실패했습니다.' }, { status: 500 })
  }
}
