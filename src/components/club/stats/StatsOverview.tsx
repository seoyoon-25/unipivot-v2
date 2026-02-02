import { Calendar, TrendingUp, BookOpen } from 'lucide-react'

interface Props {
  data: {
    thisMonthAttendance: number
    attendanceRate: number
    totalBooks: number
  }
}

export default function StatsOverview({ data }: Props) {
  const items = [
    {
      label: '이번 달 출석',
      value: `${data.thisMonthAttendance}회`,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: '평균 출석률',
      value: `${data.attendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: '총 읽은 책',
      value: `${data.totalBooks}권`,
      icon: BookOpen,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-gray-200 p-4 text-center"
          >
            <div
              className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${item.color}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-500">{item.label}</p>
          </div>
        )
      })}
    </div>
  )
}
