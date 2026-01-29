export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAboutPageData } from '@/lib/actions/public'

export const metadata: Metadata = {
  title: '소개 | 유니피벗',
  description: '유니피벗은 남북청년이 수평적으로 만나 성장하고 협력하여 더 나은 나, 공동체, 대한민국을 만들어가는 비영리 단체입니다.',
}

// Default content (fallback)
const defaultContent = {
  title: {
    ko: '유니피벗은 어떤 곳인가요?',
    en: 'About UNIPIVOT'
  },
  paragraphs: [
    {
      ko: '유니피벗은 남북청년이 수평적으로 만나 성장하고 협력하여 더 나은 나, 공동체, 대한민국을 만들어 가기 위해 2015년 남북한걸음으로 시작되었습니다.',
      en: 'UNIPIVOT was founded in 2015 as Nambukhangeoleum to create a better self, community, and Korea through horizontal meetings, growth, and cooperation between North and South Korean youth.'
    },
    {
      ko: '남북청년 뿐만 아니라 유니피벗이 추구하는 방향에 대해 공감하는 사람이라면 인종, 성별, 나이, 국적, 종교, 성적지향과 무관하게 모두와 함께합니다.',
      en: 'We welcome everyone who resonates with our vision, regardless of race, gender, age, nationality, religion, or sexual orientation.'
    },
    {
      ko: '유니피벗은 비정치적, 비종교적이며 우리 사회의 다양한 구성원들과 연대하여 분단체제를 해체하고 분단으로 인해 생긴 상처를 치유하고 회복하여 남북이 함께 살기 좋은 새로운 한반도를 만들어가고자 합니다.',
      en: 'UNIPIVOT is non-political and non-religious, working with diverse members of our society to dismantle the division system, heal wounds caused by division, and create a new Korean Peninsula where both Koreas can live together.'
    }
  ],
  images: [
    'https://cdn.imweb.me/thumbnail/20230611/9837611e1ecc4.jpg',
    'https://cdn.imweb.me/thumbnail/20230611/ff3fae27e81d6.jpg',
    'https://cdn.imweb.me/thumbnail/20230611/38424c39d1b97.jpg'
  ]
}

// Legacy images for other sections
const legacyImages = {
  hero: 'https://cdn.imweb.me/thumbnail/20231008/81987a0e28c9f.png',
  history: 'https://cdn.imweb.me/thumbnail/20230722/7444706724935.jpg',
  vision: 'https://cdn.imweb.me/thumbnail/20230722/8e44d28325321.png',
}

// 연혁 데이터
const historyItems = [
  { year: '2015', title: '남북한걸음 시작', description: '남북 청년들의 첫 만남의 장을 열다' },
  { year: '2018', title: 'K-MOVE 시작', description: '해외 취업 지원 프로그램 런칭' },
  { year: '2023', title: '유니피벗으로 명칭 변경', description: 'UNITE + PIVOT의 의미를 담아 새롭게 출발' },
  { year: '2024', title: '비영리민간단체 등록', description: '통일부 산하 비영리민간단체로 공식 등록' },
]

export default async function AboutPage() {
  // Fetch content from DB, fallback to default
  const dbContent = await getAboutPageData()
  const content = dbContent || defaultContent

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${legacyImages.hero})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center py-32">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            About UNIPIVOT
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            남북청년이 함께 새로운 한반도를 만들어갑니다
          </p>
        </div>
      </section>

      {/* About Section - DB Content */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {content.title.ko}
            </h2>
            <p className="text-xl text-gray-500">
              {content.title.en}
            </p>
          </div>

          {/* Paragraphs - Side by Side (Desktop) / Stacked (Mobile) */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Korean Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇰🇷</span>
                <h3 className="text-lg font-semibold text-gray-700">한국어</h3>
              </div>
              {content.paragraphs.map((paragraph, index) => (
                <p key={`ko-${index}`} className="text-gray-600 leading-relaxed text-lg">
                  {paragraph.ko}
                </p>
              ))}
            </div>

            {/* English Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇺🇸</span>
                <h3 className="text-lg font-semibold text-gray-700">English</h3>
              </div>
              {content.paragraphs.map((paragraph, index) => (
                <p key={`en-${index}`} className="text-gray-500 leading-relaxed text-lg">
                  {paragraph.en}
                </p>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="grid md:grid-cols-3 gap-6">
            {content.images.map((image, index) => (
              <div key={index} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={image}
                  alt={`유니피벗 활동 ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${legacyImages.history})` }}
        />
        <div className="absolute inset-0 bg-gray-900/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              History
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
              유니피벗의 발자취
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {historyItems.map((item, index) => (
                <div
                  key={item.year}
                  className="flex items-start gap-8 group"
                >
                  <div className="flex-shrink-0 w-24 text-right">
                    <span className="text-3xl font-bold text-primary">{item.year}</span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 bg-primary rounded-full mt-2" />
                    {index !== historyItems.length - 1 && (
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-primary/30" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              Vision
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              우리의 비전
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={legacyImages.vision}
                alt="유니피벗 비전"
                fill
                className="object-contain bg-gray-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            함께 만들어가는 한반도
          </h2>
          <p className="text-xl text-white/80 mb-8">
            유니피벗과 함께 새로운 한반도의 미래를 준비하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              회원가입
            </Link>
            <Link
              href="/donate"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              후원하기
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
