export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Gift } from 'lucide-react'
import Link from 'next/link'
import DonateForm from './DonateForm'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: '후원하기',
  description: '유니피벗과 함께 한반도 평화를 만들어가세요',
}

// Default content in case DB is empty
const defaultContent = {
  hero: {
    badge: 'Donate',
    title: '후원하기',
    subtitle: '여러분의 후원이 남북청년의 만남을 가능하게 합니다',
  },
  monthly: {
    title: '정기 후원',
    description: '매월 정기적인 후원으로 유니피벗의 안정적인 운영을 도와주세요',
    buttonText: '정기 후원 문의하기',
    buttonLink: '/contact',
  },
  taxInfo: {
    title: '세액공제 안내',
    description: '사단법인 유니피벗에 대한 후원금은 소득세법에 따라 연말정산 시 세액공제 혜택을 받으실 수 있습니다.',
    contactLabel: '기부금 영수증 문의',
    contactEmail: 'unipivot@unipivot.org',
  },
}

async function getPageContent() {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'page.donate' },
    })
    if (section?.content && typeof section.content === 'string') {
      return JSON.parse(section.content) as typeof defaultContent
    }
  } catch (error) {
    console.error('Failed to load donate page content:', error)
  }
  return defaultContent
}

export default async function DonatePage() {
  const content = await getPageContent()

  return (
    <>
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

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <DonateForm />

          {/* Monthly Donation */}
          <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white text-center">
            <Gift className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{content.monthly.title}</h2>
            <p className="text-white/80 mb-6">
              {content.monthly.description}
            </p>
            <Link
              href={content.monthly.buttonLink}
              className="inline-block px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              {content.monthly.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* Tax Deduction Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.taxInfo.title}</h2>
          <p className="text-gray-600 mb-6">
            {content.taxInfo.description}
          </p>
          <div className="inline-flex items-center gap-4 bg-white rounded-xl px-6 py-4 border border-gray-200">
            <div className="text-left">
              <p className="text-sm text-gray-500">{content.taxInfo.contactLabel}</p>
              <p className="font-bold text-gray-900">{content.taxInfo.contactEmail}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
