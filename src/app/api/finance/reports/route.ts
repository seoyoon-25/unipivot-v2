import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/reports - 재무 보고서 조회
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
    let startDate: Date
    let endDate: Date

    if (month) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    // 거래 조회
    const transactions = await prisma.financeTransaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        financeAccount: {
          select: { category: true, subcategory: true }
        }
      }
    })

    // 총계 계산
    const totals = {
      income: 0,
      expense: 0,
      balance: 0
    }

    transactions.forEach(tx => {
      if (tx.type === 'INCOME') {
        totals.income += tx.amount
      } else {
        totals.expense += tx.amount
      }
    })
    totals.balance = totals.income - totals.expense

    // 카테고리별 집계
    const incomeByCategory: Record<string, { category: string; subcategory: string | null; amount: number; count: number }> = {}
    const expenseByCategory: Record<string, { category: string; subcategory: string | null; amount: number; count: number }> = {}

    transactions.forEach(tx => {
      const key = `${tx.financeAccount.category}|${tx.financeAccount.subcategory || ''}`
      const target = tx.type === 'INCOME' ? incomeByCategory : expenseByCategory

      if (!target[key]) {
        target[key] = {
          category: tx.financeAccount.category || '미분류',
          subcategory: tx.financeAccount.subcategory,
          amount: 0,
          count: 0
        }
      }
      target[key].amount += tx.amount
      target[key].count++
    })

    // 월별 추이 (연간 보고서일 때만)
    const monthlyTrend: { month: number; income: number; expense: number }[] = []

    if (!month) {
      for (let m = 1; m <= 12; m++) {
        const monthTx = transactions.filter(tx => {
          const txMonth = new Date(tx.date).getMonth() + 1
          return txMonth === m
        })

        const income = monthTx.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + tx.amount, 0)
        const expense = monthTx.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + tx.amount, 0)

        if (income > 0 || expense > 0) {
          monthlyTrend.push({ month: m, income, expense })
        }
      }
    }

    return NextResponse.json({
      period: { year, month },
      totals,
      incomeByCategory: Object.values(incomeByCategory).sort((a, b) => b.amount - a.amount),
      expenseByCategory: Object.values(expenseByCategory).sort((a, b) => b.amount - a.amount),
      monthlyTrend
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
