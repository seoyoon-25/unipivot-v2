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
import { ArrowRight, BookOpen, Users, Calendar, Sparkles, ChevronRight } from 'lucide-react'

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
    <div className="relative">
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION - Premium Design
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background with mesh gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, #4f46e5 0%, #6366f1 25%, #7c3aed 50%, #6366f1 75%, #4f46e5 100%)
            `,
          }}
        />

        {/* Mesh overlay for depth */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(129, 140, 248, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(167, 139, 250, 0.4) 0%, transparent 45%),
              radial-gradient(ellipse at 60% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 10% 90%, rgba(124, 58, 237, 0.3) 0%, transparent 40%)
            `,
          }}
        />

        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-white/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-[15%] w-48 h-48 rounded-full bg-purple-300/10 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-400/5 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 lg:px-8 pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-medium text-white/90">2024 Reading Community</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              책으로 연결되는
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent">
                우리의 이야기
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-indigo-100 leading-relaxed mb-10 max-w-lg">
              함께 읽고, 나누고, 성장하는 유니클럽에서
              <br className="hidden sm:block" />
              새로운 독서 경험을 시작하세요.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/programs"
                className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-white text-indigo-700 text-base font-semibold shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:shadow-indigo-900/30 hover:-translate-y-1 transition-all duration-300"
              >
                프로그램 보기
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/club"
                className="inline-flex items-center h-14 px-8 rounded-2xl border-2 border-white/30 text-white text-base font-medium backdrop-blur-sm hover:bg-white/10 hover:border-white/50 hover:-translate-y-1 transition-all duration-300"
              >
                마이클럽
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6 md:gap-12 mt-16 pt-8 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">100+</p>
                <p className="text-sm text-indigo-200">읽은 도서</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm text-indigo-200">클럽 멤버</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">10년</p>
                <p className="text-sm text-indigo-200">활동 연차</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom curve transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 md:h-20"
            preserveAspectRatio="none"
          >
            <path
              d="M0 80V60C240 20 480 0 720 0C960 0 1200 20 1440 60V80H0Z"
              className="fill-stone-50"
            />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          QUICK MENU SECTION
          ══════════════════════════════════════════════════════════════ */}
      <QuickMenuGrid />

      {/* ══════════════════════════════════════════════════════════════
          RECOMMENDED BOOKS SECTION
          ══════════════════════════════════════════════════════════════ */}
      <RecommendedBooksSection books={books} />

      {/* ══════════════════════════════════════════════════════════════
          BOOK CLUB SCHEDULE SECTION
          ══════════════════════════════════════════════════════════════ */}
      <BookClubScheduleSection sessions={sessions} />

      {/* ══════════════════════════════════════════════════════════════
          EVENTS & PROGRAMS SECTION
          ══════════════════════════════════════════════════════════════ */}
      <EventSliderSection programs={programs} />

      {/* ══════════════════════════════════════════════════════════════
          CTA SECTION - Premium Design
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-white to-stone-50" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-purple-100/50 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 lg:px-8">
          {/* Card container */}
          <div
            className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
              boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.4)',
            }}
          >
            {/* Inner decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-300/10 blur-2xl" />

            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-white/90">Join Our Community</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                유니클럽과 함께 성장하세요
              </h2>
              <p className="text-base md:text-lg text-indigo-100 mb-10 max-w-md mx-auto leading-relaxed">
                지금 가입하고 다양한 독서 프로그램에 참여해 보세요.
                <br className="hidden md:block" />
                새로운 인사이트가 기다립니다.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/programs"
                  className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-white text-indigo-700 text-base font-semibold shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  프로그램 둘러보기
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/p/about-us"
                  className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  더 알아보기
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
