'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface CategoryData {
  category: string
  subcategory: string | null
  amount: number
  count: number
}

interface MonthlyData {
  month: number
  income: number
  expense: number
}

interface ReportData {
  period: { year: number; month?: number }
  totals: { income: number; expense: number; balance: number }
  incomeByCategory: CategoryData[]
  expenseByCategory: CategoryData[]
  monthlyTrend: MonthlyData[]
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState<number | null>(null)

  useEffect(() => {
    fetchReport()
  }, [year, month])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ year: year.toString() })
      if (month) params.append('month', month.toString())

      const res = await fetch(`/api/finance/reports?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const handleExportCSV = () => {
    if (!report) return

    let csv = '구분,분류,소분류,금액,건수\n'

    report.incomeByCategory.forEach(item => {
      csv += `수입,${item.category},${item.subcategory || '-'},${item.amount},${item.count}\n`
    })

    report.expenseByCategory.forEach(item => {
      csv += `지출,${item.category},${item.subcategory || '-'},${item.amount},${item.count}\n`
    })

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `재무보고서_${year}${month ? `_${month}월` : '년'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">재무 보고서</h1>
          <p className="text-gray-600">수입/지출 명세 및 분석</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV 다운로드
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">기간 선택:</span>
          </div>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={month || ''}
            onChange={(e) => setMonth(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">전체 (연간)</option>
            {months.map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 수입</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(report.totals.income)}원
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 지출</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(report.totals.expense)}원
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">순이익</p>
                  <p className={`text-2xl font-bold mt-1 ${report.totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(report.totals.balance)}원
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  report.totals.balance >= 0 ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <FileText className={`w-6 h-6 ${report.totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          {!month && report.monthlyTrend.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">월별 추이</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">월</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">수입</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">지출</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">순이익</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthlyTrend.map(m => (
                      <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 text-sm text-gray-900">{m.month}월</td>
                        <td className="py-3 text-sm text-right text-green-600">
                          {m.income > 0 ? `+${formatCurrency(m.income)}원` : '-'}
                        </td>
                        <td className="py-3 text-sm text-right text-red-600">
                          {m.expense > 0 ? `-${formatCurrency(m.expense)}원` : '-'}
                        </td>
                        <td className={`py-3 text-sm text-right font-medium ${
                          m.income - m.expense >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(m.income - m.expense)}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium">
                      <td className="py-3 text-sm text-gray-900">합계</td>
                      <td className="py-3 text-sm text-right text-green-600">
                        +{formatCurrency(report.totals.income)}원
                      </td>
                      <td className="py-3 text-sm text-right text-red-600">
                        -{formatCurrency(report.totals.expense)}원
                      </td>
                      <td className={`py-3 text-sm text-right ${
                        report.totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(report.totals.balance)}원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Income/Expense by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">수입 내역</h2>
                <span className="text-green-600 font-medium">
                  {formatCurrency(report.totals.income)}원
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {report.incomeByCategory.length > 0 ? (
                  report.incomeByCategory.map((item, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.category}</p>
                          {item.subcategory && (
                            <p className="text-xs text-gray-500">{item.subcategory}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            +{formatCurrency(item.amount)}원
                          </p>
                          <p className="text-xs text-gray-400">{item.count}건</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${(item.amount / report.totals.income) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-gray-500">수입 내역이 없습니다</p>
                )}
              </div>
            </div>

            {/* Expense */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">지출 내역</h2>
                <span className="text-red-600 font-medium">
                  {formatCurrency(report.totals.expense)}원
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {report.expenseByCategory.length > 0 ? (
                  report.expenseByCategory.map((item, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.category}</p>
                          {item.subcategory && (
                            <p className="text-xs text-gray-500">{item.subcategory}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">
                            -{formatCurrency(item.amount)}원
                          </p>
                          <p className="text-xs text-gray-400">{item.count}건</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${(item.amount / report.totals.expense) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-gray-500">지출 내역이 없습니다</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>안내:</strong> 보고서는 선택한 기간의 수입/지출을 분류별로 집계합니다.
          CSV 다운로드로 엑셀에서 추가 분석이 가능합니다.
        </p>
      </div>
    </div>
  )
}
