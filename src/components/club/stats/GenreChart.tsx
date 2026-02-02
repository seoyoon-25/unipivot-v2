'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  data: { genre: string; count: number; percentage: number }[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

const genreLabels: Record<string, string> = {
  novel: '소설',
  essay: '에세이',
  selfhelp: '자기계발',
  humanities: '인문학',
  science: '과학',
  history: '역사',
  business: '경제/경영',
  art: '예술',
  other: '기타',
}

export default function GenreChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        데이터가 없습니다.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    name: genreLabels[d.genre] || d.genre,
  }))

  return (
    <div className="flex items-center">
      <ResponsiveContainer width="60%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="count"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="w-40 space-y-2">
        {chartData.map((entry, index) => (
          <div key={entry.genre} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700 truncate">{entry.name}</span>
            <span className="text-sm text-gray-500 ml-auto shrink-0">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
