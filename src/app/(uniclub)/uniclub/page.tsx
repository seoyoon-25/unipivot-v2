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
import Image from 'next/image'
import {
  ArrowRight,
  BookOpen,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  Search,
  BookMarked,
  Library,
  Heart,
} from 'lucide-react'

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
    <div className="relative bg-[#faf8f5]">
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION - Literary Sanctuary Theme
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] md:min-h-[85vh] overflow-hidden">
        {/* Warm gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, #0d7377 0%, #14919b 40%, #0d7377 100%)
            `,
          }}
        />

        {/* Warm overlay with texture */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(217, 119, 6, 0.2) 0%, transparent 40%),
              radial-gradient(ellipse at 90% 10%, rgba(255, 255, 255, 0.1) 0%, transparent 30%)
            `,
          }}
        />

        {/* Floating book shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Decorative book silhouettes */}
          <div className="absolute top-[15%] right-[8%] w-20 h-28 bg-white/5 rounded-lg rotate-12 backdrop-blur-sm" />
          <div className="absolute top-[25%] right-[15%] w-16 h-24 bg-amber-400/10 rounded-lg -rotate-6" />
          <div className="absolute bottom-[20%] left-[5%] w-24 h-32 bg-white/5 rounded-lg rotate-6" />
          <div className="absolute top-[60%] right-[5%] w-14 h-20 bg-amber-300/10 rounded-lg -rotate-12" />

          {/* Glowing orbs */}
          <div className="absolute top-20 left-[20%] w-64 h-64 rounded-full bg-amber-400/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-[10%] w-48 h-48 rounded-full bg-teal-300/10 blur-2xl" />
        </div>

        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 lg:px-8 pt-32 pb-28 md:pt-40 md:pb-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <Library className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-white/90">Literary Community</span>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight mb-6">
                책과 함께하는
                <br />
                <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
                  따뜻한 시간
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-teal-100 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                함께 읽고, 나누고, 성장하는 유니클럽.
                <br className="hidden sm:block" />
                당신의 다음 책을 여기서 만나보세요.
              </p>

              {/* Search Bar - Key UX Element */}
              <div className="max-w-md mx-auto lg:mx-0 mb-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:bg-white/30 transition-all duration-300" />
                  <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-teal-900/20 overflow-hidden">
                    <Search className="w-5 h-5 text-stone-400 ml-5" />
                    <input
                      type="text"
                      placeholder="읽고 싶은 책을 검색해보세요"
                      className="flex-1 h-14 px-4 bg-transparent text-stone-700 placeholder:text-stone-400 focus:outline-none"
                    />
                    <Link
                      href="/club/bookclub/bookshelf"
                      className="h-10 px-5 mr-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold flex items-center hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                    >
                      검색
                    </Link>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  href="/programs"
                  className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-amber-400 text-teal-900 text-base font-bold shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 hover:bg-amber-300 transition-all duration-300"
                >
                  프로그램 보기
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/club/bookclub/bookshelf"
                  className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl border-2 border-white/30 text-white text-base font-medium backdrop-blur-sm hover:bg-white/10 hover:border-white/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <BookMarked className="w-5 h-5" />
                  도서 둘러보기
                </Link>
              </div>
            </div>

            {/* Right: Visual Element - Book Stack */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                {/* Floating books visualization */}
                <div className="relative w-80 h-80">
                  {/* Main book */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-60 rounded-lg shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      transform: 'translate(-50%, -50%) rotateY(-15deg) rotateX(5deg)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="absolute inset-2 rounded border-2 border-white/20 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/80" />
                    </div>
                    {/* Book spine */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-700 to-amber-600 rounded-l-lg" />
                  </div>

                  {/* Background books */}
                  <div
                    className="absolute top-[30%] left-[20%] w-36 h-48 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-xl opacity-60"
                    style={{ transform: 'rotateY(-25deg) rotateX(10deg) translateZ(-30px)' }}
                  />
                  <div
                    className="absolute top-[40%] right-[15%] w-32 h-44 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 shadow-xl opacity-50"
                    style={{ transform: 'rotateY(20deg) rotateX(-5deg) translateZ(-50px)' }}
                  />

                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-amber-400/20 blur-xl" />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-teal-400/20 blur-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-8 md:gap-16 mt-16 pt-10 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <BookOpen className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">100+</p>
                <p className="text-sm text-teal-200">함께 읽은 도서</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Users className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm text-teal-200">클럽 멤버</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Heart className="w-7 h-7 text-rose-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">10년</p>
                <p className="text-sm text-teal-200">함께한 시간</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-20 md:h-28"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120V80C120 100 240 110 360 100C480 90 600 60 720 50C840 40 960 50 1080 60C1200 70 1320 90 1380 100L1440 110V120H0Z"
              fill="#faf8f5"
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
          CTA SECTION - Join Community
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#faf8f5]">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-amber-100/40 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 lg:px-8">
          {/* Card container */}
          <div
            className="relative rounded-[2rem] p-10 md:p-16 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
              boxShadow: '0 25px 50px -12px rgba(13, 115, 119, 0.4)',
            }}
          >
            {/* Inner decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-teal-300/10 blur-3xl" />

            {/* Floating books decoration */}
            <div className="absolute top-10 right-10 w-16 h-24 bg-white/5 rounded-lg rotate-12 hidden md:block" />
            <div className="absolute bottom-10 left-10 w-12 h-18 bg-amber-400/10 rounded-lg -rotate-6 hidden md:block" />

            <div className="relative text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-white/90">Join Our Community</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
                책으로 연결되는
                <br />
                <span className="text-amber-300">따뜻한 커뮤니티</span>
              </h2>
              <p className="text-base md:text-lg text-teal-100 mb-12 max-w-lg mx-auto leading-relaxed">
                지금 유니클럽과 함께 독서 여정을 시작하세요.
                <br className="hidden md:block" />
                새로운 책, 새로운 사람들이 기다립니다.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/programs"
                  className="group inline-flex items-center gap-2 h-14 px-10 rounded-2xl bg-amber-400 text-teal-900 text-base font-bold shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 hover:bg-amber-300 transition-all duration-300"
                >
                  프로그램 참여하기
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/p/about-us"
                  className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  유니클럽 알아보기
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
