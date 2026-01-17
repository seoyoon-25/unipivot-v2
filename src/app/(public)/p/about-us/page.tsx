export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: '단체 소개 | 유니피벗',
  description: '유니피벗은 남북청년이 수평적으로 만나 성장하고 협력하여 더 나은 나, 공동체, 대한민국을 만들어가는 비영리 단체입니다.',
}

// 기본 콘텐츠 (DB에 없을 경우 사용)
const defaultContent = {
  images: {
    about: [
      'https://cdn.imweb.me/thumbnail/20230611/9837611e1ecc4.jpg',
      'https://cdn.imweb.me/thumbnail/20230611/ff3fae27e81d6.jpg',
      'https://cdn.imweb.me/thumbnail/20230611/38424c39d1b97.jpg',
    ],
    vision: 'https://cdn.imweb.me/thumbnail/20230722/8e44d28325321.png',
  },
  about: {
    title: '유니피벗은 어떤 곳인가요?',
    paragraphs: [
      '유니피벗은 남북청년이 수평적으로 만나 성장하고 협력하여 더 나은 나, 공동체, 대한민국을 만들어 가기 위해 2015년 남북한걸음으로 시작되었습니다.',
      '남북청년 뿐만 아니라 유니피벗이 추구하는 방향에 대해 공감하는 사람이라면 인종, 성별, 나이, 국적, 종교, 성적지향과 무관하게 모두와 함께합니다.',
      '유니피벗은 비정치적, 비종교적이며 우리 사회의 다양한 구성원들과 연대하여 분단체제를 해체하고 분단으로 인해 생긴 상처를 치유하고 회복하여 남북이 함께 살기 좋은 새로운 한반도를 만들어가고자 합니다.',
      '새로운 한반도는 분단된 한반도가 아닌 회복과 통합의 한반도로서 남북청년이 함께 만들어나가야 하며 이를 위해 남북청년이 함께 성장하고 소통하며 새로운 한반도의 리더로 자리매김하고자 합니다.',
      '남북청년의 성장을 위해 인문, 사회, 경제, 역사 과학, 철학, 환경, 젠더 등 다양한 주제로 독서모임과 강연프로그램을 꾸준히 운영하고 있습니다. 이와 더불어 남북청년의 교류를 위해 등산, 클라이밍, 볼링, 스키, 캠핑 등 다양한 스포츠 모임과, 전시회관람, 영화관람 등 문화활동을 병행하고 있습니다.',
      '앞으로 활동의 범위에 제한하지 않고 유니피벗의 비전과 일치하는 활동을 계획하는 회원들을 지원하여 더 많은 사람들이 한반도 분단 체제를 해체하는 활동에 참여할 수 있도록 지원하고자 합니다.',
    ],
  },
  vision: {
    title: '유니피벗이 추구하는 가치',
  },
}

async function getPageContent() {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'page.about-us' },
    })
    if (section?.content) {
      return { ...defaultContent, ...section.content as typeof defaultContent }
    }
  } catch (error) {
    console.error('Failed to load about-us content:', error)
  }
  return defaultContent
}

export default async function AboutUsPage() {
  const content = await getPageContent()

  return (
    <>
      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Text Content */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                {content.about.title}
              </h1>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                {content.about.paragraphs.map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden col-span-1">
                <Image
                  src={content.images.about[0]}
                  alt="유니피벗 활동 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={content.images.about[1]}
                    alt="유니피벗 활동 2"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={content.images.about[2]}
                    alt="유니피벗 활동 3"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {content.vision.title}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={content.images.vision}
                alt="유니피벗 비전"
                fill
                className="object-contain bg-white"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
