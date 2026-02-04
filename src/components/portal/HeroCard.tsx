'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Users, ArrowRight } from 'lucide-react'
import { MAIN_SERVICE } from './data'

export default function HeroCard({ members, heroImage }: { members: number; heroImage: string }) {
  return (
    <section className="px-6 md:px-12 pb-16 md:pb-24">
      <div className="max-w-[1400px] mx-auto">
        <Link href={MAIN_SERVICE.link} className="group block">
          <div className="relative h-[480px] md:h-[520px] lg:h-[560px] rounded-[2rem] overflow-hidden bg-[#1a1a2e] shadow-2xl">
            {/* 배경 이미지 */}
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              unoptimized
              className="object-cover"
            />
            {/* 오버레이 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/80 via-[#252347]/60 to-[#1a1a2e]/70" />
            {/* 배경 장식 */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-[#C4A77D]/15 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[60%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            {/* 대형 넘버 배경 */}
            <span className="absolute top-8 left-8 text-white/[0.03] text-[200px] md:text-[300px] lg:text-[400px] font-black leading-none select-none pointer-events-none">
              01
            </span>

            {/* 콘텐츠 */}
            <div className="relative z-10 h-full p-8 md:p-12 flex flex-col justify-between">
              {/* 상단 */}
              <div className="flex items-start justify-end">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-white/40 text-xs tracking-[0.15em] uppercase block text-right">
                      {MAIN_SERVICE.subtitle}
                    </span>
                    <span className="text-white/60 text-xs block text-right">Since 2015</span>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#FF6B35]/30 to-[#FF6B35]/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-[#FF6B35]" />
                  </div>
                </div>
              </div>

              {/* 중앙 타이틀 */}
              <div className="flex-1 flex flex-col justify-center items-end py-8">
                <h1 className="text-white text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold tracking-tight leading-[0.9] text-right">
                  {MAIN_SERVICE.title}
                </h1>
                <p className="text-white/40 text-base md:text-lg lg:text-xl mt-4 max-w-lg leading-relaxed text-right">
                  {MAIN_SERVICE.description}
                </p>

                {/* 해시태그 */}
                <div className="flex flex-wrap justify-end gap-2 mt-6">
                  {MAIN_SERVICE.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 bg-white/[0.08] backdrop-blur-sm rounded-full text-white/60 text-sm border border-white/[0.05]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 하단: 바로가기 버튼 + 통계 */}
              <div className="flex items-end justify-between">
                <div className="inline-flex items-center">
                  <span className="px-8 md:px-10 py-4 md:py-5 bg-[#FF6B35] text-white font-bold rounded-full text-base md:text-lg group-hover:bg-[#E55A2B] transition-colors">
                    홈페이지 바로가기
                  </span>
                  <div className="w-14 h-14 md:w-16 md:h-16 -ml-5 rounded-full bg-[#FF6B35] flex items-center justify-center group-hover:bg-[#E55A2B] group-hover:scale-110 transition-all">
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* 우측 통계 */}
                <div className="hidden md:flex items-center gap-8 text-white/40">
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-white/80">
                      {members}
                    </p>
                    <p className="text-xs">Members</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-white/80">
                      {MAIN_SERVICE.stats.years}
                    </p>
                    <p className="text-xs">Years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 호버 효과 */}
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </Link>
      </div>
    </section>
  )
}
