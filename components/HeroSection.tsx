import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="bg-neutral-100 py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Badge */}
            <span className="inline-block bg-primary-light text-primary rounded-full px-4 py-1 text-sm">
              📚 독서모임 Uniclub
            </span>

            {/* Heading */}
            <h1 className="mt-4">
              함께 읽고, 함께 성장하는
              <br />
              독서모임
            </h1>

            {/* Subtext */}
            <p className="text-neutral-500 mt-4 text-lg max-w-md">
              매주 새로운 책과 함께 인사이트를 나누고,
              다양한 사람들과 깊이 있는 대화를 경험하세요.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/programs"
                className="bg-primary text-white px-6 py-3 rounded-card hover:opacity-90 transition-opacity"
              >
                프로그램 보기
              </Link>
              <Link
                href="/members"
                className="text-primary underline underline-offset-4 px-2 py-3 hover:opacity-80 transition-opacity"
              >
                멤버 소개 →
              </Link>
            </div>
          </div>

          {/* Right: Image Placeholder */}
          <div className="relative aspect-video rounded-hero shadow-card overflow-hidden bg-white">
            <Image
              src="/images/hero-placeholder.jpg"
              alt="독서모임 이미지"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
