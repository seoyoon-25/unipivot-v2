import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CheckCircle, BookOpen, Quote } from 'lucide-react'

interface TimelineItemData {
  id: string
  type: 'attendance' | 'report' | 'quote'
  title: string
  description?: string
  link?: string
  createdAt: string
}

interface Props {
  item: TimelineItemData
}

const typeConfig = {
  attendance: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-600',
    dotColor: 'bg-green-500',
  },
  report: {
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    dotColor: 'bg-blue-500',
  },
  quote: {
    icon: Quote,
    color: 'bg-purple-100 text-purple-600',
    dotColor: 'bg-purple-500',
  },
}

export default function TimelineItemComponent({ item }: Props) {
  const config = typeConfig[item.type]
  const Icon = config.icon

  const content = (
    <div className="relative">
      <div
        className={`absolute -left-[41px] w-4 h-4 rounded-full ${config.dotColor} border-4 border-white`}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
        <p className="text-sm text-gray-500 mb-2">
          {format(new Date(item.createdAt), 'M월 d일 (EEE)', { locale: ko })}
        </p>

        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{item.title}</p>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (item.link) {
    return <Link href={item.link}>{content}</Link>
  }

  return content
}
