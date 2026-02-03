import { Users, FileText, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface StatItem {
  current: number
  previous: number
  change: number
}

interface Props {
  data: {
    newUsers: StatItem
    reports: StatItem
    attendances: StatItem
    activeUsers: number
  }
}

export default function OverviewCards({ data }: Props) {
  const cards = [
    { title: '신규 사용자', value: data.newUsers.current, change: data.newUsers.change, icon: Users, color: 'blue' as const },
    { title: '독후감', value: data.reports.current, change: data.reports.change, icon: FileText, color: 'green' as const },
    { title: '출석', value: data.attendances.current, change: data.attendances.change, icon: CheckCircle, color: 'amber' as const },
    { title: '활성 사용자', value: data.activeUsers, change: null as number | null, icon: Users, color: 'purple' as const },
  ]

  const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositive = card.change !== null && card.change >= 0

        return (
          <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${colorStyles[card.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              {card.change !== null && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(card.change)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{card.title}</p>
          </div>
        )
      })}
    </div>
  )
}
