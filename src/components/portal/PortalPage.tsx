'use client'

import { useState, useEffect } from 'react'
import HeroCard from './HeroCard'
import ServiceList from './ServiceList'
import PortalFooter from './PortalFooter'

interface PortalStats {
  members: number
  programs: number
  heroImage: string
}

export default function PortalPage({ stats }: { stats: PortalStats }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* 헤더 */}
      <header className="px-6 md:px-12 py-6">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[#1a1a1a] text-sm tracking-[0.2em] font-medium">
              UNIPIVOT
            </span>
            <span className="text-[#999] text-xs">&mdash; PORTAL</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#999] tracking-wider">
            <span className="hidden md:block">SEOUL, KR</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </header>

      {/* 메인 카드 */}
      <div
        className={`transition-all duration-700 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <HeroCard members={stats.members} heroImage={stats.heroImage} />
      </div>

      {/* 서비스 리스트 */}
      <div
        className={`transition-all duration-700 delay-200 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <ServiceList />
      </div>

      {/* 푸터 */}
      <div
        className={`transition-all duration-700 delay-500 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <PortalFooter members={stats.members} programs={stats.programs} />
      </div>
    </div>
  )
}
