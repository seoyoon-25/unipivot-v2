import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/transactions - 거래 내역 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fundId = searchParams.get('fundId')
    const type = searchParams.get('type') // INCOME, EXPENSE
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (fundId) where.fundId = fundId
    if (type) where.type = type
    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate)
    }

    const [transactions, total] = await Promise.all([
      prisma.financeTransaction.findMany({
        where,
        include: {
          fund: true,
          financeAccount: true,
          receipt: true,
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.financeTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/finance/transactions - 거래 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      date,
      type,
      fundId,
      financeAccountId,
      amount,
      description,
      vendor,
      paymentMethod,
      evidenceType,
      note,
    } = body

    if (!date || !type || !fundId || !financeAccountId || !amount || !description) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // 거래 생성 및 기금 잔액 업데이트
    const transaction = await prisma.$transaction(async (tx) => {
      // 거래 생성
      const newTransaction = await tx.financeTransaction.create({
        data: {
          date: new Date(date),
          type,
          fundId,
          financeAccountId,
          amount: parseInt(amount),
          description,
          vendor,
          paymentMethod,
          evidenceType,
          note,
          createdBy: session.user?.id,
        },
        include: {
          fund: true,
          financeAccount: true,
        },
      })

      // 기금 잔액 업데이트
      const balanceChange = type === 'INCOME' ? parseInt(amount) : -parseInt(amount)
      await tx.fund.update({
        where: { id: fundId },
        data: {
          balance: { increment: balanceChange },
        },
      })

      return newTransaction
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
