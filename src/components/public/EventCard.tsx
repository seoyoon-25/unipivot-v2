import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EventCardProps {
  title: string
  description: string
  date: string
  season?: number
  type: 'online' | 'offline' | 'hybrid'
  href: string
}

export function EventCard({ title, description, date, season, type, href }: EventCardProps) {
  const typeStyles = {
    online: 'bg-blue-100 text-blue-600',
    offline: 'bg-green-100 text-green-600',
    hybrid: 'bg-purple-100 text-purple-600',
  }

  const typeLabels = {
    online: '온라인',
    offline: '오프라인',
    hybrid: '하이브리드',
  }

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-100 hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-primary-light rounded-xl flex flex-col items-center justify-center flex-shrink-0">
          {season ? (
            <>
              <span className="text-primary font-bold text-lg leading-none">{season}</span>
              <span className="text-primary/70 text-xs">시즌</span>
            </>
          ) : (
            <>
              <span className="text-primary font-bold text-lg leading-none">{date.split('.')[1]}</span>
              <span className="text-primary/70 text-xs">{date.split('.')[0]}월</span>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn('px-2 py-0.5 text-xs font-medium rounded mb-2 inline-block', typeStyles[type])}>
            {typeLabels[type]}
          </span>
          <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
