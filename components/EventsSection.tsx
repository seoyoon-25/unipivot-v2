'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Program {
  id: string
  title: string
  slug: string
  type: string
  description: string | null
  image: string | null
  status: string
  startDate: Date | null
  endDate: Date | null
  location: string | null
  isOnline: boolean
  feeType: string
  _count: {
    applications: number
    likes: number
  }
}

interface EventsSectionProps {
  programs: Program[]
}

const STATUS_LABELS: Record<string, string> = {
  RECRUITING: '모집중',
  ONGOING: '진행중',
  COMPLETED: '완료',
}

function formatDate(date: Date | null) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

export default function EventsSection({ programs }: EventsSectionProps) {
  if (programs.length === 0) {
    return (
      <section className="mt-16">
        <h2>프로그램 & 이벤트</h2>
        <p className="mt-6 text-neutral-500">현재 진행 중인 프로그램이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between">
        <h2>프로그램 & 이벤트</h2>
        <Link href="/programs" className="text-sm text-primary hover:underline">
          전체보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {programs.slice(0, 6).map((program) => (
          <Link
            key={program.id}
            href={`/programs/${program.slug}`}
            className="group bg-white rounded-card shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-video bg-neutral-100">
              {program.image ? (
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                  No Image
                </div>
              )}
              {/* Status Badge */}
              <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
                {STATUS_LABELS[program.status] || program.status}
              </span>
              {/* Free Badge */}
              {program.feeType === 'FREE' && (
                <span className="absolute top-3 right-3 bg-success text-white text-xs px-2 py-1 rounded-full">
                  무료
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-xs text-neutral-500">
                {program.isOnline ? '온라인' : program.location || '오프라인'}
                {program.startDate && ` · ${formatDate(program.startDate)}`}
                {program.endDate && ` ~ ${formatDate(program.endDate)}`}
              </p>
              <h3 className="mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                {program.title}
              </h3>
              {program.description && (
                <p className="text-sm text-neutral-500 mt-2 line-clamp-2">
                  {program.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                <span>참가 {program._count.applications}명</span>
                <span>관심 {program._count.likes}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
