export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/db'
import { CooperationSection } from '@/components/cooperation/CooperationSection'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Settings } from 'lucide-react'

export const metadata = {
  title: '협조요청 | 유니피벗',
  description: '자문, 강사, 설문·인터뷰 요청',
}

export const revalidate = 60 // 1분마다 재검증

async function getSections() {
  const sections = await prisma.cooperationSection.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return sections
}

export default async function CooperationPage() {
  const [sections, session] = await Promise.all([
    getSections(),
    getServerSession(authOptions)
  ])
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">협조요청</h1>
          <p className="text-xl text-white/80">
            유니피벗과 함께하는 다양한 협력 방법을 안내합니다
          </p>
          {/* 관리자 전용 섹션 관리 버튼 */}
          {isAdmin && (
            <Link
              href="/admin/cooperation/sections"
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-primary rounded-xl font-medium transition-colors shadow-lg"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">섹션 관리</span>
            </Link>
          )}
        </div>
      </section>

      {/* Cooperation Sections */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {sections.length > 0 ? (
            <div className="space-y-16">
              {sections.map((section, index) => (
                <CooperationSection
                  key={section.id}
                  title={section.title}
                  content={section.content}
                  image={section.image}
                  imageAlt={section.imageAlt}
                  buttonText={section.buttonText}
                  buttonLink={section.buttonLink}
                  reverse={index % 2 === 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              협조요청 섹션이 준비 중입니다.
            </div>
          )}
        </div>
      </section>

      {/* Research Lab CTA */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            전문가를 직접 찾고 계신가요?
          </h2>
          <p className="text-gray-600 mb-6">
            유니피벗 리서치랩에서 전문가/강사 풀을 확인하고 직접 섭외하세요
          </p>
          <a
            href={`https://${process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-semibold transition-colors"
          >
            리서치랩 바로가기
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </section>
    </main>
  )
}
