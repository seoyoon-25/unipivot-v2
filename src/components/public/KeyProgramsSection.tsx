import { ProgramCard } from './ProgramCard'

const programs = [
  {
    title: '남Book북한걸음',
    description: '책을 통해 남북을 이해하는 독서모임. 매 시즌 8주간 진행되며, 남북 청년들이 함께 책을 읽고 토론합니다.',
    image: '/images/programs/bookclub.jpg',
    href: '/bookclub',
    badge: '격주 1회 총 8회',
  },
  {
    title: '정기 세미나',
    description: '분단과 통일, 한반도 평화에 대한 다양한 주제의 전문가 강연과 토론을 진행합니다.',
    image: '/images/programs/seminar.jpg',
    href: '/seminar',
    badge: '월 1회',
  },
  {
    title: 'K-Move',
    description: '한반도 관련 역사적 장소를 탐방하며 현장에서 배우는 체험 프로그램입니다.',
    image: '/images/programs/kmove.jpg',
    href: '/kmove',
    badge: '분기 1회',
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <ProgramCard key={program.href} {...program} />
          ))}
        </div>
      </div>
    </section>
  )
}
