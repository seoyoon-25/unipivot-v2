import { BookOpen, CheckCircle, FileText, Quote } from 'lucide-react'

interface Props {
  stats: {
    programCount: number
    attendanceRate: number
    reportCount: number
    quoteCount: number
  }
}

export default function ProfileStats({ stats }: Props) {
  const items = [
    { label: '참여 프로그램', value: `${stats.programCount}개`, icon: BookOpen, color: 'blue' },
    { label: '출석률', value: `${stats.attendanceRate}%`, icon: CheckCircle, color: 'green' },
    { label: '독후감', value: `${stats.reportCount}개`, icon: FileText, color: 'amber' },
    { label: '명문장', value: `${stats.quoteCount}개`, icon: Quote, color: 'purple' },
  ]

  const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-gray-200 p-4 text-center"
          >
            <div
              className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${colorStyles[item.color]}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-500">{item.label}</p>
          </div>
        )
      })}
    </div>
  )
}
