'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const STATUS_LABELS: Record<string, string> = {
  PRESENT: '출석',
  LATE: '지각',
  ABSENT: '결석',
  EXCUSED: '사유결석',
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: '#10b981',
  LATE: '#f59e0b',
  ABSENT: '#ef4444',
  EXCUSED: '#8b5cf6',
}

interface Props {
  attendanceRate: number
  attendanceBreakdown: { status: string; count: number }[]
  totalSessions: number
  activePrograms: { id: string; title: string; participants: number; sessions: number }[]
}

export default function RetentionChart({
  attendanceRate,
  attendanceBreakdown,
  totalSessions,
  activePrograms,
}: Props) {
  const breakdownData = attendanceBreakdown.map((a) => ({
    name: STATUS_LABELS[a.status] || a.status,
    count: a.count,
    fill: STATUS_COLORS[a.status] || '#94a3b8',
  }))

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">출석률</p>
          <p className="text-3xl font-bold text-green-600">{attendanceRate}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">진행 세션</p>
          <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">진행 중 프로그램</p>
          <p className="text-3xl font-bold text-blue-600">{activePrograms.length}</p>
        </div>
      </div>

      {/* 출석 현황 차트 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">출석 현황</h3>
        {breakdownData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            데이터가 없습니다.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="인원" radius={[4, 4, 0, 0]}>
                  {breakdownData.map((entry, index) => (
                    <Bar key={index} dataKey="count" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 프로그램 현황 */}
      {activePrograms.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">진행 중 프로그램</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">프로그램</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">참가자</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">세션 수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activePrograms.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{p.title}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.participants}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
