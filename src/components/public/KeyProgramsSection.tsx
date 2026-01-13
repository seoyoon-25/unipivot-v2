import Link from 'next/link'
import { BookOpen, Mic, MapPin, MessageSquare } from 'lucide-react'

const programs = [
  {
    title: '남Book북한걸음',
    description: '책을 통해 남북을 이해하는 독서모임. 매 시즌 8주간 진행되며, 남북 청년들이 함께 책을 읽고 토론합니다.',
    href: '/programs?type=BOOKCLUB',
    badge: '격주 1회 총 8회',
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: '강연 및 세미나',
    description: '분단과 통일, 한반도 평화에 대한 다양한 주제의 전문가 강연과 토론을 진행합니다.',
    href: '/programs?type=SEMINAR',
    badge: '월 1회',
    icon: Mic,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    title: 'K-Move',
    description: '한반도 관련 역사적 장소를 탐방하며 현장에서 배우는 체험 프로그램입니다.',
    href: '/programs?type=KMOVE',
    badge: '분기 1회',
    icon: MapPin,
    gradient: 'from-orange-500 to-red-600',
  },
  {
    title: '토론회',
    description: '남북한 관련 주제에 대해 다양한 관점으로 토론하며 생각을 나누는 프로그램입니다.',
    href: '/programs?type=DEBATE',
    badge: '월 1회',
    icon: MessageSquare,
    gradient: 'from-green-500 to-teal-600',
  },
]

export function KeyProgramsSection() {
  return (
    <section id="programs" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Programs</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            핵심 프로그램
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            남북청년이 함께 성장하고 소통하는 다양한 프로그램을 운영합니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => {
            const Icon = program.icon
            return (
              <Link
                key={program.href}
                href={program.href}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${program.gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-20 h-20 text-white/30" strokeWidth={1} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {program.badge && (
                    <span className="absolute bottom-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                      {program.badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                    {program.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {program.description}
                  </p>
                  <span className="text-primary font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    자세히 보기
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
