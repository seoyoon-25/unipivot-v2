'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Pause, Play } from 'lucide-react'
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
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
              Events
            </p>
            <h2 className="text-2xl md:text-[26px] font-bold text-zinc-900 tracking-tight">
              이벤트 & 프로그램
            </h2>
          </div>
          <Link
            href="/programs"
            className="flex items-center gap-0.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            더보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 h-9 px-5 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeTab === tab.key
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg text-zinc-600 hover:text-zinc-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="이전"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg text-zinc-600 hover:text-zinc-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="다음"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Dot Indicators + Play/Pause */}
        {filtered.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {filtered.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    idx === currentIndex
                      ? 'w-6 h-2 bg-blue-600'
                      : 'w-2 h-2 bg-zinc-300 hover:bg-zinc-400'
                  }`}
                  aria-label={`${idx + 1}번째 이벤트`}
                />
              ))}
            </div>
            <button
              onClick={() => setAutoplay(!autoplay)}
              className="flex items-center justify-center w-7 h-7 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={autoplay ? '자동재생 일시정지' : '자동재생 시작'}
            >
              {autoplay ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
