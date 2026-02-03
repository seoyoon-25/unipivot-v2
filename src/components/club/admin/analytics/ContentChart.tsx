'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  topBooks: { title: string; count: number }[]
  totalReports: number
  newReports: number
  totalQuotes: number
  newQuotes: number
  avgRating: number | null
}

export default function ContentChart({
  topBooks,
  totalReports,
  newReports,
  totalQuotes,
  newQuotes,
  avgRating,
}: Props) {
  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">전체 독후감</p>
          <p className="text-2xl font-bold text-gray-900">{totalReports.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">+{newReports} (기간 내)</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">전체 명문장</p>
          <p className="text-2xl font-bold text-gray-900">{totalQuotes.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">+{newQuotes} (기간 내)</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">평균 평점</p>
          <p className="text-2xl font-bold text-gray-900">
            {avgRating !== null ? avgRating : '-'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">인기 도서 수</p>
          <p className="text-2xl font-bold text-gray-900">{topBooks.length}</p>
        </div>
      </div>

      {/* 인기 도서 차트 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">인기 도서 TOP 10</h3>
        {topBooks.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            데이터가 없습니다.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBooks}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: 11 }}
                  width={110}
                  tickFormatter={(v: string) => (v.length > 15 ? v.slice(0, 15) + '…' : v)}
                />
                <Tooltip />
                <Bar dataKey="count" name="독후감 수" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
