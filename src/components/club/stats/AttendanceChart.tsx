'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Props {
  data: { month: string; present: number; absent: number; total: number; rate: number }[]
}

export default function AttendanceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        데이터가 없습니다.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    month: d.month.split('-')[1] + '월',
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="present" name="출석" fill="#3B82F6" stackId="a" />
        <Bar dataKey="absent" name="결석" fill="#E5E7EB" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  )
}
