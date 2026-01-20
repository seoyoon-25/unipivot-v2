export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: '연혁 | 유니피벗',
  description: '유니피벗이 걸어온 여정. 2015년 남북한걸음으로 시작하여 현재까지의 발자취를 소개합니다.',
}

// 기본 콘텐츠 (DB에 없을 경우 사용)
const defaultContent = {
  images: {
    background: 'https://cdn.imweb.me/thumbnail/20230722/7444706724935.jpg',
  },
  hero: {
    title: '유니피벗이 걸어온 여정',
    subtitle: '남북청년이 함께 만들어가는 새로운 한반도',
  },
  timeline: {
    items: [
      { year: '2015', title: '남북한걸음 시작', description: '남북 청년들의 첫 만남의 장을 열다' },
      { year: '2018', title: 'K-MOVE 시작', description: '해외 취업 지원 프로그램 런칭' },
      { year: '2023', title: '유니피벗으로 명칭 변경', description: 'UNITE + PIVOT의 의미를 담아 새롭게 출발' },
      { year: '2024', title: '비영리민간단체 등록', description: '통일부 산하 비영리민간단체로 공식 등록' },
    ],
  },
}

async function getPageContent() {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'page.history' },
    })
    if (section?.content) {
      return { ...defaultContent, ...JSON.parse(section.content) as typeof defaultContent }
    }
  } catch (error) {
    console.error('Failed to load history content:', error)
  }
  return defaultContent
}

export default async function HistoryPage() {
  const content = await getPageContent()

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.images.background})` }}
        />
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {content.hero.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-0">
            {content.timeline.items.map((item: { year: string; title: string; description: string }, index: number) => (
              <div
                key={item.year}
                className="relative flex items-start gap-8 group"
              >
                {/* Year */}
                <div className="flex-shrink-0 w-24 text-right pt-1">
                  <span className="text-3xl font-bold text-primary">{item.year}</span>
                </div>

                {/* Timeline dot and line */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full mt-2 z-10" />
                  {index !== content.timeline.items.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/20 min-h-[80px]" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-12 pt-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
