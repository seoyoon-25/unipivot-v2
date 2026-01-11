import Link from 'next/link'
import { Calendar, Users, MapPin, Monitor } from 'lucide-react'

interface Program {
  id: string
  title: string
  type: string
  description: string | null
  capacity: number
  location: string | null
  isOnline: boolean
  status: string
  startDate: Date | null
  _count: { registrations: number }
}

interface Props {
  programs: Program[]
}

function getTypeLabel(type: string) {
  const types: Record<string, string> = {
    'BOOKCLUB': '독서모임',
    'SEMINAR': '세미나',
    'WORKSHOP': '워크샵',
    'KMOVE': 'K-Move',
    'OTHER': '기타'
  }
  return types[type] || type
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN': return '모집중'
    case 'CLOSED': return '진행중'
    case 'COMPLETED': return '완료'
    default: return status
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'OPEN': return 'bg-green-100 text-green-600'
    case 'CLOSED': return 'bg-blue-100 text-blue-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function RecentProgramsSection({ programs }: Props) {
  if (programs.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Recent Programs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              진행중인 프로그램
            </h2>
          </div>
          <Link
            href="/notice"
            className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            전체 보기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 bg-primary-light text-primary text-xs font-medium rounded">
                  {getTypeLabel(program.type)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(program.status)}`}>
                  {getStatusLabel(program.status)}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{program.title}</h3>

              {program.description && (
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{program.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-500">
                {program.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(program.startDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {program.isOnline ? (
                    <>
                      <Monitor className="w-4 h-4" />
                      <span>온라인</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>{program.location || '오프라인'}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{program._count.registrations}/{program.capacity}명</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/notice"
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            전체 보기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
