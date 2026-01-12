import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/transactions/[id] - 거래 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.financeTransaction.findUnique({
      where: { id },
      include: {
        fund: true,
        financeAccount: true,
        receipt: true,
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/finance/transactions/[id] - 거래 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.financeTransaction.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // 금액 변경 시 기금 잔액도 업데이트
    const transaction = await prisma.$transaction(async (tx) => {
      // 기존 금액 되돌리기
      const oldBalanceChange = existing.type === 'INCOME' ? -existing.amount : existing.amount
      await tx.fund.update({
        where: { id: existing.fundId },
        data: { balance: { increment: oldBalanceChange } },
      })

      // 거래 업데이트
      const updated = await tx.financeTransaction.update({
        where: { id },
        data: {
          date: body.date ? new Date(body.date) : undefined,
          type: body.type,
          fundId: body.fundId,
          financeAccountId: body.financeAccountId,
          amount: body.amount ? parseInt(body.amount) : undefined,
          description: body.description,
          vendor: body.vendor,
          paymentMethod: body.paymentMethod,
          evidenceType: body.evidenceType,
          note: body.note,
        },
        include: {
          fund: true,
          financeAccount: true,
        },
      })

      // 새 금액 적용
      const newBalanceChange = updated.type === 'INCOME' ? updated.amount : -updated.amount
      await tx.fund.update({
        where: { id: updated.fundId },
        data: { balance: { increment: newBalanceChange } },
      })

      return updated
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/finance/transactions/[id] - 거래 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.financeTransaction.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // 거래 삭제 및 기금 잔액 복원
    await prisma.$transaction(async (tx) => {
      // 기금 잔액 복원
      const balanceChange = existing.type === 'INCOME' ? -existing.amount : existing.amount
      await tx.fund.update({
        where: { id: existing.fundId },
        data: { balance: { increment: balanceChange } },
      })

      // 거래 삭제
      await tx.financeTransaction.delete({
        where: { id },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
