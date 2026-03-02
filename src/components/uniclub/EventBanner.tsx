import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Wifi, ArrowRight, Heart, Users } from 'lucide-react'

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

const STATUS_MAP: Record<string, { label: string; gradient: string }> = {
  RECRUITING: { label: '모집중', gradient: 'from-emerald-500 to-emerald-600' },
  ONGOING: { label: '진행중', gradient: 'from-indigo-500 to-indigo-600' },
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
  const statusInfo = STATUS_MAP[status] ?? { label: status, gradient: 'from-stone-500 to-stone-600' }

  return (
    <Link
      href={`/programs/${slug}`}
      className="group block w-full rounded-3xl overflow-hidden bg-white shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 hover:-translate-y-2"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-stone-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-100 flex items-center justify-center">
            <span className="text-indigo-300 text-sm font-medium">No Image</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <span className={`absolute top-5 left-5 bg-gradient-to-r ${statusInfo.gradient} text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg`}>
          {statusInfo.label}
        </span>

        {/* Free Badge */}
        {feeType === 'FREE' && (
          <span className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm text-indigo-600 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
            무료
          </span>
        )}

        {/* Bottom info on image */}
        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="text-white text-xl md:text-2xl font-bold line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
          <p className="text-white/80 text-sm mt-2 font-medium">
            {formatDateRange(startDate, endDate)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {description && (
          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">{description}</p>
        )}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-4 text-sm text-stone-500">
            {location && !isOnline && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400" />
                {location}
              </span>
            )}
            {isOnline && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Wifi className="w-4 h-4" />
                온라인
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-stone-400" />
              {applicationCount}명
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              {likeCount}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            자세히
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
