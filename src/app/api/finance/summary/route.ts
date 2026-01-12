import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/summary - 재무 요약 통계
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    // 기간 설정
    let startDate: Date, endDate: Date
    if (month) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    // 수입/지출 합계
    const [incomeTotal, expenseTotal] = await Promise.all([
      prisma.financeTransaction.aggregate({
        where: {
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.financeTransaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ])

    // 카테고리별 수입
    const incomeByCategory = await prisma.financeTransaction.groupBy({
      by: ['financeAccountId'],
      where: {
        type: 'INCOME',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    // 카테고리별 지출
    const expenseByCategory = await prisma.financeTransaction.groupBy({
      by: ['financeAccountId'],
      where: {
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    // 계정 정보 가져오기
    const accountIds = [
      ...incomeByCategory.map((i) => i.financeAccountId),
      ...expenseByCategory.map((e) => e.financeAccountId),
    ]
    const accounts = await prisma.financeAccount.findMany({
      where: { id: { in: accountIds } },
    })
    const accountMap = new Map(accounts.map((a) => [a.id, a]))

    // 월별 추이 (연간 조회 시)
    let monthlyTrend: { month: number; income: number; expense: number }[] = []
    if (!month) {
      const transactions = await prisma.financeTransaction.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        select: {
          date: true,
          type: true,
          amount: true,
        },
      })

      const monthlyData: Record<number, { income: number; expense: number }> = {}
      for (let i = 1; i <= 12; i++) {
        monthlyData[i] = { income: 0, expense: 0 }
      }

      transactions.forEach((t) => {
        const m = t.date.getMonth() + 1
        if (t.type === 'INCOME') {
          monthlyData[m].income += t.amount
        } else {
          monthlyData[m].expense += t.amount
        }
      })

      monthlyTrend = Object.entries(monthlyData).map(([m, data]) => ({
        month: parseInt(m),
        ...data,
      }))
    }

    // 기금 잔액
    const funds = await prisma.fund.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
      },
    })

    // 최근 거래
    const recentTransactions = await prisma.financeTransaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        financeAccount: true,
        fund: true,
      },
    })

    return NextResponse.json({
      period: { year, month, startDate, endDate },
      totals: {
        income: incomeTotal._sum.amount || 0,
        expense: expenseTotal._sum.amount || 0,
        balance: (incomeTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0),
      },
      incomeByCategory: incomeByCategory.map((i) => ({
        account: accountMap.get(i.financeAccountId),
        amount: i._sum.amount,
      })),
      expenseByCategory: expenseByCategory.map((e) => ({
        account: accountMap.get(e.financeAccountId),
        amount: e._sum.amount,
      })),
      monthlyTrend,
      funds,
      recentTransactions,
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
