'use client'

import Link from 'next/link'
import { SocialIcons } from './SocialIcons'
import { ArrowDown, Users, BookOpen, Award } from 'lucide-react'

interface Props {
  stats?: {
    members: number
    completedPrograms: number
    totalParticipations: number
  }
}

export function HeroSection({ stats }: Props) {
  const scrollToContent = () => {
    const element = document.getElementById('programs')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/60 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
        {/* Social Links */}
        <div className="flex justify-center mb-8 animate-fade-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <SocialIcons variant="dark" size="md" />
        </div>

        {/* Title */}
        <p className="text-primary tracking-[0.3em] text-sm md:text-base uppercase mb-4 animate-fade-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          UNIPIVOT
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-fade-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          유 니 피 벗
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto animate-fade-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          남북청년이 함께 새로운 한반도를 만들어갑니다.
        </p>

        {/* Stats */}
        {stats && (
          <div className="flex justify-center gap-8 md:gap-16 mb-12 animate-fade-up opacity-0" style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-3xl md:text-4xl font-bold text-white">{stats.members}</span>
              </div>
              <p className="text-white/60 text-sm">회원</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-3xl md:text-4xl font-bold text-white">{stats.completedPrograms}</span>
              </div>
              <p className="text-white/60 text-sm">완료된 프로그램</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-3xl md:text-4xl font-bold text-white">{stats.totalParticipations}</span>
              </div>
              <p className="text-white/60 text-sm">총 참여</p>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <Link
            href="#programs"
            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            프로그램 둘러보기
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-medium transition-all duration-200 hover:bg-white/20"
          >
            유니피벗 소개
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
      >
        <ArrowDown className="w-6 h-6" />
      </button>
    </section>
  )
}
