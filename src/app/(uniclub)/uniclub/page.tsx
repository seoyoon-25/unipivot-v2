import { Metadata } from 'next'
import {
  getRecommendedBooks,
  getUpcomingSessions,
  getEventPrograms,
} from '@/lib/actions/uniclub'
import RecommendedBooksSection from '@/components/uniclub/RecommendedBooksSection'
import BookClubScheduleSection from '@/components/uniclub/BookClubScheduleSection'
import EventSliderSection from '@/components/uniclub/EventSliderSection'
import QuickMenuGrid from '@/components/uniclub/QuickMenuGrid'
import Link from 'next/link'
import { ArrowRight, BookOpen, Users, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '유니클럽 | 독서 커뮤니티',
  description:
    '책을 읽고 함께 나누는 독서 커뮤니티, 유니클럽에서 다양한 프로그램과 이벤트를 만나보세요.',
}

export default async function UniClubPage() {
  const [books, sessions, programs] = await Promise.all([
    getRecommendedBooks(),
    getUpcomingSessions(),
    getEventPrograms(),
  ])

  return (
    <div className="bg-zinc-50">
      {/* ──────────── Hero ──────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative max-w-6xl mx-auto px-4 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-200 mb-4">
              Reading Community
            </p>
            <h1 className="text-[32px] md:text-[40px] font-bold leading-[1.2] tracking-tight mb-5">
              책으로 연결되는
              <br />
              우리의 이야기
            </h1>
            <p className="text-base md:text-lg text-blue-100 leading-relaxed mb-10 max-w-md">
              함께 읽고, 나누고, 성장하는 유니클럽에서
              <br className="hidden md:block" />
              새로운 독서 경험을 시작하세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-blue-700 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
              >
                프로그램 보기
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/club"
                className="inline-flex items-center h-12 px-7 rounded-full border border-white/25 text-white text-sm font-medium hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
              >
                마이클럽
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 md:gap-12 mt-14 pt-8 border-t border-white/15">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span className="text-2xl font-bold">100+</span>
              </div>
              <span className="text-xs text-blue-200">읽은 도서</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-300" />
                <span className="text-2xl font-bold">500+</span>
              </div>
              <span className="text-xs text-blue-200">클럽 멤버</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-300" />
                <span className="text-2xl font-bold">10</span>
              </div>
              <span className="text-xs text-blue-200">활동 연차</span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-50 to-transparent" />
      </section>

      {/* ──────────── Quick Menu ──────────── */}
      <QuickMenuGrid />

      {/* ──────────── Recommended Books ──────────── */}
      <RecommendedBooksSection books={books} />

      {/* ──────────── Book Club Schedule ──────────── */}
      <BookClubScheduleSection sessions={sessions} />

      {/* ──────────── Events & Programs ──────────── */}
      <EventSliderSection programs={programs} />

      {/* ──────────── CTA ──────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
            Join Us
          </p>
          <h2 className="text-2xl md:text-[32px] font-bold text-zinc-900 tracking-tight mb-3">
            유니클럽과 함께 성장하세요
          </h2>
          <p className="text-sm md:text-base text-zinc-500 mb-10 max-w-md mx-auto leading-relaxed">
            지금 가입하고 다양한 독서 프로그램에 참여해 보세요.
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            프로그램 둘러보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
