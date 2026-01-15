export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, Target, Heart, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: '소개',
  description: '유니피벗은 남북청년이 함께 새로운 한반도를 만들어가는 비영리 단체입니다.',
}

const stats = [
  { label: '창립연도', value: '2019', icon: Calendar },
  { label: '참여 청년', value: '500+', icon: Users },
  { label: '프로그램', value: '50+', icon: Target },
  { label: '후원자', value: '100+', icon: Heart },
]

const values = [
  {
    title: '연결',
    description: '분단의 경계를 넘어 남북 청년이 하나로 연결됩니다.',
    icon: '🤝',
  },
  {
    title: '성장',
    description: '함께 배우고 토론하며 서로의 시각을 넓혀갑니다.',
    icon: '🌱',
  },
  {
    title: '변화',
    description: '작은 만남이 모여 한반도의 미래를 바꿉니다.',
    icon: '✨',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">About Us</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            유니피벗 소개
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            남북청년이 함께 새로운 한반도를 만들어갑니다
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                우리의 미션
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  유니피벗은 <strong className="text-gray-900">남북 청년들의 만남과 대화</strong>를 통해
                  한반도의 평화로운 미래를 준비하는 비영리 단체입니다.
                </p>
                <p>
                  우리는 분단으로 인해 서로를 모르고 자란 남북의 청년들이
                  함께 책을 읽고, 토론하고, 교류하며
                  <strong className="text-gray-900"> 서로를 이해</strong>할 수 있는 공간을 만듭니다.
                </p>
                <p>
                  언젠가 다가올 통일의 날, 우리는 이미 준비되어 있을 것입니다.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-12 text-center">
              <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-4xl">U</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">UNITE + PIVOT</p>
              <p className="text-gray-600">하나됨 + 전환</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              핵심 가치
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
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
