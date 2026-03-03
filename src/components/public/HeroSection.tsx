import Link from 'next/link'
import Image from 'next/image'
import { SocialIcons } from './SocialIcons'
import { Users, BookOpen, Award, CheckCircle } from 'lucide-react'
import { HeroScrollButton } from './HeroScrollButton'

interface Props {
  stats?: {
    members: number
    completedPrograms: number
    totalParticipations: number
    totalBooks: number
  }
}

export function HeroSection({ stats }: Props) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20">
      {/* Background — local pre-optimized WebP, skipping _next/image server processing */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.webp"
          alt=""
          fill
          priority
          unoptimized
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAFA3PEY8MlBGQUZaVVBfeMiCeG5uePWvuZHI////////////////////////////////////////////////////2wBDAVVaWnhpeOuCguv/////////////////////////////////////////////////////////////////////////wAARCAAHAAoDASEAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAgT/xAAcEAABBAMBAAAAAAAAAAAAAAABAAIRMQMhMlH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AeaQzdGx4oyWTyUF//9k="
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-primary/30" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px] hero-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/60 rounded-full blur-[150px] hero-glow hero-glow-delay-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px] hero-glow hero-glow-delay-2" />
        </div>
      </div>

      {/* Content — rendered by server, visible immediately */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
        {/* Social Links */}
        <div className="flex justify-center mb-8 hero-fade-up" style={{ animationDelay: '0.1s' }}>
          <SocialIcons variant="dark" size="md" />
        </div>

        {/* Title */}
        <p
          className="text-primary tracking-[0.3em] text-sm md:text-base uppercase mb-4 hero-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          UNIPIVOT
        </p>
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 hero-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          유 니 피 벗
        </h1>
        <p
          className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto hero-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          남북청년이 함께 새로운 한반도를 만들어갑니다.
        </p>

        {/* Stats — 항상 공간 확보하여 CLS 방지 */}
        <div className="flex justify-center gap-8 md:gap-16 mb-12 hero-fade-up min-h-[72px]" style={{ animationDelay: '0.5s' }}>
          {stats && (
            <>
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
                  <span className="text-3xl md:text-4xl font-bold text-white">{stats.totalBooks}</span>
                </div>
                <p className="text-white/60 text-sm">읽은 책</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-primary" />
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
            </>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center hero-fade-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/club" className="btn-hero-cta">
            유니클럽
          </Link>
          <Link href="#programs" className="btn-hero-cta">
            프로그램 둘러보기
          </Link>
          <Link href="/about" className="btn-hero-cta">
            유니피벗 소개
          </Link>
        </div>
      </div>

      {/* Scroll Indicator — small client island */}
      <HeroScrollButton />
    </section>
  )
}
