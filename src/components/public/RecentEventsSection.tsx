import Link from 'next/link'
import { EventCard } from './EventCard'

const events = [
  {
    title: '철학 독서모임 15기',
    description: '니체의 철학으로 보는 남북관계와 인간 본성에 대한 탐구',
    date: '01.15',
    season: 15,
    type: 'online' as const,
    href: '/bookclub/15',
  },
  {
    title: '2024 신년 세미나',
    description: '새해를 맞이하여 한반도 평화의 전망을 논의합니다',
    date: '01.20',
    type: 'hybrid' as const,
    href: '/seminar/new-year-2024',
  },
  {
    title: 'DMZ 평화 탐방',
    description: 'K-Move 프로그램으로 DMZ 일대를 탐방합니다',
    date: '02.03',
    type: 'offline' as const,
    href: '/kmove/dmz-peace',
  },
  {
    title: '청년 통일 포럼',
    description: 'MZ세대가 바라보는 통일과 평화에 대한 대담',
    date: '02.15',
    type: 'online' as const,
    href: '/seminar/youth-forum',
  },
  {
    title: '북한 문학 읽기',
    description: '북한 작가들의 작품을 통해 북한 사회를 이해합니다',
    date: '02.22',
    season: 16,
    type: 'online' as const,
    href: '/bookclub/16',
  },
  {
    title: '강원 평화 루트',
    description: '강원도 일대의 분단 역사 현장을 탐방합니다',
    date: '03.09',
    type: 'offline' as const,
    href: '/kmove/gangwon',
  },
]

export function RecentEventsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Recent Events</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              최근 활동
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
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
