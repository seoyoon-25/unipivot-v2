export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, Target, Heart, Calendar, LucideIcon } from 'lucide-react'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: '소개',
  description: '유니피벗은 남북청년이 함께 새로운 한반도를 만들어가는 비영리 단체입니다.',
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Users,
  Target,
  Heart,
}

// Default content in case DB is empty
const defaultContent = {
  hero: {
    badge: 'About Us',
    title: '유니피벗 소개',
    subtitle: '남북청년이 함께 새로운 한반도를 만들어갑니다',
  },
  stats: [
    { label: '창립연도', value: '2019', icon: 'Calendar' },
    { label: '참여 청년', value: '500+', icon: 'Users' },
    { label: '프로그램', value: '50+', icon: 'Target' },
    { label: '후원자', value: '100+', icon: 'Heart' },
  ],
  mission: {
    badge: 'Our Mission',
    title: '우리의 미션',
    paragraphs: [
      '유니피벗은 <strong>남북 청년들의 만남과 대화</strong>를 통해 한반도의 평화로운 미래를 준비하는 비영리 단체입니다.',
      '우리는 분단으로 인해 서로를 모르고 자란 남북의 청년들이 함께 책을 읽고, 토론하고, 교류하며 <strong>서로를 이해</strong>할 수 있는 공간을 만듭니다.',
      '언젠가 다가올 통일의 날, 우리는 이미 준비되어 있을 것입니다.',
    ],
    logoText: 'UNITE + PIVOT',
    logoSubtext: '하나됨 + 전환',
  },
  values: {
    badge: 'Our Values',
    title: '핵심 가치',
    items: [
      { title: '연결', description: '분단의 경계를 넘어 남북 청년이 하나로 연결됩니다.', icon: '🤝' },
      { title: '성장', description: '함께 배우고 토론하며 서로의 시각을 넓혀갑니다.', icon: '🌱' },
      { title: '변화', description: '작은 만남이 모여 한반도의 미래를 바꿉니다.', icon: '✨' },
    ],
  },
  cta: {
    title: '함께 만들어가는 한반도',
    subtitle: '유니피벗과 함께 새로운 한반도의 미래를 준비하세요',
    primaryButton: { text: '회원가입', link: '/register' },
    secondaryButton: { text: '후원하기', link: '/donate' },
  },
}

async function getPageContent() {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'page.about' },
    })
    if (section?.content) {
      return section.content as typeof defaultContent
    }
  } catch (error) {
    console.error('Failed to load about page content:', error)
  }
  return defaultContent
}

export default async function AboutPage() {
  const content = await getPageContent()

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            {content.hero.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            {content.hero.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {content.stats.map((stat) => {
                const Icon = iconMap[stat.icon] || Calendar
                return (
                  <div key={stat.label} className="text-center">
                    <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                {content.mission.badge}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                {content.mission.title}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {content.mission.paragraphs.map((paragraph, index) => (
                  <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-12 text-center">
              <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-4xl">U</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{content.mission.logoText}</p>
              <p className="text-gray-600">{content.mission.logoSubtext}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              {content.values.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              {content.values.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {content.values.items.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {content.cta.title}
          </h2>
          <p className="text-xl text-white/80 mb-8">
            {content.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={content.cta.primaryButton.link}
              className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              {content.cta.primaryButton.text}
            </Link>
            <Link
              href={content.cta.secondaryButton.link}
              className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              {content.cta.secondaryButton.text}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
