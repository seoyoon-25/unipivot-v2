import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Wifi, ArrowRight } from 'lucide-react'

interface EventBannerProps {
  slug: string
  title: string
  description: string | null
  image: string | null
  status: string
  startDate: string | Date | null
  endDate: string | Date | null
  location: string | null
  isOnline: boolean
  feeType: string
  applicationCount: number
  likeCount: number
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  RECRUITING: { label: '모집중', bg: 'bg-emerald-500', text: 'text-white' },
  ONGOING: { label: '진행중', bg: 'bg-blue-600', text: 'text-white' },
}

function formatDateRange(start: string | Date | null, end: string | Date | null) {
  if (!start) return ''
  const s = new Date(start)
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  if (!end) return fmt(s)
  return `${fmt(s)} ~ ${fmt(new Date(end))}`
}

export default function EventBanner({
  slug,
  title,
  description,
  image,
  status,
  startDate,
  endDate,
  location,
  isOnline,
  feeType,
  applicationCount,
  likeCount,
}: EventBannerProps) {
  const statusInfo = STATUS_MAP[status] ?? { label: status, bg: 'bg-zinc-500', text: 'text-white' }

  return (
    <Link
      href={`/programs/${slug}`}
      className="group block w-full rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-zinc-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <span className="text-blue-300 text-sm font-medium">No Image</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Status Badge */}
        <span className={`absolute top-4 left-4 ${statusInfo.bg} ${statusInfo.text} text-xs font-semibold px-3 py-1 rounded-full`}>
          {statusInfo.label}
        </span>

        {/* Free Badge */}
        {feeType === 'FREE' && (
          <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
            무료
          </span>
        )}

        {/* Bottom info on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-bold line-clamp-2 drop-shadow-sm">
            {title}
          </h3>
          <p className="text-white/80 text-xs mt-1">
            {formatDateRange(startDate, endDate)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {description && (
          <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">{description}</p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            {location && !isOnline && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {location}
              </span>
            )}
            {isOnline && (
              <span className="flex items-center gap-1 text-emerald-500">
                <Wifi className="w-3.5 h-3.5" />
                온라인
              </span>
            )}
            <span>{applicationCount}명 신청</span>
            <span>♥ {likeCount}</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            자세히
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
