export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Suspense } from 'react'
import { BookOpen, MessageSquare, Trophy } from 'lucide-react'
import { HeroSection } from '@/components/public/HeroSection'
import { MeaningSection } from '@/components/public/MeaningSection'
import { DonationBanner } from '@/components/public/DonationBanner'
import { KeyProgramsSection } from '@/components/public/KeyProgramsSection'
import { StorySection } from '@/components/public/StorySection'
import { RecentProgramsSection } from '@/components/public/RecentProgramsSection'
import { InstagramFeed } from '@/components/public/InstagramFeed'
import { ResearchLabSection } from '@/components/public/ResearchLabSection'
import { BulletinBoard } from '@/components/bulletin-board'
import { getHomePageData } from '@/lib/actions/public'

export default async function HomePage() {
  let homeData: {
    programs: any[]
    notices: any[]
    stats: {
      members: number
      completedPrograms: number
      totalParticipations: number
      totalBooks: number
    }
  } = {
    programs: [],
    notices: [],
    stats: {
      members: 0,
      completedPrograms: 0,
      totalParticipations: 0,
      totalBooks: 0
    }
  }

  try {
    homeData = await getHomePageData()
  } catch (error) {
    console.error('Failed to load home page data:', error)
    // 기본값으로 계속 진행
  }

  const { programs, notices, stats } = homeData

  return (
    <>
      <HeroSection stats={stats} />

      {/* 유니클럽 섹션 */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50 min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-[#FF6B35] text-sm font-semibold tracking-wider uppercase">UniClub</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
            유니클럽 - 함께 읽고 나누는 독서 커뮤니티
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            독후감 공유, 독서 챌린지, AI 책추천까지
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">독서모임</h3>
              <p className="text-sm text-gray-500">함께 책을 읽고 소감을 나눠요</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">커뮤니티</h3>
              <p className="text-sm text-gray-500">멤버들과 자유롭게 소통해요</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">챌린지</h3>
              <p className="text-sm text-gray-500">독서 챌린지로 습관을 만들어요</p>
            </div>
          </div>
          <Link
            href="/club"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF6B35] text-white rounded-xl font-semibold hover:bg-[#E55A2B] transition-colors shadow-lg shadow-orange-200"
          >
            유니클럽 참여하기
          </Link>
        </div>
      </section>

      <MeaningSection />
      <Suspense fallback={
        <section className="py-16 min-h-[600px]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="h-8 bg-amber-100 rounded-full w-32 mx-auto mb-4 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-3 animate-pulse" />
              <div className="h-5 bg-gray-100 rounded w-96 mx-auto animate-pulse" />
            </div>
            <div className="cork-board-light p-6 md:p-8 min-h-[400px] animate-pulse" />
          </div>
        </section>
      }>
        <BulletinBoard />
      </Suspense>
      <DonationBanner />
      <Suspense fallback={
        <section className="py-24 bg-gray-50 min-h-[600px]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse" />
              <div className="h-5 bg-gray-100 rounded w-80 mx-auto animate-pulse" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }>
        <KeyProgramsSection />
      </Suspense>
      <ResearchLabSection />
      <StorySection />
      <RecentProgramsSection programs={programs} />
      <Suspense fallback={
        <section className="py-24 bg-white min-h-[400px]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse" />
              <div className="h-5 bg-gray-100 rounded w-64 mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      }>
        <InstagramFeed />
      </Suspense>
    </>
  )
}
