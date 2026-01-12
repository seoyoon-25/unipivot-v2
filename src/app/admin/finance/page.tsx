import { getFinanceSummary, getFunds } from '@/lib/actions/admin'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
  FileText,
  PiggyBank,
  BarChart3,
  Users
} from 'lucide-react'

export default async function FinanceDashboard() {
  const [summary, funds] = await Promise.all([
    getFinanceSummary(),
    getFunds({ isActive: true })
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회계 관리</h1>
          <p className="text-gray-600">{summary.period.year}년 재무 현황</p>
        </div>
        <Link
          href="/admin/finance/transactions/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          거래 등록
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">총 수입</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totals.income)}원
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">총 지출</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totals.expense)}원
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">수지 잔액</p>
              <p className={`text-2xl font-bold ${summary.totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(summary.totals.balance)}원
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/finance/transactions"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <FileText className="w-5 h-5 text-gray-600" />
          <span className="font-medium">거래 내역</span>
          <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
        </Link>
        <Link
          href="/admin/finance/accounts"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <span className="font-medium">계정과목</span>
          <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
        </Link>
        <Link
          href="/admin/finance/funds"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <PiggyBank className="w-5 h-5 text-gray-600" />
          <span className="font-medium">기금 관리</span>
          <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
        </Link>
        <Link
          href="/admin/finance/donations"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <Users className="w-5 h-5 text-gray-600" />
          <span className="font-medium">기부금 관리</span>
          <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">기금 현황</h2>
          </div>
          <div className="p-4 space-y-3">
            {funds.map((fund) => (
              <div
                key={fund.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{fund.name}</p>
                  <p className="text-xs text-gray-500">
                    {fund.type === 'GENERAL' ? '일반기금' : '사업기금'}
                    {fund._count.transactions > 0 && ` · 거래 ${fund._count.transactions}건`}
                  </p>
                </div>
                <p className={`font-semibold ${fund.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(fund.balance)}원
                </p>
              </div>
            ))}
            {funds.length === 0 && (
              <p className="text-center text-gray-500 py-4">등록된 기금이 없습니다</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">최근 거래</h2>
            <Link href="/admin/finance/transactions" className="text-sm text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {summary.recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'INCOME' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.date)} · {tx.financeAccount.name}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}원
                </p>
              </div>
            ))}
            {summary.recentTransactions.length === 0 && (
              <p className="text-center text-gray-500 py-8">거래 내역이 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {summary.monthlyTrend.some(m => m.income > 0 || m.expense > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">월별 추이</h2>
          <div className="grid grid-cols-12 gap-2 h-40">
            {summary.monthlyTrend.map((m) => {
              const maxValue = Math.max(
                ...summary.monthlyTrend.map((t) => Math.max(t.income, t.expense))
              )
              const incomeHeight = maxValue > 0 ? (m.income / maxValue) * 100 : 0
              const expenseHeight = maxValue > 0 ? (m.expense / maxValue) * 100 : 0

              return (
                <div key={m.month} className="flex flex-col items-center justify-end gap-1">
                  <div className="flex gap-0.5 items-end h-28">
                    <div
                      className="w-3 bg-green-500 rounded-t"
                      style={{ height: `${incomeHeight}%`, minHeight: m.income > 0 ? '4px' : '0' }}
                      title={`수입: ${formatCurrency(m.income)}원`}
                    />
                    <div
                      className="w-3 bg-red-500 rounded-t"
                      style={{ height: `${expenseHeight}%`, minHeight: m.expense > 0 ? '4px' : '0' }}
                      title={`지출: ${formatCurrency(m.expense)}원`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{m.month}월</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm text-gray-600">수입</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-sm text-gray-600">지출</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
