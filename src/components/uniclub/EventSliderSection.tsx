'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Pause, Play, Sparkles } from 'lucide-react'
import Link from 'next/link'
import EventBanner from './EventBanner'
import { useSwipe } from '@/hooks/useSwipe'

type EventProgram = {
  id: string
  title: string
  slug: string
  type: string
  description: string | null
  image: string | null
  status: string
  startDate: string | Date | null
  endDate: string | Date | null
  recruitEndDate: string | Date | null
  location: string | null
  isOnline: boolean
  fee: number
  feeType: string
  _count: { applications: number; likes: number }
}

const TYPE_TABS = [
  { key: 'all', label: '전체' },
  { key: 'BOOK_CLUB', label: '독서모임' },
  { key: 'SEMINAR', label: '세미나' },
  { key: 'WORKSHOP', label: '워크숍' },
]

export default function EventSliderSection({ programs }: { programs: EventProgram[] }) {
  const [activeTab, setActiveTab] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filtered = activeTab === 'all'
    ? programs
    : programs.filter((p) => p.type === activeTab)

  const goTo = useCallback(
    (idx: number) => {
      setCurrentIndex(((idx % filtered.length) + filtered.length) % filtered.length)
    },
    [filtered.length]
  )

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex])
  const prev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex])

  const { handlers: swipeHandlers } = useSwipe({
    onSwipeLeft: next,
    onSwipeRight: prev,
  })

  // Reset index when tab changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeTab])

  // Autoplay at 5s
  useEffect(() => {
    if (!autoplay || filtered.length <= 1) return
    intervalRef.current = setInterval(next, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoplay, filtered.length, next])

  if (programs.length === 0) return null

  const current = filtered[currentIndex]
  if (!current) return null

  return (
    <section className="py-16 md:py-24 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 mb-4">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-rose-600 tracking-wide uppercase">Events</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">
              이벤트 & 프로그램
            </h2>
            <p className="text-stone-500 mt-2 text-sm md:text-base">
              새로운 프로그램과 이벤트를 만나보세요
            </p>
          </div>
          <Link
            href="/programs"
            className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto scrollbar-hide pb-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 h-10 px-6 rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-teal-300 hover:text-teal-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div
          className="relative"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
          {...swipeHandlers}
        >
          <div className="max-w-2xl mx-auto">
            <EventBanner
              key={current.id}
              slug={current.slug}
              title={current.title}
              description={current.description}
              image={current.image}
              status={current.status}
              startDate={current.startDate}
              endDate={current.endDate}
              location={current.location}
              isOnline={current.isOnline}
              feeType={current.feeType}
              applicationCount={current._count.applications}
              likeCount={current._count.likes}
            />
          </div>

          {/* Desktop Nav Arrows */}
          {filtered.length > 1 && (
            <>
              <button
                onClick={prev}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 items-center justify-center rounded-full bg-white shadow-xl shadow-stone-200/50 text-stone-600 hover:text-teal-600 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                aria-label="이전"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 items-center justify-center rounded-full bg-white shadow-xl shadow-stone-200/50 text-stone-600 hover:text-teal-600 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                aria-label="다음"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Dot Indicators + Play/Pause */}
        {filtered.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 p-2 rounded-full bg-white border border-stone-100">
              {filtered.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    idx === currentIndex
                      ? 'w-8 h-2.5 bg-gradient-to-r from-teal-500 to-teal-600'
                      : 'w-2.5 h-2.5 bg-stone-300 hover:bg-teal-300'
                  }`}
                  aria-label={`${idx + 1}번째 이벤트`}
                />
              ))}
            </div>
            <button
              onClick={() => setAutoplay(!autoplay)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-400 hover:text-teal-600 hover:border-teal-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label={autoplay ? '자동재생 일시정지' : '자동재생 시작'}
            >
              {autoplay ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
