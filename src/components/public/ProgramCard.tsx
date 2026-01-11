import Link from 'next/link'
import Image from 'next/image'

interface ProgramCardProps {
  title: string
  description: string
  image: string
  href: string
  badge?: string
}

export function ProgramCard({ title, description, image, href, badge }: ProgramCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {badge && (
          <span className="absolute bottom-4 left-4 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3">
          {title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        <Link
          href={href}
          className="text-primary font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
        >
          자세히 보기
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
