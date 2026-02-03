'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

interface Props {
  roleDistribution: { role: string; count: number }[]
  totalUsers: number
  activeUsers: number
  retentionRate: number
}

const ROLE_LABELS: Record<string, string> = {
  USER: '일반회원',
  ADMIN: '관리자',
  SUPER_ADMIN: '최고관리자',
  FACILITATOR: '운영진',
  STAFF: '스태프',
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function UserActivityChart({
  roleDistribution,
  totalUsers,
  activeUsers,
  retentionRate,
}: Props) {
  const chartData = roleDistribution.map((r) => ({
    name: ROLE_LABELS[r.role] || r.role,
    value: r.count,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 요약 카드 */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">전체 사용자</p>
          <p className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">활성 사용자</p>
          <p className="text-3xl font-bold text-blue-600">{activeUsers.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">리텐션율</p>
          <p className="text-3xl font-bold text-green-600">{retentionRate}%</p>
        </div>
      </div>

      {/* 역할 분포 차트 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">역할 분포</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={(props: PieLabelRenderProps) => {
                  const name = String(props.name || '')
                  const percent = Number(props.percent || 0)
                  return `${name} ${(percent * 100).toFixed(0)}%`
                }}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
